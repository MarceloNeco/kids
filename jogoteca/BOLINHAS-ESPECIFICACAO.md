# Bolinhas da Angústia — especificação do dono

## Decisão do dono de 21/Nov/2026 (vale por cima do que está abaixo)

Palavras do dono: "você não tem que responder só, não tem que ter dois jogadores, não precisa disso, tá? (...) Pode ser,
enfim, modalidades de jogo. Uma é essa que eu gostei até, de você responder enquanto a bolinha tá caindo, com duas opções.
E uma que não tem tempo, que você responde entre quatro opções (...) E aí você escolhe onde que as bolinhas estão antes de
responder as perguntas. E aí depois que você responder, se tá errado ou certo, o verde ou vermelho, ele cai lá para tirar ou
te dar ponto."

- **Uma pessoa joga sozinha.** Saíram o modo Solo + Parceiro (os parceiros virtuais com afinidades — nenhum personagem
  parceiro fica no jogo, nem o tio de bigode que o dono pediu para tirar), o modo Dois na mesma tela (passar o aparelho), a
  Sala de Isolamento, as Fases 2 e 3, o Contrato e a revelação.
- **Duas modalidades**, escolhidas em cartões na tela de começo (o ▶ Começar fica sempre à vista, com a última escolhida):
  - **⏱ Queda Livre** (a de antes, que o dono gostou): 5 perguntas de 2 opções; três bolinhas brancas caem das zonas 1, 4 e
    7 e é preciso responder antes que a primeira chegue lá embaixo. Acertou: verdes, somam. Errou (ou não respondeu):
    vermelhas, descontam.
  - **🧘 Sem pressa** (EN "No Rush", ES "Sin prisa"): 5 perguntas de 4 opções, **sem tempo**. Lida a pergunta, a pessoa
    escolhe 3 zonas no alto (pode repetir; ↩ desfaz) e só então responde. Acertou: as bolinhas caem verdes e somam o valor
    da canaleta; errou: caem vermelhas e descontam.
    Depois do teste do dono no celular ("não sei onde é o botão de start", 21/Nov/2026, 0.4.2): 2 passos bem claros no
    painel de baixo — **1/2 "Onde as bolinhas vão cair?"** (a pergunta e 7 botões grandes numerados como as zonas; tocar
    na parede também vale; ↩ desfaz; 🎲 sorteia as que faltam; nenhuma opção à vista) e **2/2 "Agora responda!"** (os
    botões somem e aparecem as 4 opções). O selo "Ao vivo" fica no piso, longe das zonas, e o painel deixa livre o canto
    da bolinha 🎵 da música.
  - No fim de cada rodada, o placar (saldo, acertos, recorde por modalidade e nível). O saldo nunca fica abaixo de zero.
    Os valores das 15 canaletas são os da antiga Fase 1. O nível da Jogoteca escolhe só a dificuldade das perguntas
    (desde a 0.4.3 o tempo para ler é um só, 6 s).
- **Escada de pontos com portos seguros** (dono, 21/Nov/2026: "tinha que ter evolução por pontos, até você atingir (...) que
  tem os portos seguros"; mecânica livre de game show, com nomes e visual próprios), nas duas modalidades (0.4.2):
  - 6 degraus até a 🏆 meta. Queda Livre: 1.000 · 4.000 🛟 · 8.000 · 14.000 🛟 · 20.000 · 🏆 30.000. Sem pressa: 2.000 ·
    6.000 🛟 · 12.000 · 22.000 🛟 · 35.000 · 🏆 50.000 (a Queda Livre sobe mais devagar, com as zonas 1, 4 e 7 fixas). Medido
    com 400 rodadas simuladas na física do jogo: acertando 3 de cada 4, chega-se à meta em cerca de metade das rodadas, em 8 a
    12 perguntas.
  - **Portos seguros** no 2º e no 4º degraus: alcançou, fica garantido 🔒 — as vermelhas nunca derrubam o saldo abaixo do
    último porto alcançado. Degrau novo e porto travado têm aviso, som e brilho (sem animação com "reduzir movimento").
  - A rodada não para mais em 5 perguntas: segue até a **meta (vitória)**, até **12 perguntas** ou até **3 erros seguidos**
    (explicado no ❓). As perguntas ficam mais difíceis conforme sobe a escada; o nível da Jogoteca muda o começo.
  - A escada fica à vista: deitado/computador, numa coluna ao lado da parede (meta no alto); no celular em pé, numa faixa de
    6 degraus embaixo do placar. No fim, o placar mostra o degrau alcançado, o porto garantido e o recorde.
- **Sorte e saber** (dono, 21/Nov/2026, 0.4.3: "As bolinhas caindo têm que ser verdadeiramente aleatórias, questões de
  física. A dificuldade é somente associada ao nível de perguntas. Faz um bench extenso de como são as perguntas, com vários
  temas (...) Mas não de fazer conta. Perguntas que variam, vai ficando mais difícil a cada vez que os pontos vão aumentando."):
  - A queda é só física: nada escolhe a canaleta antes nem empurra para um valor. Cada bolinha começa com um desvio
    minúsculo (posição e velocidade) vindo do acaso de verdade do aparelho (crypto); só os testes usam semente. Um teste
    estatístico confere que muitas quedas da mesma zona se espalham em sino, sem canaleta viciada.
  - O nível (fácil, médio, difícil) e a escada mudam só as perguntas: tempo de leitura único (6 s), bolinhas e física iguais.
  - Banco de 325 perguntas em 15 temas e 5 faixas (régua, formatos e cuidados em `BOLINHAS-PERGUNTAS-BENCH.md`). A faixa
    sobe com a escada (janela de 2 faixas; no alto, 4–5); o nível só desloca o começo (fácil 1–2, médio 2–3, difícil 3–4).
    Temas variados em sequência, sem repetir na rodada, e o aparelho lembra as 150 últimas para não voltarem logo.
- Mais pedidos do mesmo dia, com fotos do programa de TV como referência de estilo (sem nome, logotipo ou marca dele):
  música de **tensão e emoção** durante a queda, do soltar até a última bolinha bater no fundo, e depois a trilha volta do
  ponto onde parou; **câmera do ponto de vista da bolinha** (começa colada nela, passando pelos pinos, e depois acompanha);
  **acompanhamento bem mais perto** e a **bolinha um pouco maior** (raio 14, com a gravidade recalibrada para a queda
  continuar em ~5,8 s); **painel de LED animado** atrás dos pinos (quadradinhos que acendem em ondas: azul no normal, verde
  no acerto, vermelho no erro) e um **arco de luz** em volta da parede. Com "reduzir movimento", sem câmera da bolinha e sem
  câmera lenta.

---

## Especificação original (19/Nov/2026)

Pedido do dono: "Dentro do jogoteca, o The Wall não pode chamar The Wall, mas sim Bolinhas da Angústia". Texto do dono,
como veio (duas partes: a descrição do programa e a especificação de game design):

---

Bolinhas da Angústia é um game show de perguntas e respostas baseado em estratégia, conhecimentos gerais e física aplicada (probabilidade e gravidade), centrado em uma parede vertical monumental que funciona como um tabuleiro gigante de Plinko (ou Pachinko).

## 1. Cenografia, Design e Arquitetura Visual
- A Parede: uma estrutura vertical imponente, com cerca de 12 metros de altura (equivalente a um prédio de quatro andares), repleta de dezenas de pinos metálicos dispostos em fileiras intercaladas.
- Zonas de Lançamento: no topo da parede existem 7 canaletas numeradas de 1 a 7 (da esquerda para a direita), por onde as bolinhas são liberadas.
- Canaletas de Premiação: na base da parede existem 15 compartimentos verticais com valores monetários distintos. Os valores menores ficam concentrados nas extremidades (cantos esquerdo e direito) e os valores mais altos ficam posicionados na região central ou próximos ao centro-direita.
- Esferas Luminosas: bolinhas de aproximadamente 30 cm de diâmetro com iluminação interna em LED que muda de cor: Branca (neutra, lançada no início ou em momentos de definição); Verde (ganho: soma o valor da canaleta ao saldo da dupla); Vermelha (perda: subtrai o valor da canaleta do saldo).
- Palco e Iluminação: estética futurista e dramática, tons de azul-escuro, ciano e roxo nos momentos de tensão, mudando para verde vibrante em acertos ou vermelho intenso em erros. No centro do palco, diante da parede, fica a bancada onde um dos participantes permanece; no andar superior ou nos bastidores, há uma cabine à prova de som (Sala de Isolamento) com tela de monitoramento e botão de resposta.

## 2. Estrutura de Participação
Disputado por uma dupla com forte vínculo pessoal (familiares, amigos ou casais), em dois papéis:
- O Jogador do Palco: fica diante da parede, decide onde lançar as bolinhas e o destino das jogadas extras.
- O Jogador da Sala de Isolamento: isolado, sem contato visual ou auditivo com o palco, sem saber o saldo acumulado, respondendo às perguntas com base apenas em sua intuição e na leitura das alternativas.

## 3. Regras e Dinâmica das Fases
- Fase 1 — Queda Livre: os dois no palco; 5 perguntas com 2 opções. Lida a pergunta, três bolinhas brancas caem juntas das zonas 1, 4 e 7; a dupla trava a resposta antes que a primeira bolinha atinja uma canaleta. Acerto: bolinhas verdes, valores somados. Erro: vermelhas, valores subtraídos (o saldo nunca fica abaixo de zero).
- Fase 2 — A Separação: um vai para a Sala de Isolamento. Valores da base aumentam. Lançamento Verde Garantido: o do palco escolhe duas zonas para duas bolinhas verdes grátis. Perguntas (3 rodadas, 3 opções): o do palco vê só as opções (sem a pergunta) e escolhe uma zona (1 a 7) conforme a confiança no parceiro; o isolado vê a pergunta completa e responde; uma bolinha branca cai da zona escolhida e vira verde (acertou) ou vermelha (errou). Lances Extras (Duplo e Triplo): em certas perguntas, 2 ou 3 bolinhas da mesma zona. Lançamento Vermelho Obrigatório: no fim, duas bolinhas vermelhas das mesmas zonas das verdes iniciais.
- Fase 3 — Tudo ou Nada: igual à Fase 2, com 4 opções e valores maiores; começa com 4 verdes garantidas, 3 perguntas com zonas e multiplicadores, termina com 4 vermelhas obrigatórias das mesmas zonas das verdes iniciais.

## 4. O Dilema Final (O Contrato)
O do palco conhece o saldo real; o isolado não sabe nada das Fases 2 e 3. A Oferta: contrato com valor garantido (desempenho da Fase 1 + bônus fixo por pergunta acertada nas Fases 2 e 3). A Decisão do isolado: Assinar (garante o valor do papel) ou Rasgar (fica com o saldo do painel). Revelação: o isolado volta ao palco e revela a escolha.

## 5. Tensão e Psicologia
- Imprevisibilidade física: mesmo escolhendo a zona ideal, o ricochete nos pinos torna a trajetória caótica, com reviravoltas até o último segundo.
- Assimetria de informação: o do palco julga o conhecimento do parceiro olhando palavras isoladas; o isolado decide o destino da dupla sem saber se o parceiro teve sorte ou azar.

---

# Especificação de Game Design e Arquitetura Técnica

## 1. Visão Geral
Game show digital de trivia, estratégia e física probabilística baseado em tabuleiro vertical Plinko/Pachinko, com assimetria de informação entre dois participantes (ou humano + parceiro IA / segundo jogador local ou remoto).

## 2. Direção de Arte
- Tabuleiro vertical ocupando 65% a 75% da tela (portrait no celular; widescreen com painéis laterais de HUD no computador).
- Pinos em grade triangular intercalada, metálicos com brilho especular e microanimação de impacto (pulso luminoso e leve vibração sonora).
- 7 zonas de lançamento no topo, com indicador luminoso de seleção, comportas animadas e feixe vertical sutil de mira.
- 15 canaletas na base, separadas por divisórias metálicas de pontas arredondadas (ricochete no último milímetro). Valores menores nas pontas (slots 1, 2, 14, 15), máximos no centro e centro-direita (slots 8, 10, 12). Valores se multiplicam entre as fases.
- Bolinhas com efeito neon interno, rastro de movimento e física rígida com restituição calibrada. Branca (neutra), Verde (explosão de partículas e som ascendente; soma), Vermelha (pulso dramático e grave; subtrai, piso zero).
- Paleta base azul-cobalto, ciano elétrico e roxo escuro. Cenário reativo: neutro/escolha azul e ciano; tensão/queda âmbar pulsante com batida de coração acelerando conforme a bolinha chega na base; acerto verde esmeralda; erro / vermelha obrigatória carmesim.

## 3. Modos
- Dois jogadores (passa-e-joga local ou online): um no Palco, outro na Sala de Isolamento (telas independentes ou ocultação de tela entre turnos).
- Solo + Parceiro IA (modo principal): humano no Palco; parceiro virtual com perfil de afinidades visível (ex.: forte em História e Cinema; fraco em Esportes e Química) responde na Sala de Isolamento.
- Solo Invertido: humano isolado, sem ver saldo nem quedas, responde e decide o Contrato.

## 4. Regras e Máquina de Estados
- Fase 1 (Queda Livre): 5 perguntas com 2 alternativas. Valores: [1, 500, 100, 2000, 10, 1000, 5, 10000, 1, 5000, 10, 2500, 100, 1500, 1]. 3 bolinhas brancas das zonas 1, 4 e 7; resposta antes da primeira bolinha tocar o fundo de qualquer canaleta (sem resposta = erro). Acerto soma as 3 canaletas; erro subtrai (saldo = max(0, saldo − perda)). Se ao fim da Fase 1 o saldo for 0, fim de jogo.
- Fase 2 (A Separação): valores [1, 2500, 500, 10000, 50, 5000, 25, 50000, 1, 25000, 50, 12500, 500, 7500, 1]. 2 verdes garantidas em zonas escolhidas (memorizadas). 3 perguntas com 3 alternativas: Palco vê só as alternativas e a categoria implícita, escolhe a zona; Lance Duplo opcional na 2ª pergunta, Triplo na 3ª; parceiro responde; bolinhas caem e ficam verdes ou vermelhas. No fim, 2 vermelhas obrigatórias das zonas memorizadas.
- Fase 3 (Tudo ou Nada): valores [1, 10000, 2500, 50000, 250, 25000, 100, 150000, 1, 75000, 250, 35000, 2500, 15000, 1]. 4 verdes garantidas em zonas escolhidas (memorizadas). 3 perguntas com 4 alternativas (mesma mecânica, Duplo na 2ª e Triplo na 3ª). No fim, 4 vermelhas obrigatórias das zonas memorizadas.
- Fase 4 (Contrato): valorContrato = saldoFinalFase1 + acertosFase2 × 5.000 + acertosFase3 × 10.000. O isolado vê só o contrato; ASSINAR (animação de caneta) leva o valor do contrato; RASGAR (animação de rasgar ao meio) leva o saldo do painel (mesmo zero). Revelação final: saldo do painel × valor do contrato, lado a lado.

## 5. Física e Software
- Matter.js ou física leve própria círculo-círculo.
- Gravidade calibrada para a queda do topo à base durar de 4,5 a 6,5 s.
- Restituição: bolinhas 0,55 a 0,68; pinos 0,75 (sem ficar presa em laço).
- Jitter: deslocamento horizontal aleatório de ±1,5 a ±3 px ao liberar, para duas bolinhas da mesma zona não repetirem o caminho.
- Sensores no fundo de cada canaleta: o valor trava quando o centro da bolinha cruza a linha.
- Estado do jogo (gameState): phase, round, bankBalance, contractValue, phase1EndBalance, correctAnswersPhase2/3, memorizedZonesPhase2/3, isMultiplierActive, contractDecision; boardConfig com dropZones 7, slotsCount 15 e slotValuesByPhase (as três tabelas acima).
- Pergunta: { id, category, difficulty, question, options, correctIndex }.
- Parceiro IA: afinidade por categoria de 0,2 a 0,95; o jogador precisa lembrar o perfil para decidir entre o centro (valores altos) e as pontas (menos risco). No Contrato, o parceiro IA decide pela própria confiança nas respostas das Fases 2 e 3 (muita certeza → rasga; muito chute → assina).
- HUD: placar digital gigante com roleta numérica (odometer) a cada soma ou subtração, fase atual e progresso das perguntas.
- Som (Web Audio): metálico a cada batida pino-bolinha, com tom variando pela velocidade; tremor sutil de tela quando cai no maior valor ou quando uma vermelha cai num valor alto.
- Acessibilidade: modo de alto contraste com + e − dentro das bolinhas verdes e vermelhas (daltonismo).
