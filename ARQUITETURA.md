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
| `radio.js` + `musicas/` | Rádio de rock no pé da estante. Créditos em `CREDITOS.md`. Sem internet toca a favorita (Cool Rock) pelo `Trilha.offline`: o `index.html` carrega `trilha.js` antes do `radio.js`. | Sim |
| `tela-cheia.js` | Tela cheia no primeiro toque (celular/tablet; no tablet Fire só instalando). | Sim |
| `estante.css` | Visual da estante. | Sim |
| `cartoes-fundos.css` + `cartoes/` | Fundo fosco e colorido de cada cartão (um desenho por jogo, `generico.svg` para os outros). **Para voltar ao visual anterior, apague a linha dele no `index.html`.** | Sim |
| `sw.js` + `manifest.webmanifest` + `icone-*` | Estante instalável e sem internet (escopo `/kids/`). | Sim (subir VERSAO) |
| `baguncolandia/` `peluqueria/` `vruuum/` `purpurina/` `rabiscolandia/` `campo-minado/` `batalha-naval/` `enigmas/` `labirinto/` `cozinha/` | Um jogo por pasta, cada um com `index.html`, `app.js`, `sw.js`, `manifest.webmanifest`, `versoes.json`, `LEIA-ME.md`, `PENDENCIAS.md` e `teste/`. | Sim |
| `danca-na-sala.html` | Dança na Sala (precisa de internet: YouTube e TV). | Sim |
| `recursos.js` + `recursos-do-app.json` | Interruptores do RootifyONE: **um app só, "Bolinho de Chuva" (`kids`), com um interruptor por jogo** (desde 06/Nov/2026). Jogo desligado some da estante (`data-recurso` no cartão) e esconde a página dele; `app` desligado = o pacote inteiro em manutenção. Jogo novo = uma entrada no `recursos-do-app.json`. | Com cuidado |
| `trilha.js` | Tocador comum de música dos jogos novos (≥ 10 músicas gravadas por jogo, apontando para as pastas `musicas/` que já existem, sem copiar). Começa no primeiro toque (dedo soltando), lembra o 🔇. Também tem o **`Trilha.offline`** (06/Nov/2026): **uma música favorita por jogo e pela rádio** (`FAVORITAS`), guardada inteira no cache **`bolinho-musicas`** (um só para todos, uma cópia por arquivo) por `guardar(ids)` e tocada sem internet por `tocar(audio, url)` com endereço `blob:` (os service workers continuam sem guardar MP3). Guarda: o "⬇ Guardar todos" da estante (as 11) e cada jogo na primeira música que toca com internet. Os jogos antigos (som.js próprio) e o `radio.js` carregam o arquivo só por esse ajudante e pelo **`Trilha.embaralhar`** (abaixo). | Sim |
| `atualizar.js` | Aviso "✨ Versão nova — Atualizar / Depois" dentro dos jogos. | Sim |
| `telacheia.js`, `cofre.js`, `janela.js` | Peças comuns usadas pelos jogos (`../`). `cofre.js` e `janela.js` são cópias dos módulos comuns da plataforma. | Com cuidado |
| `baguncolandia/libs/` | Bibliotecas hospedadas (MediaPipe, supabase-js), usadas também por outros jogos. | Não (só atualizar versão) |
| `tv-lg*/` | Atalhos para a barra de apps da TV LG (Modo Desenvolvedor). | Sim |
| `docs/superpowers/` | Planos e especificações dos jogos. | Só registro |

## Regra da música (dono, 06/Nov/2026)

Vale para todo jogo e para a rádio da estante:

- **Com internet**: todas as músicas gravadas do jogo (instrumentos de verdade), em ordem sorteada, e a favorita (a de
  sem internet) sempre por último na volta, nunca a primeira. Peça comum: `Trilha.embaralhar(lista, jogo, endereco)`
  no `trilha.js`, usada pelo `Trilha.iniciar`, pelo `radio.js` e pelos `som.js` da Bagunçolândia, Peluqueria (nas
  rodadas; a abertura do menu continua sendo a primeira), Vruuum!, Purpurina e Rabiscolândia.
- **Sem internet**: só a favorita guardada (`Trilha.offline`, cache `bolinho-musicas`), mesmo que o cache do próprio jogo
  tenha outras (Vruuum!, Purpurina e Peluqueria guardam as delas). Sem a favorita: a música feita no código
  (Bagunçolândia, Vruuum! com o `rock.js`, Purpurina e Rabiscolândia) ou silêncio (Peluqueria e os jogos da trilha comum).
- Música feita no código ("Atari") nunca toca com internet, nem intercalada (antes a Rabiscolândia e o Vruuum! misturavam).
- Gravações com som de videogame / 8 bits saíram das listas em 06/Nov/2026 (arquivos continuam nas pastas): Bit Bit Loop,
  Comic Game Loop - Mischief, Pixel Peeker Polka, Pookatori and Friends, Laserpack (ft. DarkNES) e RetroFuture Nasty.
  Também saíram seis arquivos da `rabiscolandia/musicas/` que **só têm silêncio** depois do primeiro instante
  (Carefree, Fluffing a Duck, Investigations, Local Forecast – Elevator, Sneaky Snitch e Wallpaper).
- Vigia: `teste/regra-musica.test.js` (sorteio com a favorita no fim, nada de música do código com internet, favorita sem
  internet, listas com ≥ 10 arquivos que existem e nenhum dos que saíram).

## Testes

`node --test <jogo>/teste/*.test.js` na raiz deste repositório (Node + Playwright com o Chromium do ambiente).
`node --test teste/*.test.js` é o vigia da estante: todo jogo do catálogo tem interruptor, obedece o app `kids`, e quem usa a
trilha comum toca pelo menos 10 músicas que existem.
