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
| `jogos/bolinhas.js` | Bolinhas da Angústia: game show na parede de pinos (física própria, leve), Solo + Parceiro virtual ou Dois na mesma tela, 3 fases e o Contrato; especificação do dono em `BOLINHAS-ESPECIFICACAO.md` |
| `jogos/bolinhas-perguntas.js` | as 100 perguntas do Bolinhas (40 de 2 opções, 30 de 3, 30 de 4), dificuldade 1 a 3, em PT/EN/ES |
| `estilo.css` | visual da casca (cada jogo traz o próprio estilo, prefixado) |
| `sw.js`, `manifest.webmanifest`, `versoes.json` | instalar e jogar sem internet (peça comum `../sw-comum.js`), versão |

## Jogo novo dentro da Jogoteca

1. `jogos/<id>.js` registrando `{ id, ajuda(t), iniciar(palco, ctx) }` (contrato no começo do `app.js`; `ctx.somLigado()` diz se o 🔊 está ligado, para quem usa WebAudio próprio).
2. A entrada em `LISTA` (tirar `breve: true`) e o texto dos níveis em `NIVEL_TXT`, no `app.js`; a capa em `capas.js`.
3. `<script src="jogos/<id>.js">` no `index.html` e o arquivo no `ARQUIVOS` do `sw.js`.
4. Subir `APP_VERSION` (app.js), `VERSAO` (sw.js) e a entrada nova em `versoes.json`.
5. Testes: `node --test jogoteca/teste/*.test.js` (rodar da raiz do repositório).
