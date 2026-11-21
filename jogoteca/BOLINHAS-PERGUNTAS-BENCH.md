# Bolinhas da Angústia — bench das perguntas (21/Nov/2026)

Pedido do dono: "Faz um bench extenso de como são as perguntas, com vários temas (...) Mas não de fazer conta. Perguntas que
variam, vai ficando mais difícil a cada vez que os pontos vão aumentando." E: "A dificuldade é somente associada ao nível de
perguntas" — a física das bolinhas é a mesma para todo mundo; o nível e a escada só mudam QUAIS perguntas aparecem.

Este documento junta o que se aprende olhando game shows de perguntas e jogos de quiz para a família (de TV, de tabuleiro e
de aplicativo), escrito com as nossas palavras, e vira a régua do banco `jogos/bolinhas-perguntas.js`.

## 1. Como os quizzes de família organizam as perguntas

- **Temas fixos e reconhecíveis.** Os jogos de tabuleiro de conhecimentos gerais dividem tudo em 6 a 8 categorias com cor e
  ícone (geografia, entretenimento, história, artes e literatura, ciência e natureza, esportes e lazer); os game shows de TV
  usam ainda mais temas e alternam a cada pergunta. O jogador gosta de ver o tema antes da pergunta: dá um segundo para
  "entrar no assunto". No Bolinhas, cada pergunta mostra o chip do tema.
- **Formatos curtos, que cabem numa linha ou duas:**
  - "Qual destes…?" (escolher entre opções do mesmo tipo: 4 animais, 4 países);
  - "Qual é o maior / o menor / o mais rápido / o primeiro…?";
  - "Como se chama…?" (nome de coisa, de pessoa, de lugar);
  - "Verdadeiro ou falso" — ótimo para 2 opções (Queda Livre): uma afirmação curta e clara;
  - "Complete…" / "Qual é o contrário de…?" / "Qual destas palavras…?" (língua e palavras);
  - "Onde fica…?" / "De que país é…?" (geografia, comida, música).
- **Perguntas de lista longa ficam de fora** ("cite 3…"), porque o jogo é de toque e o tempo é curto.
- **Uma ideia por pergunta.** Nada de "e também"; nada de negação dupla ("qual NÃO é…" só com muito cuidado).

## 2. Como sobe a dificuldade

A régua dos game shows é quase sempre a mesma: começa com o que todo mundo da casa sabe e termina no detalhe que só quem se
interessa pelo assunto sabe. Três alavancas, nesta ordem:

1. **Quanto o fato é comum** — aprendido em casa e na escola pequena (cores, bichos, partes do corpo) → visto na escola
   grande (capitais, planetas, invenções) → detalhe de quem gosta do tema (compositores, recordes, nomes técnicos).
2. **Quão parecidos são os distratores** — fácil: só uma opção faz sentido; difícil: as quatro são do mesmo tipo e
   plausíveis (quatro planetas, quatro pintores).
3. **Quantas opções** — 2 (Queda Livre) é mais fácil que 4 (Sem pressa) para o mesmo fato.

### A régua em 5 faixas

| Faixa | Quem acerta | Exemplo |
|---|---|---|
| 1 — muito fácil | criança pequena, com ajuda da família | "Que animal faz miau?" · "Com que órgão enxergamos?" |
| 2 — fácil | criança de escola | "Qual planeta tem anéis bem famosos?" · "Sushi é um prato de qual país?" |
| 3 — médio | adolescente ou adulto atento | "Qual oceano fica entre a América e a Europa?" · "Quem pintou a Mona Lisa?" |
| 4 — puxado | adulto que lê e viaja | "Qual é o menor país do mundo?" · "Quantas câmaras tem o coração?" |
| 5 — difícil | quem gosta do tema | "Qual foi o primeiro satélite artificial?" · "Quem descobriu a penicilina?" |

### Como a faixa sobe no jogo

- A **escada de pontos** puxa a faixa para cima: no começo da rodada, perguntas das faixas mais baixas; no alto da escada,
  as faixas 4 e 5. (Janela de 2 faixas: degraus 0–1, 2–3, 4–5 e a 🏆 sobem a janela uma faixa de cada vez.)
- O **nível da Jogoteca** só desloca o começo: fácil começa na janela 1–2, médio em 2–3 e difícil em 3–4. Nada mais muda
  com o nível: nem o tempo de leitura, nem o tamanho ou a física das bolinhas.
- **Temas variados em sequência:** o jogo evita repetir o tema das 2 últimas perguntas.
- **Sem repetir:** nunca a mesma pergunta na mesma rodada, e o aparelho lembra as últimas 150 que apareceram para não
  voltarem logo na rodada seguinte.

## 3. Distratores (as opções erradas)

- **Do mesmo tipo que a certa** (se a certa é um país, as outras também são países; se é um número, números perto).
- **Plausíveis para quem não sabe, claramente erradas para quem sabe.** Nada de pegadinha nem de "meio certo".
- **O primeiro distrator é o melhor:** na Queda Livre (2 opções), a pergunta de 4 opções vira uma de 2 com a certa e o
  primeiro distrator da lista. Por isso, no banco, a ordem é sempre: certa, melhor distrator, os outros dois.
- **Nada de "todas as anteriores" / "nenhuma".**
- **Mesmo tamanho e mesmo jeito de escrever** que a certa (a mais comprida não pode "entregar" a resposta).

## 4. O que NÃO entra

- **Fazer conta** ("quanto é 7 × 8", "metade de…", "quanto falta para…"). Número pode aparecer como FATO conhecido
  (quantos dias tem a semana, quantos graus tem um ângulo reto), nunca como cálculo.
- **Fato discutível ou que muda com o tempo** (recorde que pode cair amanhã, campeão do ano, "o mais famoso", invenções com
  dois inventores brigando pela fama, números diferentes conforme a fonte).
- **Coisa muito recente ou datada** (série do momento, música da moda), e cultura popular que só um país conhece.
- **Polêmica, política, religião, guerra contada em detalhe, medo, nojo ou violência.** Nada que constranja uma criança.
- **Marca comercial** como resposta ou propaganda. Personagens clássicos de desenho e de livro podem aparecer como fato de
  cultura geral (quem é quem, de que cor é), sem logotipo nem imagem.
- **Resposta com mais de uma certa.** Cada pergunta foi conferida para ter uma só resposta certa nos 3 idiomas.

## 5. Equilíbrio de temas

15 temas, cada um com perguntas nas 5 faixas sempre que o tema permite:

História · Geografia · Ciências · Animais · Esportes · Cinema e desenho · Música · Comida · Línguas e palavras · Corpo humano ·
Matemática sem conta · Dia a dia · Artes · Espaço · Tecnologia.

"Cultura popular" fica em Cinema e desenho, Música e Esportes, sempre com clássicos que atravessam gerações.

## 6. Três idiomas

- Toda pergunta tem PT (Brasil), EN (EUA) e ES (Espanha), com tradução humanizada (móvil, ordenador, frigorífico, zumo…).
- Nome próprio igual nos três quando é igual ("Saturno"/"Saturn" muda; "Origami" não).
- Em Línguas e palavras, a pergunta se adapta ao idioma do jogo ("o contrário de *quente* / *hot* / *caliente*"), com a mesma
  ideia e uma só resposta certa em cada idioma.

## 7. Formato no banco

`{ id, cat, d (faixa 1–5), q: [pt, en, es], o: [opções], c }` — 4 opções servem às duas modalidades (na Queda Livre, a certa
e o primeiro distrator); 2 opções (verdadeiro ou falso e afins) servem só à Queda Livre. Os números do banco por tema e por
faixa ficam no teste (`teste/bolinhas.test.js`) e na entrega da versão.
