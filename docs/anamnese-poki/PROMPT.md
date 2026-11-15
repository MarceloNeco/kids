# Anamnese: Bolinho de Chuva × Poki — prompt para o Claude in Chrome

> Cole tudo abaixo da linha no Claude in Chrome (modelo recomendado: **Opus**). As imagens citadas estão públicas em
> https://github.com/MarceloNeco/kids/tree/main/docs/anamnese-poki/telas e em `docs/referencias/`.

---

Você vai fazer uma **anamnese competitiva** do meu site de jogos infantis, o **Bolinho de Chuva**, comparando com o
**Poki** (poki.com). Trabalhe navegando no Chrome, com calma, e me entregue artefatos bem organizados. Responda **em
português do Brasil, simples, sem jargão** (eu não sou desenvolvedor). Você não tem contexto nenhum sobre mim: tudo o que
precisa está aqui e nos links.

## 1. Quem sou e o que é a plataforma

- Sou o Marcelo, dono da **SolverONE** (solverone.com.br), uma plataforma de apps feitos com IA (Claude Code), publicados de
  graça no GitHub Pages. Apps irmãos: **RootifyONE** (painel de administração: liga/desliga recursos de cada app, planos,
  feedback), **ArchONE** (arquitetura), **EaglePlanONE** (roadmap), **AssistONE** (assistente dentro dos apps).
- Regras da plataforma que valem para o que você propuser: textos em **PT (Brasil), EN (EUA) e ES (Espanha)** com tradução
  humanizada; nenhum segredo/chave no código; LGPD (aqui com cuidado redobrado: **público infantil**); funcionar em celular,
  tablet (inclusive **tablet Amazon Fire bem antigo**), computador e **TV** (navegador da TV LG, controle remoto).
- Tecnologia de hoje (restrição importante para as sugestões): **HTML + JavaScript puro, sem framework e sem build**,
  arquivos estáticos no GitHub Pages, funciona **sem internet** depois de aberto (service worker que só troca de versão
  quando a nova chegou inteira). Supabase só para jogos em rede (2 celulares). Sem servidor próprio. Bibliotecas usadas:
  Three.js (3D), MediaPipe (câmera/corpo), Tesseract (OCR em outro app).

## 2. O Bolinho de Chuva (meu site)

- Endereço: **https://solverone.com.br/kids/** · Código: **https://github.com/MarceloNeco/kids** (público; leia o
  `README`/`CLAUDE.md`, o `ARQUITETURA.md`, o `PENDENCIAS.md` e o `LEIA-ME.md` de cada pasta de jogo).
- Marca: Bolinho de Chuva (EN: Rainy Day Donuts · ES: Buñuelos de Lluvia). **Sem cadastro, sem anúncio, sem compra.**
- Diferenciais que já existem: **jogar com o corpo pela câmera** (sem gravar nada), **TV com o celular de controle**,
  2 jogadores, **inclinar o celular**, **funciona sem internet** e instala como app (ícone na tela inicial), rádio
  "Bolinho FM" com a biblioteca de músicas gravadas (licença livre), três idiomas escolhidos uma vez na estante.
- Estante (página inicial) com cartões compactos: ícone, nome, "? ⌄" que abre a explicação, ícones do que o jogo usa,
  ⬇ instalar e Jogar. Telas: `telas/estante-1-lista.png`, `telas/estante-2-cartao-aberto.png`. Próxima versão desejada (protótipo
  do Gemini, só orientação): `docs/referencias/2026-11-15-gemini-estante-*.png`.
- No backlog (ainda não feito): degustação de X dias, depois login, planos (gratuito com alguns jogos ligados), e licença
  que se renova ao ficar online (offline por mais de 7 dias pede para conectar). Tudo controlado pelo RootifyONE.

### Os jogos de hoje (16)

- **Bagunçolândia** (Mayhemland) — /kids/baguncolandia/ — TV, câmera/corpo, 2 jogadores — frutas, doces e personagens voam na TV e você corta, pega, chuta, pula e abaixa com o corpo; boneco personalizável; ou no dedo no celular.
- **Peluqueria** — /kids/peluqueria/ — TV, câmera/corpo, 2 jogadores — coroa, bigode ou peruca desce sobre o bicho e você toca na hora certa.
- **Dança na Sala** (Living Room Dance) — /kids/danca-na-sala.html — precisa de internet — TV toca música do YouTube e mostra quem dança, com neon e placar de energia; o celular filma e comanda.
- **Vruuum!** — /kids/vruuum/ — TV, câmera, inclinar, 2 jogadores — corrida de carrinho (cones, lama, estrelas, turbo de arco-íris, rampas; praia, floresta, doces, neve, cidade neon).
- **Purpurina** — /kids/purpurina/ — TV — vestir e maquiar (detalhe na seção 4).
- **Rabiscolândia** — /kids/rabiscolandia/ — TV, câmera — desenhar, colorir, pintar por números, adesivos animados; desenhar com a mão na frente da câmera.
- **Campo Minado** (Garden Sweeper) — /kids/campo-minado/ — jardim com ouriços dormindo.
- **Enigmatic** — /kids/enigmas/ — ligar com giz o que combina; charadas, sequências e rimas (3 anos ao difícil).
- **Labirinto** (Maze) — /kids/labirinto/ — labirinto novo a cada vez, quadrado/redondo/colmeia, em 3D.
- **Mão na Massa** (My Little Big Chef) — /kids/cozinha/ — receita, sair pela vila para pegar ingredientes, cozinhar; 12 receitas, voz da avó Dona Cida.
- **AQUA** — /kids/aqua/ — despejar líquidos coloridos até cada frasco ter uma cor; fases infinitas; Cubo d'Água 3D.
- **GLUB GLUB** — /kids/glub-glub/ — pescaria com o Juca e a Lili; sozinho ou em dois.
- **Batalha Naval** (Sea Battle) — /kids/batalha-naval/ — 2 a 4 pessoas, cada uma no seu celular, ou contra o computador.
- **H-rraaa** — /kids/a-garra/ — máquina de pegar bichinho em 3D.
- **Quem é?** (Who Is It?) — /kids/quem-e/ — a meleca adivinha o personagem (1.600+); Duelo de Caras para dois.
- **Contador de Histórias** (Storyteller) — /contador-de-historias/ — histórias para dormir, ler e ouvir, e criar com os nomes da família.

Telas de alguns: `telas/purpurina-1-inicio.png`, `telas/purpurina-2-estudio.png`, `telas/vruuum-1-inicio.png`,
`telas/aqua-1-inicio.png`, `telas/h-rraaa-1-inicio.png`, `telas/peluqueria-1-inicio.png`.

**Minha autocrítica:** o visual está **infantil demais e feio** (desenhos simples), principalmente a personagem da
Purpurina. Os jogos do Poki têm arte muito mais bonita. Quero entender por quê e como chegar lá.

## 3. Regras para você (importante)

1. **Sem login.** O Poki se joga sem conta. Se aparecer **qualquer** tela de login, cadastro, pagamento ou idade que
   exija dados, **pare e me avise** ("preciso que você faça login aqui") — não crie conta, não digite e-mail nem senha.
2. Não clique em anúncios, não instale nada, não aceite downloads. Cookies: recuse os não necessários.
3. **Nada de copiar.** O objetivo é **aprender** (gêneros, mecânicas, ritmo, telas, qualidade visual) e propor ideias
   **originais** para o meu site, que é público. Não proponha reproduzir um jogo específico (nome, personagens, arte,
   música, fases ou visual). Mecânica e gênero (ex.: "vestir personagem", "salão de cabelo") são livres; a minha versão
   precisa ter nome, personagens, arte e jeito próprios.
4. Jogue de verdade alguns minutos em cada jogo que analisar (no mínimo o começo e a primeira fase), no tamanho de
   celular quando der (janela estreita) e no tamanho normal.
5. Anote fatos, não chutes: quando não souber (ex.: como o Poki ganha dinheiro num jogo), diga "não vi".

## 4. Foco principal: Purpurina vira o "app de moda" completo

Hoje a Purpurina tem (leia `purpurina/LEIA-ME.md`): personagem (pele, menina/menino, rosto, nariz, olhos, cabelo, mechas),
maquiagem com pincel que vai até o rosto (base, blush, sombra, delineado, cílios, unhas, batom, glitter, adesivos),
roupas (vestidos, blusas, saias, calças, estampas, sapatos), joias, acessórios, 8 cenários, zoom automático, girar a
personagem, foto para salvar/compartilhar, guardar até 30 looks, desfile com plateia, jurados e confete, 10 desafios
temáticos com dicas e estrelas, TV com o celular de controle, música do YouTube/Spotify.

**Não quero um jogo separado para cada coisa.** Quero que a Purpurina tenha "salas" dentro dela. No Poki, procure e
analise os jogos de **vestir, maquiagem, salão de beleza, cabelo, unhas, estilo/moda e "makeover"**. Os que eu lembro
(os nomes podem estar um pouco diferentes, procure pela busca do site): **"Snap Style"**, **"Super Dress Up"**,
**"Beauty Salon"**, **"Diva Hair Salon"**, **"Vortelos Dress Up"**. Inclua outros parecidos que achar bons (mire em 8 a 12).

Para cada um: o que a criança faz (passo a passo), quantas escolhas, como mostra as opções no celular, o que dá
recompensa, desafios/missões, foto/compartilhar, progressão (desbloqueios), estilo de arte (proporções, sombras,
contorno, paleta, animação), sons, tempo de uma partida, anúncios. Depois proponha:

- **Mapa da nova Purpurina**: salas (ex.: provador, salão de cabelo, unhas, maquiagem, estúdio de foto, passarela,
  desafios), como se navega entre elas e o que já existe vs. o que falta;
- **Direção de arte** para a personagem e as roupas ficarem bonitas (com exemplos do que observou, sem copiar), e um
  caminho possível para mim: desenho vetorial em camadas (SVG), imagens geradas por IA num estilo único e consistente,
  ou 2D com "rig" (partes que se mexem). Diga prós e contras de cada um para HTML puro e tablet velho.

## 5. Outros jogos e o site como um todo

- **Mapeie o portfólio do Poki**: categorias, quantos jogos em cada uma, os mais populares/em destaque, e quais têm
  versão para criança pequena. Faça uma tabela "Gênero no Poki → Tenho? (qual jogo meu) → Vale trazer? (sim/não e por quê)".
- **Vruuum! × corridas do Poki**: compare 3 a 5 jogos de corrida (controle, sensação de velocidade, pistas, carros,
  progressão, 2 jogadores, visual).
- **Quebra-cabeças e casuais** (AQUA, Labirinto, Campo Minado, H-rraaa, GLUB GLUB, Batalha Naval): 1 a 2 parecidos do
  Poki para cada, o que eles fazem melhor.
- **Funções do site Poki**: página inicial, busca, categorias, recomendações, "jogados recentemente", favoritos,
  avaliações, multijogador, idiomas, app/instalação, tela cheia, como ele lida com celular e com computador, anúncios e
  monetização (o que conseguir ver), uso de IA, contas e planos (se houver), segurança para crianças. Compare com o que
  eu tenho e com o meu backlog (degustação, login, planos, licença).

## 6. O que você me entrega (artefatos)

Faça **um documento principal** (Artifact) em português, com:

1. **Resumo em 10 linhas**: onde o Poki está muito na frente, onde eu já sou diferente/melhor, e as 5 primeiras coisas
   que eu deveria fazer.
2. **Tabela comparativa** (notas de 1 a 5 com uma frase de justificativa): visual/arte, animação, som/música, facilidade
   para criança, profundidade/diversão, progressão/recompensa, celular, TV, offline, multijogador, idiomas, segurança
   infantil, velocidade para abrir.
3. **Mapa de gêneros** (tabela da seção 5) e **lista de jogos analisados** com link, gênero e 3 aprendizados de cada.
4. **Purpurina 2.0**: o mapa das salas, as funções novas em ordem de prioridade e a direção de arte.
5. **Backlog priorizado** para todo o Bolinho: item, por quê, impacto (alto/médio/baixo), esforço (P/M/G), jogo afetado.
6. **Prompt final, pronto para eu colar no meu Claude Code** (que mexe no repositório `MarceloNeco/kids`), pedindo para
   implementar a primeira entrega da Purpurina 2.0 — curto, objetivo, com critérios de pronto e lembrando as regras:
   três idiomas, funciona offline e no tablet velho, nada copiado, testes antes de publicar.

Se o trabalho ficar grande, entregue por partes (primeiro o resumo e a tabela; depois a Purpurina; depois o resto), sempre
dizendo o que falta. Se travar em login ou bloqueio, pare e me diga exatamente onde.
