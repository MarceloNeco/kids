# Arquitetura — kids (Bolinho de Chuva)

Brincadeiras da SolverONE para criança e família. Sites estáticos (HTML, CSS e JS puros, sem build), publicados pelo
GitHub Pages em **solverone.com.br/kids/**. Cada jogo é um app instalável (PWA) que funciona sem internet.

Veio de dois lugares em 02/Nov/2026, com o histórico de cada arquivo:
- os jogos, a Dança na Sala, os atalhos de TV LG e as peças compartilhadas, do repositório **FeatureTesting**;
- a estante (página inicial), do **Portal** (`marceloneco.github.io`, antiga pasta `bolinho-de-chuva/`).

Os endereços antigos ficaram só como redirecionamento para cá (e os service workers antigos se desligam sozinhos).
Progresso salvo e preferências não se perdem: tudo continua no mesmo site (solverone.com.br).

## Mapa

| Caminho | O que é | Mexer? |
|---|---|---|
| `index.html` | A estante (página inicial). Monta os cartões pelo `catalogo.js`. | Sim |
| `catalogo.js` | **Lista única dos jogos** (nome, ícone, cor, endereço, textos PT/EN, se instala, se precisa de internet, parâmetro de TV). Jogo novo = uma entrada aqui. | Sim |
| `jogos.js` | Botão "📲 Instalar" de cada cartão e o painel "Guardar todos / Instalar um por um". | Sim |
| `kids.js` | Controle remoto da TV (setas e OK) e, numa TV de verdade, abre os jogos já no papel de TV (`?tv=auto`). | Sim |
| `instalar.js` | Barra "Instalar o aplicativo" (estante e jogos com `?instalar=1`), passo a passo por aparelho. | Sim |
| `radio.js` + `musicas/` | Rádio de rock no pé da estante. Créditos em `CREDITOS.md`. | Sim |
| `tela-cheia.js` | Tela cheia no primeiro toque (celular/tablet; no tablet Fire só instalando). | Sim |
| `estante.css` | Visual da estante. | Sim |
| `sw.js` + `manifest.webmanifest` + `icone-*` | Estante instalável e sem internet (escopo `/kids/`). | Sim (subir VERSAO) |
| `baguncolandia/` `peluqueria/` `vruuum/` `purpurina/` `rabiscolandia/` | Um jogo por pasta, cada um com `index.html`, `app.js`, `sw.js`, `manifest.webmanifest`, `versoes.json`, `LEIA-ME.md`, `PENDENCIAS.md` e `teste/`. | Sim |
| `danca-na-sala.html` | Dança na Sala (precisa de internet: YouTube e TV). | Sim |
| `recursos.js` + `recursos-do-app.json` | Interruptores do RootifyONE. Os jogos ainda obedecem o app "feature-tester" do RootifyONE (ver pendências). | Com cuidado |
| `atualizar.js` | Aviso "✨ Versão nova — Atualizar / Depois" dentro dos jogos. | Sim |
| `telacheia.js`, `cofre.js`, `janela.js` | Peças comuns usadas pelos jogos (`../`). `cofre.js` e `janela.js` são cópias dos módulos comuns da plataforma. | Com cuidado |
| `baguncolandia/libs/` | Bibliotecas hospedadas (MediaPipe, supabase-js), usadas também por outros jogos. | Não (só atualizar versão) |
| `tv-lg*/` | Atalhos para a barra de apps da TV LG (Modo Desenvolvedor). | Sim |
| `docs/superpowers/` | Planos e especificações dos jogos. | Só registro |

## Testes

`node --test <jogo>/teste/*.test.js` na raiz deste repositório (Node + Playwright com o Chromium do ambiente).
