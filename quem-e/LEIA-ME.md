# Quem é? — adivinhar quem é, com o Melekento Blue e a Pink Honey

Brincadeira da família **Bolinho de Chuva** (SolverONE), em **solverone.com.br/kids/quem-e/**. Sem login, sem cadastro.
Os anfitriões são as massinhas das filhas do dono: o **Melekento Blue** (geleia azul de espuma) e a **Pink Honey**
(melequinha rosa que escorre mel). O nome em inglês, escondido por enquanto, é *Who Is It?*.

## Duelo de Caras (v0.1.0)

Cada jogador escolhe uma cara em segredo. Na sua vez, você faz **uma** coisa: **pergunta** ("Usa óculos?", "Tem
coroa?") ou **dá o palpite** ("É este!"). Quem responde é o outro jogador, com **👍 Sim** e **👎 Não**, e o jogo confere
com a verdade: resposta errada não passa ("Olha de novo…"). Depois da resposta, **"Descartar quem…"** vira de uma vez
todas as caras que não servem (ou vire uma por uma com o dedo) e **"✅ Pronto, passar a vez"**. Palpite errado: a carta
vira e a vez passa. Acertou, ganhou.

- **Modos:** 🤖 contra a meleca (ela escolhe o segredo, responde e pergunta sozinha) · 🔁 passando o aparelho (com
  cortina entre as vezes) · 📱 cada um no seu celular, com um código de 4 letras (precisa de internet nos dois).
- **Níveis:** 🐣 Fácil 12 caras (perguntas fáceis de ver; as cartas viram sozinhas) · 🐥 Médio 24 (barba, brinco, peruca,
  nariz de palhaço, cor da roupa) · 🦉 Difícil 36 (tipo de chapéu e de óculos, cor dos olhos, sardas).
- **Tabuleiro novo a cada partida:** as caras são sorteadas e desenhadas pelo jogo (`caras.js`), com nomes sorteados
  (metade de menino, metade de menina). Ninguém real é desenhado.
- **Lupa:** 🔍 e tocar numa cara, ou segurar o dedo nela.
- **Voz da meleca** (voz do aparelho, 🗣️ liga e desliga) e **🔊** em cada pergunta. Música: 12 gravadas (`trilha.js`).

## Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | as telas (começo, modos, níveis, rede, segredo, jogo, cortina, fim). CSP sem script inline. |
| `estilo.css` | visual: menta, azul geleia, rosa mel, tinta ameixa, fonte Fredoka |
| `nomes.js` | os nomes das caras (≥ 80 de cada) |
| `logica.js` | motor sem tela: características, perguntas por nível, sorteio do tabuleiro (semente), a meleca-computador |
| `partida.js` | regras da vez (perguntar, responder conferido, descartar, pronto, palpite) para os três modos |
| `caras.js` | desenha cada cara em SVG (busto), com versão detalhada para a lupa |
| `melecas.js` | as duas melecas em SVG, com 6 humores (animação no CSS) |
| `rede.js` | dois aparelhos: diário numerado dos eventos, pulso que reenvia o que faltou, segredo só no aparelho do dono; canal Supabase Realtime (`?teste` = BroadcastChannel) |
| `app.js` | a tela do Duelo e o começo; `APP_VERSION` |
| `adivinha-perguntas.js`, `adivinha.js`, `aprender.js`, `voz.js`, `adivinha-tela.js`, `personagens/` | A Meleca Adivinha (perguntas, motor, aprender, voz, tela, lista pronta) |
| `sw.js`, `manifest.webmanifest`, ícones | instalar e abrir sem internet |
| `teste/` | `logica`, `caras`, `melecas`, `partida`, `rede` (Node) · `pagina`, `arquivos` · `navegador` (Playwright: partidas inteiras, telas pequenas, lupa, duas abas em rede) · `folha-caras.html` (conferência visual das caras, fora do jogo) |

Testes: `node --test quem-e/teste/*.test.js` (rodar da raiz do repositório).

## A Meleca Adivinha (v0.2.0)

A pessoa pensa em alguém (de desenho, de filme, famoso, um bicho, uma coisa ou alguém da casa) e a meleca descobre com
perguntas. Respostas: **Sim · Acho que sim · Não sei · Acho que não · Não**, e ↩️ volta uma pergunta.

- **Níveis:** 🧒 Infantil (só perguntas fáceis e personagens que criança conhece) · 👨‍👩‍👧 Família · 🧑 Adulto (a lista inteira).
- **Lista pronta:** 667 personagens em `personagens/*.js` (familia, disney, desenhos, filmes, musica, famosos, mundo) e 134
  perguntas em `adivinha-perguntas.js`. Só nome e emoji, nunca foto.
- **Como ela pensa** (`adivinha.js`): chance para cada personagem, que cai com respostas que não combinam (com sobra, para
  aguentar resposta errada); a próxima pergunta é a que mais divide os mais prováveis; chuta quando tem certeza ou nas
  perguntas 20, 30 e 40; até 4 chutes. Respondendo certo, acerta todo mundo da lista com umas 11 perguntas; com 10% das
  respostas trocadas, acerta mais de 92% (`teste/adivinha-real.test.js`).
- **João Alves**, a lenda da casa: está em `personagens/familia.js`; quando ela acerta, festa especial e "Qual João foi hoje?".
- **Aprende** (`aprender.js`): quando perde, "Em quem você pensou?". Nome da lista pronta = guarda a correção; nome novo =
  personagem novo (da casa). ✏️ **Ensinar alguém** cadastra alguém do zero respondendo perguntas. 📦 **O que a meleca
  aprendeu**: esquecer, 📤 exportar e 📥 importar (para passar a outro celular). Tudo só neste aparelho
  (`bolinho:quem-e:aprendidos`); nome da família nunca vai para a internet.
- **Voz** (`voz.js`): a do aparelho sempre; 🎙️ **Voz animada** (ElevenLabs) é opcional, com a chave da pessoa no cofre comum
  (`../cofre.js`, `ia:elevenlabs`); cada fala fica guardada (Cache Storage `quem-e-voz`) e repete sem gastar e sem internet.

## Próxima brincadeira

Corpo inteiro no Duelo de Caras, Jogar pertinho e o resto em `PENDENCIAS.md`.
