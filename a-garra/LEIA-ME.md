# A Garra — máquina de pegar bichinho de pelúcia

Brincadeira do Bolinho de Chuva (solverone.com.br/kids/a-garra/). A criança leva a garra, aperta **PEGAR** e tenta
levar um bichinho de pelúcia até o buraco do prêmio. Pedido do dono em 14/Nov/2026, com fotos de máquinas de um
fliperama como inspiração.

## Como se brinca

- **Máquina**: Cabine vermelha (como uma cabine de telefone), Neon verde (parede de tijolo e luz neon) ou Estrelas azul.
  Só muda o visual.
- **Nível**:
  - Fácil: 10 fichas, sem relógio, bichinhos grandes, e a garra nunca deixa cair (basta fechar em cima do bichinho).
  - Médio: 10 fichas, 20 s para mirar, a garra precisa fechar mais perto do meio e às vezes escorrega no caminho.
  - Difícil: 8 fichas, 12 s, bichinhos menores, a garra é mais fraca.
- **Controles**: segurar ⬅ ➡ (ou arrastar o dedo na máquina) e apertar PEGAR. No computador e no controle da TV:
  setas e espaço/Enter. Deitado, a "alavanca" fica à esquerda e o botão à direita, como na máquina de verdade.
- A garra desce, fecha, sobe e leva o bichinho até o buraco. Se fechar perto da borda, empurra o bichinho ("Quase!").
- **Coleção** (🧸 Minha coleção): 12 bichinhos e a **estrela dourada** rara (uma por máquina). Fica guardada no aparelho.
- Fim da partida: estrelas (★★★ com metade das fichas virando prêmio), o que veio e o recorde de cada nível.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Telas: menu, jogo, coleção, fim e "descansando" (interruptor desligado). |
| `maquina.js` | A máquina por dentro, sem desenho: bichinhos como bolinhas com física simples (o que fica parado "dorme" para a pilha não derreter), a garra (mirar → descer → fechar → subir → levar → soltar), fichas, relógio e os ajustes de cada nível (`NIVEIS`). Roda no Node para os testes. |
| `desenho.js` | Tudo o que se vê, desenhado em código: as três máquinas, a garra e os 13 bichinhos. |
| `som.js` | Efeitos feitos na hora (WebAudio). |
| `app.js` | Telas, controles, desenho a cada quadro, coleção, recordes e fim. `APP_VERSION` aqui. |
| `estilo.css` | Visual (em pé e deitado). |
| `sw.js`, `manifest.webmanifest`, `icone*` | Instalar e jogar sem internet. |
| `versoes.json` | O que mudou em cada versão (PT/EN). |
| `teste/` | `node --test a-garra/teste/*.test.js` (da raiz do repositório). |

Guardado no aparelho (`localStorage`): `bolinho:a-garra:pref` (máquina, nível, sons), `bolinho:a-garra:colecao`,
`bolinho:a-garra:recordes`. Nada sai do aparelho; sem login e sem banco.

Interruptor no RootifyONE: app **Bolinho de Chuva** (`kids`) → **A Garra** (`a-garra`).
Com `?teste` aparece `window.GarraDebug`; `?semente=N` repete a mesma máquina.
