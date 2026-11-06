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
- **Idioma**: textos para o usuário em PT e EN; instruções para o dono em português, passo a passo, como para
  iniciante (ele não é desenvolvedor).
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
  `batalha-naval/`, `enigmas/`, `labirinto/`, `cozinha/`, e `danca-na-sala.html` na raiz. Atalhos de TV LG: `tv-lg*/`.
- Peças compartilhadas na raiz, usadas pelos jogos com `../`: `recursos.js` (interruptores do RootifyONE),
  `atualizar.js` (aviso de versão nova), `telacheia.js`, `cofre.js`, `janela.js`, `trilha.js` (música dos jogos novos);
  bibliotecas em `baguncolandia/libs/`. Fundo dos cartões: `cartoes-fundos.css` (tirar a linha do `index.html` = visual antigo).
- Interruptores: todos os jogos obedecem o app **`kids`** ("Bolinho de Chuva") do RootifyONE, um interruptor por jogo.

## Regras de cada jogo

- A cada versão de um jogo: subir `APP_VERSION` no `app.js`, `VERSAO` no `sw.js` e a entrada nova em `versoes.json`
  (PT/EN, data e hora) — os testes conferem que os três são iguais. Arquivo novo do jogo entra no `ARQUIVOS` do `sw.js`.
- Testes: `node --test <jogo>/teste/*.test.js` (rodar da raiz deste repositório).
- Jogo novo: pasta própria + entrada em `catalogo.js` + entrada em `recursos-do-app.json` (interruptor) + `data-app="kids"`
  no `../recursos.js` + 3 níveis (fácil, médio, difícil) + pelo menos 10 músicas (`trilha.js`). Vigia: `node --test teste/*.test.js`.
- A cada mudança na estante (raiz), subir a `VERSAO` do `sw.js` da raiz.
