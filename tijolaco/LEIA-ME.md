# TIJOLAÇO / BrickFreak / Ladrillolío — o jogo da obra

Publicado em **solverone.com.br/kids/tijolaco/**. Proposta completa (elementos E1 a E40) em `../docs/tijolaco/PROPOSTA.md`;
referência de jogabilidade do modo de fila em `../docs/tijolaco/REFERENCIA-TIJOLINTO.md`.

## O que entrou no MVP (0.1.0, 19/Nov/2026)

- **Tela de começo**: letreiro do nome feito de tijolos (no idioma da estante), os 5 modos em cartões (**TijoLinto**
  jogável; Obra, Demolição, Canteiro e Mutirão com a fita "Em breve"), nível Fácil/Médio/Difícil, as 8 fases com estrelas
  (as trancadas com cadeado), **▶ Jogar** (`#btJogar`, começa na próxima fase destravada), ❓ Como jogar e 🔊.
- **Modo TijoLinto** (E6): betoneira-canhão que gira 360° seguindo o dedo/mouse, com o tijolo da vez na boca e o próximo
  no funil (toque nela ou Espaço para trocar); 6 tijolos de material, cada um com cor e desenho próprios; canaleta de
  concreto num caminho Catmull-Rom (tabela de 1 em 1 unidade); rolo compressor de brinquedo empurrando a fila; encaixe
  antes/depois com animação de 120 ms; 3 ou mais estouram; ímã com combo em cadeia (nota subindo); manilhas onde a fila
  some (e pontes por cima); **portões** que desviam a fila por um caminho mais longo (com cadeado enquanto ela passa);
  poderes (marreta, ré do rolo, sinal vermelho e fio de prumo); tiro na brecha; capacete dourado; Barra da Obra ("Obra
  pronta!"); tijolo de ouro até a caçamba na vitória; a fila caindo na caçamba na derrota; caçamba que abre com giroflex
  e bate-estaca acelerando nos últimos 15 %.
- **8 fases** (`fases.js`): Fundação (espiral), Serpentina (S), A Manilha (cruzamento com manilha), O Portão, Labirinto
  (dois portões e manilha), Duas Frentes (dois caminhos, duas caçambas), Cruzamento (dois caminhos que se cruzam e um
  portão) e No Andaime (o lançador anda num trilho). Em pé o campo vira (x↔y) sozinho.
- **Níveis**: fácil 4 cores, fila lenta, mira completa; médio 5 cores, mira média; difícil 6 cores, fila rápida, mira curta.
- **Controles**: toque/mouse; teclado e TV (← → giram, OK atira, ↑ ou Espaço troca, 1–9 abrem/fecham portões, Tab escolhe
  o portão e ↓ mexe nele). Na fase 8, ← → andam com o carrinho no andaime.
- **Guardado no aparelho**: `bolinho:tijolaco:progresso` (estrelas e recorde por fase) e `bolinho:tijolaco:pref`
  (nível, sons, última fase).

## Mapa dos arquivos

| Arquivo | O quê |
|---|---|
| `index.html` | telas (começo, jogo, fim, como jogar, desligado); peças comuns na ordem do Bolinho |
| `estilo.css` | visual das telas e do placar (o canteiro é canvas) |
| `regras.js` | `TijolacoRegras`: caminho (Catmull-Rom → tabela), fila, encaixe, estouro, ímã, portões, poderes, tiro, vitória/derrota. Roda no Node (testes) |
| `fases.js` | `TijolacoFases`: as 8 fases em JSON (campo de 1000 × 620) |
| `arte.js` | `TijolacoArte`: cenário pintado UMA vez num canvas fora da tela + o que mexe a cada quadro |
| `som.js` | `TijolacoSom`: efeitos de obra no WebAudio |
| `app.js` | telas, controles, placar, laço; `?teste` expõe `window.TijolacoDebug` |
| `sw.js` | guarda o jogo no aparelho pela peça comum `../sw-comum.js` |
| `teste/` | `arquivos`, `regras` e `pagina` (Playwright) |

Leve para tablet velho: nada é desenhado antes de a tela "Carregando…" sair; o cenário é pintado uma vez; os tijolos são
figurinhas prontas; devicePixelRatio no máximo 2; "reduzir movimento" tira o tremor e diminui as partículas.

Testes (da raiz do repositório kids, um de cada vez):
`node --test tijolaco/teste/arquivos.test.js` · `node --test tijolaco/teste/regras.test.js` · `node --test tijolaco/teste/pagina.test.js`
