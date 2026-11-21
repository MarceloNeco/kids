# Jogoteca — mapa

A biblioteca de jogos clássicos do Bolinho de Chuva (pendência 69, dono 19/Nov/2026): um cartão na estante; tocando em
Jogar, abre este menu com os jogos dentro. "Publicar como tem e ir ampliando" (dono): os prontos jogam; os outros aparecem
na vitrine com a fita "Em breve".

| Arquivo | O que faz |
|---|---|
| `index.html` | telas: menu (capas + prévia), jogo (barra + palco), janelas de ajuda e de vitória |
| `app.js` | a casca: lista dos jogos (`LISTA`, nomes e textos em PT/EN/ES), níveis, navegação 🏠/🚪, música, sons, contrato dos jogos |
| `capas.js` | capas em SVG de cada jogo (arte própria, sem texto) |
| `jogos/paciencia.js` | Paciência (Klondike): fácil vira 1, médio vira 3, difícil vira 3 sem desfazer |
| `jogos/sudoku.js` | Sudoku com gerador próprio de solução única; pistas por nível |
| `jogos/boliche.js` | Boliche em canvas, 10 jogadas com placar de verdade; fácil com proteção nas canaletas |
| `jogos/bolinhas.js` | Bolinhas da Angústia: game show na parede de pinos (física própria, leve). Uma pessoa joga sozinha, em duas modalidades (dono, 21/Nov/2026): ⏱ Queda Livre (2 opções, responder enquanto as bolinhas caem) e 🧘 Sem pressa (4 opções, sem tempo, em 2 passos no painel: 1/2 três zonas pelos 7 botões numerados, 2/2 as 4 opções); acertou, verdes que somam; errou, vermelhas que descontam; escada de 6 degraus até a 🏆 com portos seguros 🛟 no 2º e no 4º (as vermelhas não derrubam abaixo deles), até a meta, 12 perguntas ou 3 erros seguidos; placar no fim. Estúdio de TV em 2.5D com painel de LED animado atrás dos pinos (azul, verde no acerto, vermelho no erro), arco de luz, câmera da bolinha (ponto de vista) e acompanhamento bem de perto, câmera lenta no fim, música de tensão na queda e modo leve automático; especificação do dono em `BOLINHAS-ESPECIFICACAO.md` |
| `jogos/bolinhas-perguntas.js` | as 100 perguntas do Bolinhas (40 de 2 opções para a Queda Livre e 60 de 4 para o Sem pressa), dificuldade 1 a 3, em PT/EN/ES |
| `musicas/tensao-interloper.mp3` | a música de tensão que toca no Bolinhas do soltar até a última bolinha bater no fundo (a trilha pausa e depois continua de onde parou); crédito em `CREDITOS.md` |
| `jogos/batalha.js` | efeitos de guerra comuns ao Jogo da Velha e ao Xadrez: explosões, faíscas, tremor, letreiros de quadrinho (POW!), faixas (XEQUE!, VITÓRIA!), fogos e sons feitos no código |
| `jogos/velha.js` | Jogo da Velha de guerra (dono, 20/Nov/2026): ⚔️ espadas (Vermelho) × 🛡️ escudos (Azul); cada partida é uma batalha, quem vence 3 vence a guerra; contra o computador (fácil se distrai, médio bloqueia, difícil não erra) ou em dois |
| `jogos/xadrez.js` | Xadrez de guerra (dono, 20/Nov/2026): regras completas (roque, en passant, promoção — na tela o peão vira dama —, xeque-mate, afogado, empates); captura vira batalha animada; computador fácil (1 lance), médio (2) e difícil (3 + trocas); contra o computador ou em dois |
| `estilo.css` | visual da casca (cada jogo traz o próprio estilo, prefixado) |
| `sw.js`, `manifest.webmanifest`, `versoes.json` | instalar e jogar sem internet (peça comum `../sw-comum.js`), versão |

## Jogo novo dentro da Jogoteca

1. `jogos/<id>.js` registrando `{ id, ajuda(t), iniciar(palco, ctx) }` (contrato no começo do `app.js`; `ctx.somLigado()` diz se o 🔊 está ligado, para quem usa WebAudio próprio).
2. A entrada em `LISTA` (tirar `breve: true`) e o texto dos níveis em `NIVEL_TXT`, no `app.js`; a capa em `capas.js`.
3. `<script src="jogos/<id>.js">` no `index.html` e o arquivo no `ARQUIVOS` do `sw.js`.
4. Subir `APP_VERSION` (app.js), `VERSAO` (sw.js) e a entrada nova em `versoes.json`.
5. Testes: `node --test jogoteca/teste/*.test.js` (rodar da raiz do repositório).
