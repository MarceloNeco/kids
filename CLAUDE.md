# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# SolverONE — regras do projeto para o Claude Code

Antes de qualquer alteração neste repositório, leia e siga **inteira** a diretriz geral da plataforma em
`.claude/skills/diretrizes-gerais-apps/SKILL.md` (ela também é carregada como skill `diretrizes-gerais-apps`).

Resumo do que nunca pode ser esquecido (o detalhe está na diretriz):

- **Regra zero**: antes de implementar no app um requisito da diretriz que ainda não existe aqui, liste o que
  falta e confirme com o dono. Não crie repositórios sem permissão explícita.
  **Publicar é sempre autorizado** (dono, 02/Nov/2026): ao terminar e testar, faça o pull request e o merge sem
  perguntar e conte o que mudou.
- **Segurança**: nenhuma senha, chave de API, token ou segredo entra no código, no repositório, no chat ou em
  arquivo. Chaves de IA ficam só no cofre do navegador da pessoa. Se uma chave aparecer no chat, peça para revogar.
- **Idioma** (dono, 14/Nov/2026): textos para o usuário em **PT (Brasil), EN (EUA) e ES (Espanha)**, tradução
  humanizada; **um seletor só em todo lugar**, bandeira + sigla (🇧🇷 PT · 🇺🇸 EN · 🇪🇸 ES), componente do módulo comum,
  nunca toggle ou dropdown próprio; ES só aparece num app quando ele está 100 % traduzido (até lá, PT|EN). Detalhe na
  diretriz, "Idioma e datas". Instruções para o dono em português, passo a passo, como para iniciante (ele não é
  desenvolvedor).
- **Entrega**: um `.zip` por app, nome `<NOME APP> <VERSAO> <dd-Mmm-aaaa> <HHhMMm>.zip`, arquivos soltos na
  raiz; atualizar `versoes.json`, a versão no código, o `sw.js` e `ARQUITETURA.md`/`PENDENCIAS.md`.
- **Trabalho demorado** (foto, OCR, IA, importação, áudio) roda no módulo `Fundo`: nunca morre ao sair da tela,
  Wake Lock, aviso antes de fechar, pílula de andamento, resultado entregue onde a pessoa estiver.
- **Feedback dos usuários**: pergunta do dia, 💬 em toda tela e no AssistONE, tudo estruturado no RootifyONE.

# Repositório kids — Bolinho de Chuva (brincadeiras para criança e família)

- Publicado em **solverone.com.br/kids/** (GitHub Pages deste repositório; o domínio vem do Portal). A marca na tela é
  **Bolinho de Chuva**; `kids` é só o nome curto do endereço.
- Veio do FeatureTesting e do Portal em 02/Nov/2026, **com o histórico**. Os endereços antigos
  (`/FeatureTesting/<jogo>/`, `/FeatureTesting/danca-na-sala.html`, `/bolinho-de-chuva/`) só redirecionam para cá:
  **não mexa nos jogos lá — é aqui.**
- O dono não é desenvolvedor: responda em português simples; passo a passo de iniciante quando ele precisar agir.
- **Publicar é sempre autorizado** (dono, 02/Nov/2026): ao terminar e testar, pull request + merge sem perguntar.

## O que tem aqui (mapa completo em ARQUITETURA.md)

- Raiz = **estante** (página inicial com todos os jogos): `index.html`, `catalogo.js` (**lista única dos jogos**: jogo
  novo = uma entrada lá), `jogos.js`, `kids.js` (controle da TV), `instalar.js`, `radio.js`, `tela-cheia.js`,
  `estante.css`, `sw.js`, `manifest.webmanifest`, `musicas/`, `CREDITOS.md`.
- Uma pasta por jogo: `baguncolandia/`, `peluqueria/`, `vruuum/`, `purpurina/`, `rabiscolandia/`, `campo-minado/`,
  `batalha-naval/`, `enigmas/`, `labirinto/`, `cozinha/`, `aqua/`, `glub-glub/`, e `danca-na-sala.html` na raiz. Atalhos de TV LG: `tv-lg*/`.
- Peças compartilhadas na raiz, usadas pelos jogos com `../`: `recursos.js` (interruptores do RootifyONE), `idioma.js`
  (PT/EN/ES escolhido na estante),
  `navegacao.js` (🏠 Início e 🚪 Saída), `atualizar.js` (aviso de versão nova), `telacheia.js`, `cofre.js`, `janela.js`, `trilha.js` (música dos jogos novos);
  bibliotecas em `baguncolandia/libs/`. Fundo dos cartões: `cartoes-fundos.css` (tirar a linha do `index.html` = visual antigo).
- Interruptores: todos os jogos obedecem o app **`kids`** ("Bolinho de Chuva") do RootifyONE, um interruptor por jogo.

## Regras de cada jogo

- **Idioma (dono, 14/Nov/2026; diretriz "três idiomas"): português (Brasil), inglês (EUA) e espanhol (Espanha), em tudo,
  com tradução humanizada.** A escolha é feita **só na estante**, com bandeira desenhada (SVG) + sigla (🇧🇷 PT · 🇺🇸 EN ·
  🇪🇸 ES), e vale para todos os jogos — **nenhum jogo tem botão de idioma próprio**. Peça comum: `idioma.js` (logo depois do
  `recursos.js`, na estante e em todo jogo): guarda a escolha em `localStorage` "bolinho:idioma"; o jogo lê
  `BolinhoIdioma.atual()` ('pt' | 'en' | 'es'), usa `BolinhoIdioma.t(pt, en, es)` e, na fala, `BolinhoIdioma.voz()`
  (pt-BR / en-US / es-ES), sempre com uma voz do mesmo idioma. Todo texto novo nasce nos três (`data-t="pt|en|es"`,
  `t(pt, en, es)`). Espanhol da Espanha: móvil, ordenador, coger, gafas, zumo; datas `14/nov/2026`. Vigia:
  `teste/idioma.test.js`. Não existe mais o interruptor `ingles` do RootifyONE.
- **Navegação padrão (dono, 07/Nov/2026): todo jogo tem 🏠 Início e 🚪 Saída no canto de cima, pela peça comum
  `navegacao.js`.** `<script src="../navegacao.js" data-fora-do-arquivo>` logo depois do `../idioma.js`, `'../navegacao.js'`
  no `ARQUIVOS` do `sw.js` e `BolinhoNav.iniciar({ jogo, noInicio, irParaInicio, emAndamento })` no `app.js` (detalhe no
  começo do arquivo). 🏠 só aparece fora da tela de começo e volta para ela; 🚪 sai (pergunta antes com partida rolando;
  vai para a estante `/kids/`). O Voltar do celular numa tela de dentro volta (o jogo que não cuida do histórico passa
  `cuidarDoVoltar: true`); na tela de começo o 1º Voltar avisa "toque de novo para sair" e só o 2º sai, e a guarda do
  histórico (posta no primeiro toque) faz o jogo voltar ao começo em vez de fechar quando o Chrome pula uma entrada (dono,
  14/Nov/2026). Jogo com aviso próprio passa `guarda: false`. Nada de 🏠, ✕ ou "← menu" próprio no canto: o jogo abre espaço para a barra com as classes
  `bn-nav`/`bn-dentro` e as medidas `--nav-alto`/`--nav-largo` no `<html>`. Na TV (`?tv=`) a barra some. Vigia:
  `teste/navegacao.test.js`.
- A cada versão de um jogo: subir `APP_VERSION` no `app.js`, `VERSAO` no `sw.js` e a entrada nova em `versoes.json`
  (PT/EN, data e hora) — os testes conferem que os três são iguais. Arquivo novo do jogo entra no `ARQUIVOS` do `sw.js`.
- Testes: `node --test <jogo>/teste/*.test.js` (rodar da raiz deste repositório).
- Jogo novo: pasta própria + entrada em `catalogo.js` + entrada em `recursos-do-app.json` (interruptor) + `data-app="kids"`
  no `../recursos.js` + `../idioma.js` logo depois + `../navegacao.js` (🏠 e 🚪) + 3 níveis (fácil, médio, difícil) + pelo menos 10 músicas (`trilha.js`). Vigia: `node --test teste/*.test.js`.
- A cada mudança na estante (raiz), subir a `VERSAO` do `sw.js` da raiz.
- **Regra da música (pedido do dono, 06/Nov/2026), vale para todo jogo e para a rádio da estante:**
  - **Com internet**: tocam **todas** as músicas gravadas do jogo (instrumentos de verdade), em **ordem sorteada**. A
    favorita do jogo (a música "simples" de sem internet) **nunca é a primeira**: vai para o **fim** da volta.
    Use `Trilha.embaralhar(lista, jogo)` do `trilha.js` (o `Trilha.iniciar` já faz isso).
  - **Sem internet**: toca **só uma** música simples, a favorita guardada no aparelho (`Trilha.offline`, cache
    `bolinho-musicas`), mesmo que outras estejam no cache do jogo. Só se nem ela estiver guardada, toca a música feita
    no código ("estilo Atari") — ou silêncio, se o jogo não tiver.
  - Música feita no código (som de "Atari", 8 bits) **nunca toca com internet**, nem intercalada.
  - Prefira sempre gravações com instrumentos de verdade. Música gravada com som de videogame / 8 bits (chiptune) não
    entra na lista (deixe o arquivo na pasta, só tire da lista). Cada jogo continua com pelo menos 10 músicas.
  - A favorita de cada jogo (`FAVORITAS` no `trilha.js`) é de instrumentos de verdade, animada, até 2,5 MB e o jogo a
    toca. Vigia: `teste/regra-musica.test.js`.

## Aviso do dono (13/Nov/2026): Definition of done com 12 pontos — até sair a diretriz nova

- A DoD da plataforma passa a ter 12 pontos: manual e orientações, AssistONE, Novidades da versão, termos, comunicações e
  e-mails, RootifyONE, ArchONE, EaglePlanONE (roadmap), retrocompatibilidade, segurança e LGPD, qualidade verificável e
  registro. Vai nascer uma teia de integrações (eventos e comandos com aprovação) entre os apps, o RootifyONE, o ArchONE e
  o EaglePlanONE; quando a diretriz nova sair (conversa de diretrizes da SolverONE), siga-a.
- Aplicabilidade: cada ponto vale quando se aplica ao estágio deste app (hoje: site aberto, sem login e sem banco, só no
  GitHub Pages). **Não** criar login, banco nem integração por causa do aviso; o que não se aplica hoje, dizer "não
  aplicável hoje" e o motivo em uma linha. Ganhando login, banco ou integração, o app já nasce cumprindo os pontos.
- Em cada entrega, dizer no resumo o que o RootifyONE, o ArchONE ou o EaglePlanONE precisariam saber (integração nova ou
  removida, recurso/interruptor novo, item do roadmap concluído). Nada de integração nova sem a regra zero.

## Várias conversas ao mesmo tempo (dono, 14/Nov/2026): cuidado com conflitos

O dono mexe em vários jogos em paralelo, cada um numa conversa. Para uma não estragar o trabalho da outra:
- **Comece do `main` mais novo** (`git fetch origin main` e o ramo de trabalho saindo dele) e **mexa só na pasta do seu
  jogo**. Não altere pasta de outro jogo, nem "aproveite para arrumar" algo fora do pedido.
- **Arquivos comuns da raiz** (`catalogo.js`, `recursos-do-app.json`, `sw.js`, `index.html`, `trilha.js`, `navegacao.js`,
  `idioma.js`, `CLAUDE.md`, `ARQUITETURA.md`, `PENDENCIAS.md`, `teste/`): mudanças pequenas e só no que é seu (a sua
  entrada no catálogo, o seu interruptor, a sua linha nas pendências). Nunca reescreva o arquivo inteiro.
- **Antes de cada pull request**: busque o `main` de novo e **junte com merge** no seu ramo (nunca rebase nem force push).
  Se der conflito, **mantenha os dois lados**. Em versões (`APP_VERSION`, `VERSAO`, `versoes.json`, `data-versao`), fique
  com a do `main` e suba **uma acima** dela; no `versoes.json` a entrada nova vai por cima das que vieram do `main`.
- **Depois de juntar**, rode de novo os testes do seu jogo e os vigias da raiz (`node --test teste/*.test.js`), um de cada
  vez. Só publique com tudo passando.
- **Pull requests pequenos e frequentes**, publicados assim que testados, para os outros pegarem logo o `main` novo.
- Se um conflito mexer na lógica de outro jogo e não der para juntar sem perder algo, **pare e conte ao dono** em vez de
  escolher um lado.
