# FRUTA PODRE — mapa do jogo

Estilingue com física de verdade do Bolinho de Chuva (solverone.com.br/kids/fruta-podre/). A Duda e o Téo arremessam
frutas passadas na fortaleza das pragas que roubaram os doces da turma. Especificação completa do dono:
`ESPECIFICACAO.md`; o que ainda falta dela: `PENDENCIAS.md`.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | as telas: começo (`#menu`, com o botão `#btJogar`), jogo (`#jogo`, sobre o canvas `#cena`), fim de fase (`#fim`), Como jogar (`#ajuda`) e `#desligado` |
| `estilo.css` | visual das telas (placas de feira com contorno grosso); abre espaço para a barra 🏠/🚪 com `--nav-alto` e `--nav-largo` |
| `regras.js` | regras sem tela (`FrutaRegras`): frutas, pragas, materiais, níveis, dano, pontos, estrelas e a previsão da parábola |
| `fases.js` | as 8 fases do Mundo 1 (`FrutaFases`), no formato JSON da especificação (seção 6.2) |
| `mundo.js` | o mundo de uma fase com o Matter.js (`FrutaMundo`): blocos, pragas, galões, frutas, poderes, explosões, turno, vitória e derrota |
| `arte.js` | toda a arte, desenhada em canvas (`FrutaArte`): frutas, pragas, blocos, estilingue, garotos e a quitanda |
| `som.js` | efeitos sonoros sintetizados no WebAudio (`FrutaSom`) |
| `app.js` | telas, câmera, controles (dedo, mouse, teclado e controle da TV), partículas, garotos e o laço do jogo |
| `libs/matter.min.js` | a física (Matter.js 0.20.0, MIT, licença em `libs/LICENSE-matter.txt`) |
| `sw.js` | guarda o jogo no aparelho pela peça comum `../sw-comum.js` (versão nova só entra inteira) |
| `icone.svg`, `icone-192.png`, `icone-512.png`, `manifest.webmanifest` | ícone e instalação |
| `versoes.json` | novidades de cada versão (PT, EN, ES) |
| `teste/` | `arquivos.test.js` (peças e versões), `regras.test.js` (regras e física no Node), `pagina.test.js` (no navegador) |

Rodar os testes da raiz do repositório: `node --test fruta-podre/teste/*.test.js`.
Com `?teste` na página aparece `window.FrutaDebug` (jogar, estado, lancar, poder, vencer, semFrutas).

## Unidades e coordenadas

O mundo é medido em pixels: o chão fica em y = 600 e cada peça das fases é dada pelo centro. A física roda 60 passos
por segundo (gravidade 1, como na especificação); a velocidade é em pixels por passo. A câmera transforma o mundo na
tela: acompanha a fruta, afasta quando ela sobe e volta ao estilingue quando tudo para.

## O que entrou no MVP (versão 0.1.0, 19/Nov/2026)

- **Mundo 1, A Quitanda do Seu Zé**, com 8 fases de madeira, vidro e pedra; o galão de vinagre (explode em cadeia)
  aparece a partir da fase 5. Cenário de feira: céu, casas coloridas, bandeirinhas, barraca de toldo listrado, caixotes,
  balança antiga e calçada de ondas.
- **5 frutas com poder** (toque no ar): Maçã Podre (o verme grita e empurra o que é leve), Trio Uva-Passa (vira 3 em
  leque), Pimenta Malagueta (jato reto que fura madeira e vidro), Melancia Passada (despenca como bigorna) e Abacaxi
  Azêdo (explode no toque ou 1 s depois de bater).
- **Pragas**: Mosca Zumbidora (fraca), Barata Cascuda (média) e Rato Ladrão (capacete de tampinha, aguenta 2 golpes).
  Ninguém se machuca: a praga fica tonta, com estrelinhas, e some num "puf".
- **Física** com o Matter.js: dano = massa × velocidade relativa² × multiplicador do material; o bloco que passa do
  limiar quebra em pedaços com estilhaços, lascas ou poeira. O turno acaba quando tudo para (ou em 6 s).
- **Controles**: arrastar a fruta para trás no estilingue (elástico com limite), linha pontilhada (fácil: até o impacto;
  médio: 35 %; difícil: 20 %), rastro fantasma do tiro anterior, toque no ar = poder; teclado e controle da TV (⬆⬇
  ângulo, ⬅➡ força, OK lança e usa o poder). Antes do tiro dá para arrastar a tela e usar a pinça (ou a rodinha do mouse)
  para ver a fortaleza.
- **Pontos e estrelas**: +5.000 por praga, +10 a +500 por pedaço de bloco, +10.000 por fruta que sobra; 3 estrelas pelas
  metas de cada fase, guardadas no aparelho (`bolinho:fruta-podre:progresso`); a fase seguinte destrava ao vencer.
- **Garotos**: puxam o elástico com esforço, comemoram quando algo desaba e põem a mão na cabeça quando o tiro erra.
- **Sons** feitos no WebAudio (botão 🔊) e a **trilha comum** com 12 músicas gravadas (favorita: Sneaky Snitch).
- Três idiomas (PT-BR, EN-US, ES da Espanha), sem botão de idioma próprio; respeita "reduzir movimento" (sem tremer a
  tela); a cena só começa a se mexer depois da tela "Carregando…" (tablet velho).
