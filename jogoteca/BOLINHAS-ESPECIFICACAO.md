# Bolinhas da Angústia — especificação do dono (19/Nov/2026)

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
