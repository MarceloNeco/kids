# Quem é? — Duelo de Caras (fase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar em `/kids/quem-e/` o jogo **Quem é?** com a primeira brincadeira, o **Duelo de Caras**: tabuleiro de caras desenhadas e sorteadas, contra a meleca, passando o aparelho e cada um no seu celular.

**Architecture:** JS/HTML/CSS puros, sem build, igual aos outros jogos do repositório. Motor puro (`logica.js`) e rede sem tela (`rede.js`) rodam no Node para os testes; os desenhos (`caras.js`, `melecas.js`) devolvem texto SVG; `app.js` liga tudo na tela. A rede reaproveita `../batalha-naval/pertinho.js`, `../batalha-naval/qr.js`, `../batalha-naval/libs/` e `../baguncolandia/libs/supabase.js`.

**Tech Stack:** ES5-compatível no estilo dos outros jogos (IIFE com `raiz`, `require` no Node), `node --test`, Playwright (já instalado) para os testes de navegador e prints.

**Spec:** `docs/superpowers/specs/2026-11-14-quem-e-design.md`

## Global Constraints

- Pasta `quem-e/`; nome na tela **Quem é?** (EN escondido: *Who Is It?*); brincadeira **Duelo de Caras** (EN: *Face Duel*).
- Nunca usar "Cara a Cara", "Guess Who", "Akinator"; nada de gênio/turbante/lâmpada/losangos; nenhuma pessoa real desenhada.
- Todo texto de tela em PT com o EN junto (`data-t="pt|en"` / `class="en"`), EN só com o interruptor `ingles` (`idioma.js`).
- `<script src="../recursos.js" data-app="kids">`, logo depois `../idioma.js`, depois `<script src="../navegacao.js" data-fora-do-arquivo>`; `data-recurso="quem-e"` na tela inicial; `BolinhoNav.iniciar({ jogo: 'quem-e', … })`.
- CSP igual à do Campo Minado, acrescentando em `connect-src` o Supabase (`https://*.supabase.co wss://*.supabase.co`) como na Batalha Naval; nenhum script inline.
- `APP_VERSION` (app.js) = `VERSAO` (sw.js) = 1ª entrada de `versoes.json` = **0.1.0**; todo arquivo do jogo e toda peça `../` usada no `ARQUIVOS` do `sw.js`; cache `quem-e-v<VERSAO>` e `activate` só apaga `quem-e-`.
- Níveis: 🐣 Fácil 12 caras · 🐥 Médio 24 · 🦉 Difícil 36 (mínimo 30 se 36 não couber legível em 360 px em pé).
- Nomes: ≥ 80 masculinos e ≥ 80 femininos, sem sobrenome, sem famoso; nunca repetidos no tabuleiro; gêneros equilibrados (diferença ≤ 1).
- Pergunta útil: "Sim" em ≥ 2 caras e ≤ ~2/3 do tabuleiro; afrouxa o mínimo para 1 se não conseguir; nunca falha; mesmo tabuleiro para a mesma semente.
- Música: `Trilha.iniciar` com ≥ 10 MP3 já existentes no repositório, nada de chiptune; favorita `'quem-e'` em `Trilha.offline.FAVORITAS` (animada, ≤ 2,5 MB, tocada pelo jogo).
- Alvos de toque ≥ 44 px; contraste AA; `prefers-reduced-motion`; em pé e deitado; lupa e janelas pela `../janela.js` (`SolverJanela`).
- Chaves `localStorage` com prefixo `bolinho:quem-e:`.
- Textos finais revisados com a skill `humanizer-pt`; visual definido com a skill `frontend-design`.

## Review Focus

1. **Celular estreito em pé (320–360 px) no Difícil**: as cartas cabem sem rolar a página e o rosto continua reconhecível; a lupa resolve o detalhe. → teste de tela em Task 5.
2. **A pessoa responde errado** (toca Sim com a cara que não tem): o jogo não aceita e mostra "Olha de novo…" com a cara dela; tocar errado de novo continua sem aceitar, sem travar. → Task 1 (`conferir`) e Task 5 (navegador).
3. **Criança descarta a própria resposta certa / vira todas as cartas**: o jogo segue; palpite continua possível (pode desvirar); nenhuma exceção. → Task 1 e Task 5.
4. **Recarregar a página no meio da partida em rede** e o outro sumir: volta para a mesma partida com o mesmo segredo; aviso de "esperando Fulano". → Task 6.
5. **Abrir sem internet depois da primeira visita**: contra a meleca e passando o aparelho funcionam; "cada um no seu celular pela internet" mostra o aviso e oferece 📶 Jogar pertinho. → Task 7 (navegador offline).

---

### Task 1: Motor do Duelo (`logica.js`) com nomes e a meleca-computador

**Files:**
- Create: `quem-e/logica.js`, `quem-e/nomes.js`
- Test: `quem-e/teste/logica.test.js`

**Interfaces:**
- Produces (global `QELogica`, `module.exports` no Node):
  - `NIVEIS = { facil: { caras: 12 }, medio: { caras: 24 }, dificil: { caras: 36 } }`
  - `CARACTERISTICAS` — tabela da spec §6: `{ tipo: ['menino','menina','homem','mulher','vovo','vova'], pele: [6 tons], cabeloCor: ['preto','castanho','loiro','ruivo','branco'], cabeloComp: ['careca','curto','medio','comprido'], peruca: [null,'azul','rosa','verde','arco'], olhos: ['castanhos','azuis','verdes'], oculos: ['nenhum','grau','escuros','coloridos'], pelos: ['nenhum','bigode','barba'], sardas: [false,true], nariz: [false,true], cabeca: ['nada','bone','chapeu','coroa','laco','tiara'], brinco: [false,true], colar: [false,true], roupaCor: ['vermelho','azul','verde','amarelo','roxo','laranja'], estampa: ['lisa','listras','bolinhas','xadrez','estrelas'] }`
  - `PERGUNTAS` — lista `{ id, nivel: 'facil'|'medio'|'dificil', grupo: 'quem'|'cabelo'|'rosto'|'cabeca'|'joias'|'roupa', ico, pt, en, teste(cara) → boolean }`, exatamente as da tabela de níveis da spec §5 (ids estáveis, ex.: `crianca`, `adulto`, `idoso`, `masculino`, `feminino`, `cabelo-preto`…`cabelo-branco`, `oculos`, `algo-cabeca`, `comprido`, `curto`, `careca`, `peruca`, `barba`, `bigode`, `brinco`, `colar`, `nariz`, `roupa-vermelho`…, `bone`, `chapeu`, `coroa`, `laco`, `tiara`, `oculos-grau`, `oculos-escuros`, `oculos-coloridos`, `olhos-azuis`, `olhos-verdes`, `olhos-castanhos`, `sardas`).
  - `perguntasDoNivel(nivel) → PERGUNTAS[]` (acumulativo: médio inclui fácil).
  - `gerarTabuleiro(semente: number, nivel) → { semente, nivel, caras: Cara[], perguntas: string[] }` — `Cara = { id: 0..n-1, nome, tipo, pele, cabeloCor, …, estampa }`; `perguntas` = ids do nível que têm ≥ 1 "Sim" e ≥ 1 "Não" neste tabuleiro.
  - `responder(cara, idPergunta) → boolean`
  - `conferir(cara, idPergunta, resposta: boolean) → boolean` (resposta bate com a verdade)
  - `descartaveis(caras, dePe: boolean[], idPergunta, resposta) → number[]` (ids de pé que não servem)
  - `utilidade(caras, dePe, idPergunta) → number` (quantas de pé respondem Sim; 0 ou todas = inútil)
  - `escolherPerguntaMeleca(caras, candidatos: boolean[], feitas: string[], perguntas: string[], nivel, rnd) → { tipo: 'pergunta', id } | { tipo: 'palpite', idCara }`
  - `QENomes.MASCULINOS`, `QENomes.FEMININOS` (arrays ≥ 80) em `nomes.js`.

- [ ] **Step 1: Write the failing tests** (`node:test`, `assert`):
  - `gerarTabuleiro` para sementes 1..300 em cada nível: `caras.length` = 12/24/36; nomes únicos; |masc − fem| ≤ 1 (masc = menino/homem/vovo); nenhuma barba/bigode em criança; nenhuma peruca com `cabeloComp === 'careca'`; `branco` só em vovo/vova; todo par de caras difere em pelo menos uma pergunta do nível; mesma semente → `JSON.stringify` igual.
  - Regra de utilidade: em ≥ 95% das sementes, toda pergunta de `perguntas` tem Sim em ≥ 2 caras e ≤ ceil(2/3·n); em 100%, ≥ 1 e < n.
  - No Fácil, nenhuma cara tem `peruca`, `brinco`, `colar`, `nariz`, `sardas`, nem `pelos !== 'nenhum'` (o que não está no nível não varia; valores fixos neutros), e `olhos` igual em todas.
  - `conferir(cara, 'oculos', !responder(cara,'oculos')) === false`.
  - `descartaveis` com resposta Não para `comprido` devolve exatamente as de pé com cabelo comprido; nunca devolve carta já virada.
  - Meleca: simulação de 200 partidas por nível (segredo sorteado, respostas verdadeiras, descarte automático) — sempre termina em ≤ n perguntas com palpite certo; média de perguntas no Difícil (com `nivel='dificil'`) < média com estratégia do Fácil no mesmo tabuleiro de 36.
  - `QENomes.MASCULINOS.length >= 80`, `FEMININOS.length >= 80`, sem repetidos, sem espaço (sem sobrenome).

- [ ] **Step 2: Run** `node --test quem-e/teste/logica.test.js` → FAIL (módulo não existe).

- [ ] **Step 3: Implement** `nomes.js` e `logica.js`. Sorteio com o mesmo gerador linear da Purpurina (`sorteio(s)`); `gerarTabuleiro` tenta sub-sementes `semente*1000+k` (k < 200) até cumprir as regras, senão aceita a melhor com mínimo 1. Meleca: Fácil = pergunta útil ao acaso, chuta quando restam ≤ 2 (ao acaso entre elas); Médio = com probabilidade 0,75 a melhor divisão, senão ao acaso; Difícil = sempre a pergunta com `utilidade` mais perto de metade dos candidatos; chuta quando resta 1.

- [ ] **Step 4: Run** `node --test quem-e/teste/logica.test.js` → PASS.

- [ ] **Step 5: Commit** `git add quem-e/logica.js quem-e/nomes.js quem-e/teste/logica.test.js && git commit -m "Quem é?: motor do Duelo de Caras"`

### Task 2: Desenho das caras (`caras.js`)

**Files:**
- Create: `quem-e/caras.js`
- Test: `quem-e/teste/caras.test.js`

**Interfaces:**
- Consumes: `Cara` da Task 1.
- Produces: global `QECaras.svg(cara, op) → string` — `op.id` (prefixo único dos ids internos), `op.grande` (true = versão da lupa, com mais detalhe: costura, fios, reflexos), `op.largura`/`op.altura` (px). viewBox fixo `0 0 300 360` (busto). `QECaras.PALETAS = { pele[6], cabelo{…}, roupa{…}, peruca{…}, olhos{…} }`.

- [ ] **Step 1: Write the failing tests**: SVG começa com `<svg` e termina com `</svg>`, viewBox `0 0 300 360`; todos os `id="…"` internos começam por `op.id`; para cada característica, mudar só ela muda o texto do SVG (ex.: `oculos: 'escuros'` vs `'nenhum'`); `nariz: true` contém o vermelho do nariz; tamanho de uma carta normal < 14 000 caracteres e a grande < 40 000; nenhuma tag `<script>`, `<image>`, `href="http`.

- [ ] **Step 2: Run** `node --test quem-e/teste/caras.test.js` → FAIL.

- [ ] **Step 3: Implement**, antes de desenhar invocar a skill `frontend-design` para fechar a direção visual (paleta, traço, luz). Copiar de `purpurina/boneca.js` os ajudantes (`n`, `mistura`, `esc`, `cla`, `p`, `circ`, `elip`, `ret`, `espelhar`) e as paletas de pele/cabelo. Camadas: fundo da carta (degradê na cor da roupa clareada) → cabelo de trás → pescoço e ombros com a roupa (gola, botões, estampa por `<pattern>`) → colar → rosto com sombra lateral e luz → orelhas e brinco → olhos (branco, íris na cor, pupila, brilho, cílios nas femininas) → sobrancelhas → sardas → nariz (ou nariz de palhaço vermelho brilhante) → boca → bigode/barba → óculos com reflexo → cabelo da frente com mechas e brilho (ou peruca cacheada colorida; arco = listras do arco-íris) → acessório de cabeça. Vovô/vovó: rugas leves, cabelo branco ou careca. Crianças: cabeça maior e rosto arredondado.

- [ ] **Step 4: Run** testes → PASS. Gerar uma folha `quem-e/teste/folha-caras.html` (fora do `sw.js`, só para conferência) com 36 caras de 3 sementes e tirar print em 2× com Playwright; olhar o print e corrigir o que estiver feio ou ilegível em tamanho de carta (~56 px de largura).

- [ ] **Step 5: Commit** `git add quem-e/caras.js quem-e/teste/caras.test.js quem-e/teste/folha-caras.html && git commit -m "Quem é?: desenho das caras"`

### Task 3: As melecas (`melecas.js`)

**Files:**
- Create: `quem-e/melecas.js`
- Test: `quem-e/teste/melecas.test.js`

**Interfaces:**
- Produces: `QEMelecas.LISTA = [{ id: 'blue', nome: 'Melekento Blue', cor: '#…' }, { id: 'pink', nome: 'Pink Honey', cor: '#…' }]`; `QEMelecas.svg(id, humor, op) → string` com `humor ∈ 'parada'|'feliz'|'ops'|'pensando'|'falando'|'triste'`; classes CSS `qm-respira`, `qm-pula`, `qm-treme` para animar (definidas no `estilo.css` da Task 5).

- [ ] **Step 1: Failing tests**: cada id × humor devolve SVG válido com ids prefixados por `op.id`; os humores dão textos diferentes; Blue usa tons azuis translúcidos (`opacity` < 1 e bolhas `circle`), Pink usa rosa e um fio de mel (path abaixo do corpo).
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**: Blue = gota larga de geleia azul translúcida com bolhinhas dentro e brilho grande; Pink = meleca rosa brilhante que escorre, com fio de mel dourado; olhos grandes com brilho e boca expressiva por humor. Anotar em `quem-e/PENDENCIAS.md` (criado na Task 7) "ajustar as melecas pela foto das massinhas".
- [ ] **Step 4: Run** → PASS; print das 12 combinações e conferir.
- [ ] **Step 5: Commit** `git commit -m "Quem é?: Melekento Blue e Pink Honey"`

### Task 4: Partida local (contra a meleca e passando o aparelho), sem tela

**Files:**
- Create: `quem-e/partida.js`
- Test: `quem-e/teste/partida.test.js`

**Interfaces:**
- Consumes: Task 1.
- Produces: `QEPartida.criar({ modo: 'meleca'|'passar'|'rede', nivel, semente, eu: 0|1 }) → p` com
  - `p.estado` = `{ fase: 'segredo'|'jogo'|'fim', vez: 0|1, segredos: [idCara|null, idCara|null], dePe: [bool[], bool[]], feitas: [string[], string[]], ultima: { quem, pergunta, resposta } | null, passo: 'escolher'|'responder'|'descartar', vencedor: 0|1|null }`
  - `p.escolherSegredo(jogador, idCara)`, `p.perguntar(jogador, idPergunta)`, `p.responder(jogador, resposta) → { ok: boolean }` (usa `conferir`; `ok:false` não muda nada), `p.descartarTodos(jogador) → number[]`, `p.virar(jogador, idCara)` (alterna), `p.pronto(jogador)`, `p.palpite(jogador, idCara) → { acertou }`, `p.vezDaMeleca() → acao` (modo meleca: a meleca pergunta/palpita e responde sozinha às perguntas da criança), `p.salvar() → objeto` e `QEPartida.voltar(objeto)`.
  - Regras da spec §5: uma ação por vez (pergunta **ou** palpite); `pronto` só depois da resposta; palpite errado vira a carta e passa a vez; fim ao acertar.

- [ ] **Step 1: Failing tests**: partida "passar" inteira com dois jogadores roteirizados; `responder` errado devolve `ok:false` e o passo continua `responder`; `perguntar` fora da vez lança erro de regra (código `'fora-da-vez'`); palpite errado → carta virada e vez passa; virar todas as cartas e dar palpite numa virada (desvira e vale); modo meleca: 300 partidas com criança-robô terminam com vencedor; `voltar(salvar())` continua igual.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `git commit -m "Quem é?: regras da partida"`

### Task 5: Telas, som, voz e música (`index.html`, `estilo.css`, `app.js`, `som.js`)

**Files:**
- Create: `quem-e/index.html`, `quem-e/estilo.css`, `quem-e/app.js`, `quem-e/som.js`
- Test: `quem-e/teste/pagina.test.js` (estático), `quem-e/teste/navegador.test.js` (Playwright, `?teste`)

**Interfaces:**
- Consumes: Tasks 1–4; `BolinhoNav`, `BolinhoIdioma`, `Trilha`, `SolverJanela`, `BolinhoTelaCheia`/`telacheia.js` e `atualizar.js` como no Campo Minado.
- Produces: telas com ids estáveis para os testes: `#inicio` (`#btBlue`, `#btPink`), `#modos` (`#btMeleca`, `#btPassar`, `#btRede`), `#niveis` (`#btFacil`, `#btMedio`, `#btDificil`), `#segredo`, `#jogo` (`#tabuleiro` com `.carta[data-id]`, `#perguntas` com `button[data-p]`, `#btSim`, `#btNao`, `#btDescartar`, `#btPronto`, `#btPalpite`), `#cortina`, `#fim` (`#btDeNovo`); `APP_VERSION = '0.1.0'`.

- [ ] **Step 1: Failing tests**:
  - `pagina.test.js`: ordem dos scripts (`../recursos.js" data-app="kids"`, `../idioma.js`, `../navegacao.js" data-fora-do-arquivo`), `data-recurso="quem-e"`, CSP sem `'unsafe-eval'` e sem script inline, `BolinhoNav.iniciar({` com `jogo: 'quem-e'`, `Trilha.iniciar` com ≥ 10 MP3 que existem, nenhum texto "Cara a Cara"/"Akinator"/"Guess Who".
  - `navegador.test.js` (Playwright, viewport 360×740 e 740×360): escolher Pink → Contra a meleca → Fácil → escolher segredo → perguntar → resposta da meleca aparece → `#btDescartar` vira as cartas certas → `#btPronto` → a meleca joga sozinha e a criança responde: tocar a resposta errada mostra "Olha de novo" e não passa; partida até o fim com `#fim` visível. No Difícil em 360×740: todas as `.carta` dentro da janela sem rolar a página. Tocar e segurar numa carta abre a lupa (`dialog.sj[open]`) e Esc fecha. 🏠 volta ao `#inicio`. Nenhum erro no console.
- [ ] **Step 2: Run** `node --test quem-e/teste/pagina.test.js quem-e/teste/navegador.test.js` → FAIL.
- [ ] **Step 3: Implement.** Invocar `frontend-design` antes do CSS (mundo gosmento e brilhante, azul geleia e rosa mel sobre fundo claro e quente, cartas redondas com borda grossa e giro 3D curto). Grade do tabuleiro calculada pelo espaço disponível (colunas que maximizam o tamanho da carta, em pé e deitado). Lista de perguntas em grupos com ícone, texto e 🔊; perguntas inúteis apagadas com "essa não ajuda mais" (no Fácil somem). Botão de descarte com o texto montado da pergunta ("🗑️ Descartar todos de cabelo comprido" / "…sem cabelo comprido" / "Nenhuma para descartar"). Voz do aparelho como em `cozinha/app.js` (ligar/desligar lembrado em `bolinho:quem-e:voz`; padrão ligado no Fácil). Música: escolher 10–12 MP3 animados de instrumentos de verdade em `peluqueria/musicas`, `purpurina/musicas`, `rabiscolandia/musicas` (fora `bit-bit-loop`, `laserpack`, `voxel-revolution`, `digital-lemonade` e qualquer chiptune). `som.js` com Web Audio (virar, sim, não, acerto, erro, vitória). Todo texto revisado com `humanizer-pt`.
- [ ] **Step 4: Run** → PASS. Prints 2× em 360×740, 740×360 e 820×1180 (tablet) de: início, jogo no Difícil, lupa, fim; olhar e corrigir.
- [ ] **Step 5: Commit** `git commit -m "Quem é?: telas do Duelo de Caras"`

### Task 6: Cada um no seu celular (`rede.js` + tela)

**Files:**
- Create: `quem-e/rede.js`
- Modify: `quem-e/app.js`, `quem-e/index.html` (telas `#sala` com código de 4 letras, convite, `#perto` com QR)
- Test: `quem-e/teste/rede.test.js`, acréscimo em `quem-e/teste/navegador.test.js`

**Interfaces:**
- Consumes: `QEPartida` (modo `rede`), `BNPertinho` e `BNQR` de `../batalha-naval/`, `../baguncolandia/libs/supabase.js`.
- Produces: `QERede.criar({ id, nome, codigo, host, nivel, mandar, salvar, aoMudar, agora, rnd, dados }) → sala` e `QERede.abrir(codigo, aoReceber, aoCair, conexao) → Promise<{ mandar, fechar }>`, no molde de `batalha-naval/rede.js` (copiar a estrutura e o `validar`), canal `quem-e-<código>`. Mensagens: `oi`, `pulso`, `estado` (só anfitrião: `{ era, nivel, semente, j, vez, seq, log, venc }`), `pronto` (segredo escolhido, sem dizer qual), `pergunta {n, p}`, `resposta {n, r}`, `palpite {n, c}`, `veredito {n, ok}`, `tchau`, `revelar {c}` (no fim), `nao {motivo: 'cheia'|'comecou'}`. Segredo nunca sai do aparelho antes do fim. 2 jogadores.

- [ ] **Step 1: Failing tests** (`rede.test.js`, canal falso em memória com perdas e repetição, como em `batalha-naval/teste/rede.test.js`): partida inteira entre 2 salas; 3ª sala recebe `nao/cheia`; mensagem malformada ignorada; recarregar (criar de novo com `dados` salvos) no meio volta ao mesmo passo e segredo; anfitrião some 15 s → o outro assume; o segredo do outro não aparece em nenhuma mensagem antes de `revelar`. Navegador: duas abas com `?teste` (BroadcastChannel) jogam uma partida curta no Fácil.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** Sem internet: aviso e botão 📶 Jogar pertinho (reaproveita as telas e textos da Batalha Naval). **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `git commit -m "Quem é?: duelo em dois celulares"`

### Task 7: Encaixe no Bolinho de Chuva, sem internet e documentos

**Files:**
- Create: `quem-e/sw.js`, `quem-e/manifest.webmanifest`, `quem-e/icone.svg`, `quem-e/icone-192.png`, `quem-e/icone-512.png`, `quem-e/versoes.json`, `quem-e/LEIA-ME.md`, `quem-e/PENDENCIAS.md`, `quem-e/CREDITOS.md`, `quem-e/teste/arquivos.test.js`
- Modify: `catalogo.js` (entrada antes de `contador-de-historias`), `recursos-do-app.json` (`{ id: 'quem-e', nome: { pt: 'Quem é?', en: 'Who Is It?' }, pagina: 'quem-e/' }`), `trilha.js` (`FAVORITAS['quem-e']`), `sw.js` da raiz (`VERSAO` +1 e `'quem-e/icone.svg'` se o teste pedir), `teste/idioma.test.js`, `teste/musica-offline.test.js`, `teste/navegacao.test.js`, `teste/paisagem.test.js`, `teste/regra-musica.test.js` (acrescentar `quem-e` nas listas, no molde do `labirinto`), `ARQUITETURA.md`, `PENDENCIAS.md` da raiz (item novo ✅ e pendências da fase 2)

- [ ] **Step 1: Failing test** `arquivos.test.js`: versão igual nos três lugares; todo arquivo `.js/.css/.svg/.png/.webmanifest/.json` da pasta (fora `teste/`) e toda peça `../` dos `<script src>` estão no `ARQUIVOS`; cache `quem-e-v`; `activate` filtra `'quem-e-'`; manifest com `name`, `short_name`, ícones 192/512 e `maskable`.
- [ ] **Step 2: Run** `node --test quem-e/teste/arquivos.test.js teste/*.test.js` → FAIL.
- [ ] **Step 3: Implement.** Ícone: a cara da Pink Honey e do Melekento Blue juntos sobre um "?" (SVG → PNG com Playwright). Catálogo: `{ id: 'quem-e', nome: 'Quem é?', img: '/kids/quem-e/icone.svg', cor: <cor da Pink>, url: '/kids/quem-e/', texto: 'Duelo de Caras: cada um escolhe um personagem em segredo e pergunta "usa óculos?", "tem coroa?" até descobrir o do outro. Contra a meleca, passando o aparelho ou cada um no seu celular.', en: 'Face Duel: pick a secret character and ask questions until you find the other one.', tag: '▶ Adivinhar / Guess', instalar: true }`. `versoes.json` 0.1.0 com data e hora de Brasília. `PENDENCIAS.md` do jogo: corpo inteiro (v0.2), foto das melecas, testar com as meninas, Meleca Adivinha (fase 2), conferir o João Alves.
- [ ] **Step 4: Run** `node --test quem-e/teste/*.test.js teste/*.test.js` → PASS. Navegador: abrir, ir offline (`context.setOffline(true)`), recarregar → contra a meleca funciona; pela internet mostra o aviso.
- [ ] **Step 5: Commit** `git commit -m "Quem é?: na estante do Bolinho de Chuva"`

### Task 8: Revisão final, publicar e entregar

- [ ] **Step 1:** Rodar tudo: `for f in */teste/*.test.js teste/*.test.js; do node --test "$f" || echo FALHOU $f; done` → nenhum FALHOU (os testes de outros jogos não podem quebrar).
- [ ] **Step 2:** Revisão do branch inteiro por um revisor novo (skill `superpowers:requesting-code-review`); corrigir o que for risco.
- [ ] **Step 3:** Zip `QUEM-E v0.1.0 <dd-Mmm-aaaa> <HHhMMm>.zip` (arquivos da pasta soltos na raiz do zip, sem `teste/`) no scratchpad; enviar com `SendUserFile`.
- [ ] **Step 4:** PR para `main` (autorizado no `CLAUDE.md`), esperar as verificações, merge; conferir que `solverone.com.br/kids/quem-e/` abre.
- [ ] **Step 5:** Resumo ao dono em português simples, com prints, o que mudou, onde ver, o que o RootifyONE precisa saber (interruptor novo `quem-e`) e os pontos da DoD "não aplicável hoje".
