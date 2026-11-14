# GLUB GLUB — Bolinho de Chuva

Pescaria da família **Bolinho de Chuva** (SolverONE · kids). O **Juca**, no barquinho, e a **Lili**, na ilhota, pescam no
**lago encantado**: em cima é a represa da roça; quanto mais fundo, mais mágico, e lá embaixo moram tubarões, baleia,
orca, sereia Iara e o raríssimo **Pirarucu Dourado**. Sem login e **sem internet** depois de aberto uma vez (pode ser
instalado). Endereço: https://solverone.com.br/kids/glub-glub/

## Como brincar

- **🎣 Pescar**: o anzol balança sozinho, de um lado para o outro. Ao apertar, ele **mergulha em linha reta na direção em
  que estava** e pega o **primeiro** bicho que encostar. Sem nada até o fundo ou a borda, volta vazio. Tocar no lago
  também pesca (sozinho: em qualquer lugar; em dois: cada um no seu lado da tela). Teclado: espaço (sozinho), A e L (em dois).
- **⬆️ Subir**: segurando, a linha recolhe mais rápido (o bicho grande sobe devagar); na descida, desiste.
- **Pontos**: quanto mais fundo, mais vale (o número fica em cima de cada bicho). Prêmios: bota velha (1), garrafa com
  bilhete (10) e baú (15). Pirarucu Dourado: 500.
- **🪣 Balde**: cada um tem um pedido desenhado (ex.: 2 lambaris e 1 pacu). Encheu: **+10 segundos** e pedido novo.
- **Bolhas de poder**: 🕸️ rede da vovó (pega até 3 juntos), ⚡ anzol ligeiro (10 s mais rápido), 🪱 minhoca dourada (um
  bicho grande sobe até o meio por 6 s).
- **♻️ Limpa o Rio!**: quando faltam 32 s, a água fica turva e cai lixo (PET, lata, sacolinha, chinelo, pneu); por 15 s,
  pesca-se o lixo, que vale pontos. No fim: “Rio limpo! 🌿”.
- **Partida**: 60 segundos. No fim, os pontos de cada um, festa para quem ganhou e o total dos dois juntos.
- **📒 Álbum**: cada bicho pescado vira figurinha (fica no aparelho).
- **Jeitos de jogar**: sozinho (o outro personagem é jogado pelo aparelho, no mesmo nível) ou **em dois no mesmo
  aparelho** (tablet ou celular deitado, cada um com o seu nível; o lago segue o nível mais fácil dos dois).
- **Níveis**: fácil (poucos peixinhos em cima, devagar), médio e difícil (muitos, rápidos, mudando de direção, e o anzol
  balança mais depressa).
- **🕒 Hora do dia**: segue o relógio (dia, entardecer, noite) ou escolha ☀️ 🌅 🌙. O lugar muda a cada partida: roça,
  mar aberto ou serra.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `regras.js` | Todas as regras, sem tela (roda no Node para os testes): bichos, níveis, pêndulo, mergulho, balde, poderes, bônus, robô, relógio. |
| `arte.js` | Desenho em canvas: cenário (3 lugares × 3 horas do dia), recife vivo, raios de sol, bolhas, personagens, linha e anzol; os bichos vêm das imagens 3D de `img/` (com o desenho do código de reserva) e ondulam ao nadar. |
| `som.js` | Efeitos sonoros feitos no WebAudio. |
| `app.js` | Telas (começo, jogo, fim, álbum), botões, placar, baldes, faixas e o laço. `?teste` liga o `GlubDebug`; `?vitrine` põe todos os bichos no lago. |
| `img/` | 35 imagens 3D (WebP com fundo transparente, ~1,4 MB ao todo). Créditos em `CREDITOS.md`. |
| `teste/` | `regras.test.js` (Node), `pagina.test.js` (Chromium) e `arquivos.test.js`. Rodar da raiz: `node --test glub-glub/teste/*.test.js`. |

Versão: `APP_VERSION` no `app.js` = `VERSAO` no `sw.js` = primeira entrada do `versoes.json`.
