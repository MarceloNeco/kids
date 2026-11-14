# AQUA — despejar os líquidos coloridos

Brincadeira da família **Bolinho de Chuva** (SolverONE). Frascos de vidro com camadas de líquidos coloridos: a criança
despeja a cor de cima de um frasco no outro até cada frasco ficar de uma cor só. Sem login, sem anúncio, sem compra, e
**sem internet** depois de aberto uma vez. O nome é o mesmo em português, inglês e espanhol: **AQUA**.

Endereço: https://solverone.com.br/kids/aqua/

É a **nossa versão** de um gênero conhecido (ordenar líquidos por cor, "water sort"): nome, desenho, cores, sons,
fases e código são próprios. O dono joga o MAGIC SORT e mandou um print como inspiração; nada de lá foi copiado.

## Como brincar

- **Toque num frasco**: ele levanta. **Toque em outro**: a cor de cima despeja nele. Passam de uma vez todas as
  camadas iguais que estão juntas no topo, até onde couber.
- Só dá para despejar num frasco **vazio** ou **em cima da mesma cor**.
- Frasco **cheio de uma cor só** ganha uma rolha e brilha. Todos fechados = fase vencida.
- Tocar de novo no frasco levantado solta. Tocar num frasco que não combina passa a levantar esse.

| Nível | Cores | Camadas por frasco | Frascos vazios | Frascos embaçados | Para quem |
|---|---|---|---|---|---|
| 🫧 Fácil | 3 (fases 1–4), 4 (5–12), 5 (13 em diante) | 3 (4 depois da fase 30) | 2 | não tem | os pequenos (4 a 6 anos) |
| 🧪 Médio | 5 (1–5), 6 (6–12), 7 (13–22), 8 (23 em diante) | 4 | 2 | 0 (1–6), 1 (7–18), 2 (19 em diante) | 6 a 10 anos |
| 🌋 Difícil | 8 (1–4), 9 (5–10), 10 (11–26), 11 (27–36), 12 (37 em diante) | 4 (5 depois da fase 18) | 2; nas fases 8, 12 e 16, **1 só** ("fase aperto") | 2 (1–10), 3 (11 em diante) | os grandes |

- As fases são numeradas e **não acabam**. A fase N de um nível é sempre a mesma em qualquer aparelho (o sorteio sai
  do nível e do número da fase). A tabela é a função `AquaMotor.config(nivel, fase)` do `motor.js`.
- **Toda fase tem solução.** O gerador sorteia uma arrumação e só a aceita depois que o resolvedor achou o caminho
  inteiro (`AquaMotor.resolver`). O teste `teste/motor.test.js` gera 400 fases de cada nível e joga cada uma até o
  fim pelas regras do jogo.
- **Frasco embaçado** (🌫️): as camadas de baixo aparecem cinzentas com "?" até virarem a de cima. Só passa o pedaço
  que está à vista.

## Ajudas (nunca custam nada; voltam cheias a cada fase)

| Ajuda | Fácil | Médio | Difícil |
|---|---|---|---|
| ↩️ Desfazer a última jogada | sem limite | 5 | 3 |
| 💡 Dica (mostra 1 → 2: de qual frasco para qual) | sem limite | 3 | 1 |
| 🔀 Embaralhar (mistura de novo o que não está pronto, sempre com solução) | 3 | 2 | 1 |
| ➕ Mais um frasco vazio (o frasco de ajuda tem contorno dourado tracejado) | 2 | 1 | 1 |
| 🔄 Recomeçar a fase (em cima, à direita) | sem limite | sem limite | sem limite |

- No **Fácil**, depois de uns 9 segundos parado, o jogo mostra sozinho uma jogada boa. Essa dica não gasta nada e não
  tira estrela.
- A dica segue **um caminho só** até o fim (`AquaMotor.plano`, guardado enquanto a pessoa o segue); pedir dica várias
  vezes seguidas nunca manda ir e voltar entre dois frascos.
- Se a arrumação ficou sem saída, a dica avisa (e não gasta); se não sobra nenhuma jogada, o jogo avisa "Travou!" e
  chama as ajudas.
- **⭐ Estrelas**: 3 sem nenhuma ajuda; 2 se usou só desfazer ou dica; 1 se usou embaralhar ou frasco extra.
  "Jogar esta de novo" deixa melhorar.

## Gotinhas 💧 e lojinha de brincadeira

- Cada fase nova vencida dá **10 gotinhas por estrela** (10, 20 ou 30). Repetir uma fase dá 10 por estrela a mais
  que antes (no mínimo 2).
- Na **🛍️ Lojinha** as gotinhas trocam por 6 modelos de frasco (Tubinho, Potinho, Garrafa de leite, Poção, Gatinho,
  Foguete) e 4 cenários (Tarde de chuva, Fundo do mar, Festa junina, Espaço). **Só muda a aparência**: nada deixa o
  jogo mais fácil, nada trava fase nenhuma.
- **Não existe dinheiro no jogo**: sem compra, sem anúncio, sem moeda paga. Tudo fica guardado só neste aparelho.

## Para todo mundo

- **🔣 Desenho em cada cor** (botão no começo): cada cor ganha um desenho (♥ ▲ ★ ...) para quem confunde as cores.
- Teclado: Tab chega em cada frasco e Enter joga. Leitor de tela: cada frasco diz as cores de cima para baixo.
- Celular **em pé e deitado**, tablet e computador: os frascos se arrumam em fileiras do maior tamanho que couber
  (deitado, as ajudas vão para a direita).
- Com "reduzir movimento" ligado no aparelho: sem balanço, bolhas nem confete (o despejo continua, é ele que mostra a jogada).
- 🏠 Início e 🚪 Saída no canto de cima (peça comum `../navegacao.js`). Português, inglês e espanhol: o idioma é
  escolhido só na estante (`../idioma.js`), sem botão no jogo.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | A página: começo, jogo, lojinha e fim de fase. |
| `motor.js` | **As regras, sem tela**: despejo, frasco pronto, frasco embaçado, dificuldade de cada fase, gerador, resolvedor, caminho da dica, embaralhar, frasco extra. Roda igual no Node (testes). |
| `desenho.js` | O desenho no canvas: vidro, líquido sempre nivelado (mesmo com o frasco inclinado), ondinha, bolhas, rolha, brilho, prateleira, fio do despejo. As 12 cores, os 6 modelos de frasco e os 4 cenários moram aqui. |
| `som.js` | Efeitos sonoros gravados (`sons/`), tocados pelo WebAudio; reserva feita na hora se a gravação não abrir. |
| `app.js` | A tela: toques, animação do despejo, ajudas, estrelas, gotinhas, lojinha, música (12 gravadas pela trilha comum). |
| `estilo.css` | Visual (fonte Fredoka da Rabiscolândia) e os fundos dos cenários. |
| `sw.js` | Guarda o jogo no aparelho (sem internet). Subir `VERSAO` a cada versão. |
| `sons/` | Os efeitos gravados (água, bolha, rolha, vidro, sininho, aplausos). Créditos no `CREDITOS.md`. |
| `teste/` | `motor.test.js` (regras e 400 fases por nível), `arquivos.test.js` (versão, sw, créditos), `pagina.test.js` (o jogo no navegador). |

Guardado no aparelho: `localStorage` `aqua.pref` (sons, desenho nas cores, fase de cada nível, estrelas,
gotinhas, itens da lojinha) e `bolinho:aqua:trilha-mudo` (música desligada). Nenhum dado pessoal.

## Testes

Da raiz do repositório kids: `node --test aqua/teste/*.test.js`
