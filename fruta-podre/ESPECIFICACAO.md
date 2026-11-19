# FRUTA PODRE — especificação do dono (19/Nov/2026)

Pedido do dono: "Criar novo jogo chamado FRUTA PODRE com spec abaixo e já publicar MVP no Bolinho". O que entrou no MVP
e o que fica para depois está em `LEIA-ME.md` e `PENDENCIAS.md` desta pasta. Texto do dono, como veio:

## 1. Visão Geral do Produto

Fruta Podre é um jogo de ação, estratégia e quebra-cabeça baseado em física 2D de corpo rígido (2D Rigid Body Physics), inspirado nos clássicos jogos de estilingue e demolição de estruturas. No jogo, uma dupla ou turma de garotos travessos da vizinhança utiliza um estilingue gigante de madeira para arremessar frutas passadas, fermentadas e explosivas contra fortalezas improvisadas, com o objetivo de eliminar pragas invasoras (ratos, baratas, moscas e corvos) que roubaram os doces e lanches da turma.

## 2. Identidade Visual, Direção de Arte e Atmosfera

### 2.1. Estilo Gráfico
- Estética: Cartoon 2D vibrante, expressivo e levemente grotesco/cômico (estilo desenhos animados de sábado de manhã), com contornos marcantes, expressões faciais exageradas nas frutas e nas pragas, e partículas de suco, polpa e moscas zonzas ao redor das frutas mais passadas.
- Os Garotos (Operadores do Estilingue): Posicionados no lado esquerdo do cenário ao lado de um estilingue gigante feito de forquilha de árvore e câmara de pneu. Eles reagem fisicamente aos lançamentos: puxam o elástico com esforço, comemoram com pulos quando uma estrutura desaba e levam as mãos à cabeça quando um tiro passa longe.

### 2.2. Cenários e Mundos (Biomas / Capítulos)
- Mundo 1 — A Quitanda do Seu Zé: Bancadas de madeira, caixotes de feira, toldos listrados e balanças antigas. (Foco em madeira e vidro).
- Mundo 2 — O Beco da Xepa: Latões de lixo, pilhas de engradados de garrafas, muros de tijolos e poças de óleo. (Introdução de blocos de pedra/concreto e barris explosivos).
- Mundo 3 — A Cozinha Industrial: Bancadas de inox, potes de geleia gigantes, geladeiras abertas (blocos de gelo) e fogões. (Introdução de gelo escorregadio e vapor ascendente).
- Mundo 4 — O Galpão Abandonado: Vigas metálicas enferrujadas, guindastes, penduricalhos e estruturas suspensas por cordas. (Física avançada com pêndulos e correntes).

## 3. O Arsenal de Frutas Podres (Personagens e Poderes)

Cada fruta possui massa, coeficiente de restituição (elasticidade), aerodinâmica e uma habilidade ativa acionada ao tocar/clicar na tela durante o voo:
- Maçã Podre (Padrão / Equilibrada): maçã mordida, meio amarronzada, com um vermezinho usando capacete espiando por um buraco. Poder: nenhum (ou pequeno impulso sonoro/grito do verme que empurra blocos leves próximos). Ideal para disparos diretos e precisos.
- Trio Uva-Passa (Divisão Tripla): três uvas roxas enrugadas grudadas em um cabinho seco. Poder: ao clicar no ar, se divide em 3 projéteis independentes em formação de leque. Excelente contra vidro e múltiplos alvos espalhados.
- Pimenta Malagueta Fermentada (Jato Supersônico): pimenta vermelha soltando fumaça pelas orelhas e com olhos arregalados. Poder: dispara um jato de fogo horizontal/diagonal com aceleração extrema em linha reta, perfurando várias camadas de madeira.
- Melancia Passada (Peso-Pesado / Bigorna): melancia gigante, rachada e vazando caldo viscoso. Poder: ao clicar no ar, ativa a gravidade máxima e despenca verticalmente como uma bigorna, esmagando lajes de pedra e tetos reforçados.
- Abacaxi Azêdo (Bomba de Fragmentação): abacaxi inchado, borbulhando gás interno, com a coroa parecendo um pavio. Poder: detona uma explosão em área (ao clicar ou 1 segundo após o impacto), arremessando blocos pesados e espinhos para todos os lados.
- Banana Bumerangue (Retorno Aéreo): banana bem madura cheia de pintas pretas e curva acentuada. Poder: faz um looping fechado no ar e volta de ré em alta velocidade, permitindo atingir estruturas por trás de muros altos.
- Coco Mofado (Bola de Demolição): coco seco com manchas de mofo verde e expressão indestrutível. Poder: ganha rotação turbo e massa extra, quicando e rolando por cima dos escombros sem perder velocidade.
- Limão Galego Ácido (Jato Corrosivo): limão amarelo espremido, suando gotas ácidas. Poder: espirra um leque de suco ácido para baixo que dissolve instantaneamente blocos de madeira e gelo abaixo dele.
- Jaca Nuclear (Munição Suprema / Especial): colossal, espinhosa e cercada por uma aura verde radioativa de mau cheiro. Poder: não precisa de clique; seu tamanho e densidade atravessam praticamente qualquer estrutura, gerando uma onda de choque de fedor que nocauteia inimigos próximos.

## 4. Os Inimigos (As Pragas) e Elementos do Cenário

### 4.1. Hierarquia de Inimigos
- Mosca Zumbidora (Fraca): pequena, morre com qualquer toque leve ou estilhaço de vidro.
- Barata Cascuda (Média): tem carapaça resistente; precisa de impacto direto ou queda de um bloco sobre ela.
- Rato Ladrão (Médio/Grande): usa capacete de tampinha de garrafa ou escudo de lata de sardinha, exigindo dois impactos ou esmagamento.
- Corvo Chefão (Boss de Final de Mundo): gigante, protegido em fortalezas complexas com múltiplos andares e mecanismos, exigindo sequência estratégica de frutas para ser derrotado.

### 4.2. Materiais de Construção (Propriedades Físicas)
- Gelo / Vidro (Potes e Garrafas): baixa resistência, estilhaça facilmente com o Trio Uva-Passa, mas é escorregadio.
- Madeira (Caixotes e Tábuas): resistência média; vulnerável à Pimenta Malagueta e ao Limão Ácido.
- Pedra / Concreto (Tijolos e Lajes): alta resistência e peso; exige Melancia Passada, Abacaxi Azêdo ou Coco Mofado.
- Metal (Latões e Vigas): indestrutível para frutas comuns; só pode ser derrubado por empurrão, explosão ou queda de estrutura.

### 4.3. Objetos Interativos e Armadilhas
- Botijão de Gás / Galão de Vinagre Fermentado: explode ao sofrer impacto, causando reação em cadeia.
- Ventiladores de Exaustor: criam correntes de ar que desviam a trajetória das frutas para cima ou para o lado.
- Estilingues Secundários / Canos de Esgoto (Portais): teletransportam ou relançam a fruta de outro ponto do mapa.
- Bolsas de Geleia / Gelatina: funcionam como trampolins elásticos que rebatem as frutas em novos ângulos.

## 5. Mecânicas de Jogo, Regras e Sistema de Pontuação

### 5.1. Controles e Mira
- Puxar e Mirar: o jogador clica/toca na fruta encaixada no estilingue, arrasta para trás para definir ângulo e potência (com limite máximo de tensão do elástico).
- Linha de Trajetória Pontilhada: exibe os primeiros 35% da parábola de voo prevista para auxiliar na mira, mantendo o desafio de calcular o resto da queda e o efeito do vento/gravidade.
- Rastro Fantasma (Ghost Trail): após cada disparo, os pontos da trajetória da fruta anterior permanecem visíveis de forma translúcida no céu para o jogador ajustar o tiro seguinte com precisão.

### 5.2. Condições de Vitória e Derrota
- Vitória: todas as pragas da fase são eliminadas. Após a última praga cair, o jogo aguarda 3 segundos para estabilizar os escombros e contabilizar bônus de destruição.
- Derrota: todas as frutas da fila acabam e ainda resta pelo menos uma praga viva após a física estabilizar (com contagem regressiva dramática de 5 segundos).

### 5.3. Sistema de Pontuação e 3 Estrelas
- Eliminação de Praga: +5.000 pontos por inimigo derrotado.
- Destruição de Blocos: pontos proporcionais ao dano causado em madeira, vidro e pedra (+10 a +500 pontos por fragmento).
- Bônus de Fruta Economizada: +10.000 pontos para cada fruta que sobrar na fila ao vencer a fase.
- Classificação por Estrelas: cada fase possui metas claras para 1 Estrela (completar), 2 Estrelas (boa destruição) e 3 Estrelas (eficiência máxima e uso inteligente de reações em cadeia).

### 5.4. Power-Ups Opcionais (Itinerário de Emergência)
- Mira Laser (Luneta de Garrafa): estende a linha pontilhada até o ponto exato de impacto.
- Super Elástico: aumenta a velocidade inicial do lançamento em 30%.
- Terremoto de Feira: faz o chão tremer por 2 segundos, desestabilizando torres prestes a cair.
- Chamar a Jaca Nuclear: substitui a fruta atual pela Jaca Nuclear gigante.

## 6. Especificação Técnica para Desenvolvimento (Web / Mobile)

### 6.1. Stack e Motor de Física
- Engine recomendada: HTML5 Canvas / WebGL (PixiJS ou Phaser 3) acoplado ao motor de física Matter.js ou Box2D.
- Ajustes críticos de física:
  - Gravidade: gravity.y = 1.0 (ajustada para arcos amplos e visíveis em tela widescreen 16:9).
  - Restituição (Bounciness): frutas comuns 0.45, Coco Mofado 0.75, blocos de pedra 0.1.
  - Cálculo de dano por impacto: Dano = Massa * VelocidadeRelativa² * MultiplicadorDeMaterial. Se Dano > LimiarDeQuebra, o bloco se parte em sprites menores com partículas de suco/estilhaços.
  - Detecção de estabilidade (sleep state): o turno só encerra quando todos os corpos ativos no mundo atingirem velocidade linear e angular próximas de zero (body.isSleeping === true).

### 6.2. Estrutura de Dados de uma Fase (Level JSON Schema)

```json
{
  "levelId": "mundo1_fase04",
  "title": "A Torre de Caixotes",
  "parScores": { "oneStar": 15000, "twoStars": 28000, "threeStars": 42000 },
  "slingshot": { "x": 180, "y": 520, "ammoQueue": ["maca_podre", "trio_uva", "pimenta_jato", "melancia_passada"] },
  "blocks": [
    { "type": "wood_plank", "x": 850, "y": 550, "width": 20, "height": 120, "angle": 0 },
    { "type": "glass_jar", "x": 920, "y": 550, "width": 40, "height": 60, "angle": 0 },
    { "type": "stone_slab", "x": 885, "y": 480, "width": 140, "height": 20, "angle": 0 }
  ],
  "enemies": [
    { "type": "rato_ladrao", "x": 885, "y": 565, "armor": "bottle_cap" },
    { "type": "barata_cascuda", "x": 885, "y": 450, "armor": "none" }
  ],
  "hazards": [ { "type": "vinegar_barrel", "x": 960, "y": 560 } ]
}
```

### 6.3. Interface (UI/UX) e Feedback Sensorial
- Câmera dinâmica: acompanha suavemente a fruta lançada (com zoom out automático conforme a fruta ganha altitude para manter tanto o estilingue quanto a fortaleza visíveis) e retorna suavemente ao estilingue após a estabilização dos destroços. Permite também pan (arrastar a tela) e pinch-to-zoom antes do disparo para inspecionar os pontos fracos da estrutura.
- Design de áudio: som de borracha esticando com tensão crescente; gritos cômicos e distintos para cada fruta ao ser lançada e ao ativar seu poder no ar; efeitos sonoros específicos de vidro quebrando, madeira estalando, pedra esmigalhando e "splat" suculento de fruta esmagada; trilha sonora alegre e travessa com percussão de objetos de cozinha/feira (colheres, baldes, assovios e violão).
