# Cozinha — juntar os ingredientes e cozinhar uma receita

Brincadeira da família **Bolinho de Chuva** (SolverONE). **Ideia da filha do dono.** A criança escolhe uma receita,
sai pela vila para juntar os ingredientes (pescando, colhendo, puxando da horta, pegando ovos, tirando leite, comprando
no mercadinho ou pedindo emprestado para a vizinha) e depois cozinha em casa, passo a passo, com os utensílios
certos. No fim aparece a **receita da família**, com estrelas. Sem login, e **sem internet** depois de aberto uma vez.

Endereço: https://solverone.com.br/kids/cozinha/

Esta versão (0.1.0, 06/Nov/2026) é uma **primeira proposta**: o dono quer entrevistar a filha para ajustar as receitas,
os lugares e os passos (pendência 2).

## Como brincar

1. **Escolha o nível e a receita.** A ficha mostra os ingredientes, quanto precisa de cada um (ex.: 3 ovos,
   2 xícaras de farinha) e os lugares onde achar cada um.
2. **Vila** (🧺 a cesta embaixo mostra o que já tem e o que falta; no Fácil e no Médio os lugares úteis brilham ✨):
   - 🎣 **Rio** — o peixinho nada de um lado para o outro; toque em *Puxar* quando ele passar dentro do círculo e ele
     pula feliz para o balde.
   - 🌳 **Pomar** — toque nas frutas maduras e coloridas; as verdinhas balançam e pedem para esperar (vão amadurecendo).
   - 🌱 **Horta** — toque 3 vezes (ou puxe o dedo para cima) para tirar o legume da terra; ele nasce de novo.
   - 🐔 **Galinheiro** — toque na galinha para ela levantar; se tiver ovo, pegue. Ovo novo aparece depois de um tempo.
   - 🐄 **Fazendinha da Mimosa** — carinho na vaca e *segure* o botão para encher a xícara de leite.
   - 🏪 **Mercadinho do Seu Zé** — no Fácil é tudo de presente; no Médio e no Difícil a criança toca nas moedas
     (de 5, 2 e 1) para pôr no balcão, paga e vê o **troco**. Se as moedas não dão para algo que só o mercado vende,
     aparece *Ajudar o Seu Zé a arrumar* (+2 moedas) — ninguém fica preso.
   - 👵 **Dona Cida, a vizinha** — empresta ovo, leite, farinha, açúcar, sal, manteiga e mel, com **favores
     contados**. O ingrediente só vai para a cesta depois de tocar em **💛 Obrigado**.
   - 🏠 **Casa** — com tudo na cesta, vai para a cozinha. Se falta algo, diz o quê.
3. **Cozinha**: a ficha da receita mostra os passos; para cada passo, escolha o **utensílio** certo e faça o
   movimento: lavar e mexer fazendo **círculos com o dedo** (ou o botão), **deslizar o dedo** para cortar com a faca
   sem ponta, tocar nos ingredientes para pôr na tigela, **segurar** para bater no liquidificador/batedeira/espremedor,
   girar o botão do fogão, esperar dourar e virar, forno/geladeira/relógio com contagem, tocar na massa para modelar e
   servir. Faca, fogão, forno, liquidificador e batedeira mostram a dica: **na cozinha de verdade, só com um adulto**.
4. **Pronto!** Prato com festa, estrelas (3 sem erros; menos com muitos erros ou se ficou de noite no Difícil) e a
   **📜 Receita da família** com os ingredientes e o modo de fazer na ordem em que a criança fez.

## Níveis

| | 🌱 Fácil | 🌻 Médio | 🌳 Difícil |
|---|---|---|---|
| Ingredientes | poucos (até 3), juntados em no máximo 2 lugares | a receita inteira, com as quantidades | a receita inteira |
| Mercadinho | de graça | moedas com folga (+4) | moedas contadas (+1) |
| Favores da vizinha | 5 | 3 | 2 |
| Ajuda na cozinha | o utensílio certo sempre brilha e a voz lê o passo | metade dos passos brilha; os outros depois de 8 s ou de um erro | só brilha depois de 2 erros |
| Ordem | na ordem da ficha | na ordem da ficha | **fichas misturadas**: a criança escolhe o próximo passo, e só vale o que faz sentido (não dá para servir antes de assar) |
| Extra | — | 2 utensílios a mais na bancada | 4 a mais, passos a mais, um **imprevisto** (o cachorrinho Biscoito pega 1 ingrediente da cesta ao chegar em casa) e o **sol andando no céu** (7 min; passou, vira noite e a criança perde só 1 estrela) |

## Receitas (12)

Bolo de cenoura · Panqueca de banana · Salada de frutas · Vitamina de banana · Brigadeiro · Pizza caseira ·
Sanduíche natural · Peixe assado com legumes · Omelete · Suco de laranja · Pão de queijo · Cookies de chocolate.
Toda receita começa lavando as mãos e termina servindo.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | As telas (entrada, menu, ficha, vila, lugar, cozinha, pronto). CSP sem script inline. |
| `dados.js` | **Receitas** (ingredientes, quantidades, passos), lugares, ingredientes, utensílios e níveis. Receita nova = uma entrada em `RECEITAS` (o comentário no topo explica os campos). |
| `logica.js` | Regras sem tela: cesta, moedas e troco, favores, passos de cada nível e a ordem, imprevisto, estrelas, texto de cada passo em PT/EN. |
| `desenhos.js` | Desenhos em SVG feitos em código (utensílios, ingredientes sem emoji, faca sem ponta, ícone do app). |
| `app.js` | Telas, mini-jogos da vila, cozinha, receita pronta, progresso, voz, sons, música, service worker. `APP_VERSION`. |
| `estilo.css` | Visual (fonte Fredoka da Rabiscolândia). |
| `sw.js` | Modo sem internet (cache `cozinha-v<VERSAO>`). Arquivo novo entra em `ARQUIVOS`. |
| `manifest.webmanifest`, `icone-192.png`, `icone-512.png`, `icone.svg` | Instalar como app. Os PNG saem do `icone.svg` (o mesmo desenho de `desenhos.js`). |
| `versoes.json` | Novidades de cada versão (PT/EN). |
| `CREDITOS.md`, `PENDENCIAS.md` | Créditos e licenças; lista de pendências. |
| `teste/` | Testes (ver abaixo). `teste/navegador.js` são os ajudantes do navegador (não é teste). |

Peças comuns usadas com `../`: `recursos.js` (interruptor `cozinha` do RootifyONE, app `kids` (Bolinho de Chuva)),
`atualizar.js` (aviso de versão nova), `telacheia.js`, `trilha.js` (música no canto, com 11 músicas da pasta
`../rabiscolandia/musicas/`) e `instalar.js` (só com `?instalar=1`).

## O que fica guardado (só neste aparelho)

`localStorage`: `bolinho:cozinha:pref` (língua, voz, sons, nível) e `bolinho:cozinha:progresso` (estrelas de cada
receita em cada nível e quantas receitas já foram feitas). A trilha guarda `bolinho:cozinha:trilha-mudo`.
Nenhum dado pessoal, nenhum nome de criança.

## Testes

Da raiz do repositório kids: `node --test cozinha/teste/*.test.js` (Node + Playwright com o Chromium do ambiente;
leva cerca de 2 minutos).

- `dados.test.js` — 10+ receitas, PT/EN, todo ingrediente se consegue em algum lugar em todo nível, Fácil em até 2
  lugares, moedas suficientes, passos válidos (lavar primeiro, servir por último, ordem certa, nada buscado à toa).
- `logica.test.js` — cesta, quantidades, moedas e troco, ajudar o Seu Zé, favores e obrigado, imprevisto, ordem dos
  passos, estrelas.
- `arquivos.test.js` — versão igual em `app.js`, `sw.js` e `versoes.json`; o `sw.js` guarda tudo; CSP; textos PT|EN;
  músicas com crédito; pendência da entrevista; nenhum segredo.
- `pagina.test.js` — joga a vitamina de banana do Fácil inteira no **celular** e no **computador** e o bolo de cenoura
  do Fácil no **tablet** (juntando na vila de verdade), o mercadinho com troco e a vizinha no Médio, o imprevisto e as
  fichas no Difícil, e o inglês — sem erro no console.
- `receitas.test.js` — cozinha **todas** as receitas no Médio e no Difícil até o fim.

`?teste` no endereço deixa as esperas bem curtas e as frutas maduras (só para os testes).
