# Meu Pequeno Amiguinho — a oficina de pelúcia

Brincadeira da família **Bolinho de Chuva** (SolverONE), em **solverone.com.br/kids/meu-amiguinho/**. Em inglês
*My Little Buddy*, em espanhol *Mi Pequeño Amiguito* (o idioma vem da estante, `../idioma.js`). A pasta e o endereço
continuam `meu-amiguinho/`. Sem login, sem banco: tudo fica no aparelho.

## Como é (v0.1.0, 22/Nov/2026)

Sete etapas, cada uma com um **selo oval numerado** e título carinhoso; "1 de 7", ◀ Voltar e Próximo ▶; o **🎁 Pronto!**
fica sempre à vista (o resto já vem escolhido). O Voltar do celular volta uma etapa.

1. **Me escolhe!** — 26 bichinhos da nossa turma, cada um com nome e personalidade (o balão conta), **em pé** ou **de 4
   patas** quando o bicho deixa: urso, coelha, cachorro, gato, gatinha preta, panda, ovelha (4 patas), preguiça (braços
   compridos, máscara, pode ficar pendurada no galho), dino, girafa, elefante, unicórnio, capivara, coala, raposa,
   pinguim, leão, braquiossauro (pescoçudo), poodle, cãozinho laranja, lulu, husky, gatinho rajado, ovelhinha de carinha
   preta, robozinho de pelúcia (telinha de LED com expressões animadas) e porquinho. A pelúcia começa "sem roupa".
2. **Me dá cor!** — 22 pelos (lisos, tie-dye pastel e lilás com brilho), cor e jeito dos olhos (brilhantes, com cílios,
   bordados) e bochechas.
   **Barra de tom ☀️ ↔ 🌙** (dono, 22/Nov/2026, "como no Purpurina"): tocou numa cor do pelo, da roupa ou de um acessório,
   aparece embaixo das bolinhas a barra "Mais claro ou mais escuro", com o degradê daquela cor; arrastando, o amiguinho
   muda na hora. Fica em `amigo.tom` (`{ pelo, roupa, acess: { id } }`, de −1 a 1; `R.tom`, `A.comTom`); o contorno, a
   sombra e o focinho acompanham. Amiguinho antigo, sem `tom`, fica igual. O holográfico não tem tom (é arco-íris). No
   balcão, enquanto a barra aparece, saem os nomes "Cor" e o da caixinha aberta (a etapa continua sem rolar).
3. **Me deixa fofinho!** — o **coraçãozinho** (6 cores): segurar = beijinho + desejo, e ele voa para dentro da pelúcia;
   a **máquina de fofura** (carrocinha com rodas, janela de flocos girando e luzes que trocam): segure o botão, os flocos
   voam pelo bico e a pelúcia incha; medidor pouco · no ponto · cheio demais; no ponto = estrelinhas; cheio demais =
   gordinha engraçada; 🤗 Apertão tira um pouco.
4. **Me veste!** — guarda-roupa de cabides em **três grupos** numa prateleira (como o balcão da etapa 5, todos à vista):
   **Roupas inteiras** (38: pijamas, macacões, vestidos, tule, tutu, jardineiras, camisola, uniforme, 6 heróis próprios com
   capa e máscara, fantasias de duende, Papai Noel, abóbora, pinguim, boneco de neve, dinossauro, sapinho, marinheiro e
   túnica de escola de magia), **Partes de cima** (30: camisetas lisas e estampadas, raglan, regata, blusas de tule e de
   babado, moletons, colete, jaquetas, casaco de pelúcia) e **Saias e shorts** (21: 7 saias e tutus, shorts, bermuda,
   sunguinha e calças). A parte de baixo fica em `amigo.baixo` + `corBaixo` (lista `BAIXOS` no `dados.js`) e combina com a
   parte de cima; **a roupa inteira tira a parte de baixo e a parte de baixo tira a roupa inteira** (`R.vestir`,
   `R.vestirBaixo`). Cores (com a barra de tom), estampas próprias e **patches** no peito (letras A–Z e figurinhas, só com
   blusa). Cada peça tem versão de 4 patas (casaco nas costas, mangas nas patas da frente, perninhas de trás; sem blusa,
   short e calça cobrem o traseiro e as pernas de trás, e saia e tutu abrem como um sininho presos num cós na cintura).
   Peças das fotos do dono: `REFERENCIAS.md`, seções 1 a 4. Amiguinho guardado antes (parte de cima que vinha com bermuda
   ou calça, `vinhaCom`): ganha a mesma parte de baixo, separada e na mesma cor.
5. **Me enfeita!** — **balcão de caixinhas de acrílico** (12 caixinhas, 50 acessórios, vários ao mesmo tempo, um por
   caixinha): laços (cores, glitter, pedrinhas, gigante, mini arco-íris, fitinhas), tiaras e chapéus, óculos, colares,
   coleira com guia, pulseiras e pochete, mochilas e asas, na mãozinha, filhotinho no colo (da mesma espécie, com nome) e
   ursinho de bolso, unicorninho abraçadinho, sapatos e patins, skate, muletas e cadeira de rodas (nos de 4 patas, carrinho
   de rodas). Escolher um pode tirar outro (patins × skate etc., `CONFLITOS` no `dados.js`).
6. **Me dá uma voz!** — uma ou duas frases: prontas (com o nome de quem cuida), escritas (até 60 letras) ou **gravadas**
   (5 s, efeito "voz de bichinho" = mais agudo). A gravação fica **só no aparelho** (IndexedDB), nunca é enviada; o
   microfone só é pedido no toque em Gravar. **Voz de menininha (♀) ou de menininho (♂)** (`amigo.genero`; sem escolha,
   vem do bichinho, o `g` da turma; amiguinho antigo sem o campo também): a fala do aparelho escolhe pelo nome uma voz
   feminina ou masculina do idioma, com tom de criança (menininha mais aguda; com uma voz só no aparelho, o tom
   diferencia). Jeito de falar (fininha, de urso, devagarinho, sempre no gênero escolhido) e sons fofos.
7. **Me dá um nome!** — nome (🎲 sorteia), nome do filhotinho, quem vai cuidar, padrinho/madrinha e a data de hoje.

**Pronto!** → caixinha-casinha balança, o telhado abre e o amiguinho pula com confete → tela do amiguinho: ele respira,
pisca, reage ao toque (abraço, aceno, pulinho; os de 4 patas passeiam e rolam; a preguiça balança no galho; o robozinho
troca a carinha), dança com a música; o **❤ no peito** fala a frase (alternando as duas). **📜 Certidão** de nascimento
(salva como PNG no aparelho). **📚 Minha coleção**: vitrine com casinhas; já vem com dois exemplos (a coala Alice com a
nenenzinha Kaká, e a ovelhinha Coraçãozinho de casaco de Papai Noel), que não se apagam (editar vira um novo).

**Sem níveis nem Encomenda** (dono, 22/Nov/2026: "é só para desenho tranquilo"): a tela de começo tem só ✨ Criar e
📚 Minha coleção, e todas as opções ficam liberadas sempre. Rascunhos e amiguinhos guardados antes (com `nivel`, `enc`
ou estrelas de encomenda) abrem normal; esses campos são ignorados. `D.NIVEIS` e o campo `facil` no `dados.js` não são
mais usados.

**Tela sem texto saindo da caixinha:** nomes dos cartões quebram em até 2 linhas e, se preciso, a fonte diminui um pouco
(`encaixarTextos`); nada de reticências; o balcão mostra **todas** as caixinhas em fileiras (aguenta 14 a 16); a fileira de
itens corre para o lado com a ponta esfumada enquanto tem mais; nada embaixo da bolinha 🎵. Vigia: `teste/textos.test.js`.
Tablet e computador deitados (dono, 23/Nov/2026): bichinho grande à esquerda (~48 % da largura, altura toda), escolhas à direita com cartões de 95 px ou mais, cores e barra de tom com alvo de 44 px, rodapé proporcional. Vigia: `teste/paisagem.test.js` (1024×600, 1280×800, 1340×800, 1920×1080).
**Miniatura de acessório** (`miniDoAcess` no `app.js`): desenha com e sem a peça, dá zoom nas partes novas (pés,
cabeça, mão…) e, se a peça fica atrás do corpo (mochila), mostra a peça sozinha. **📤 Compartilhar** a certidão (quando o
aparelho deixa compartilhar arquivo; senão, só 💾 Salvar).

**Personagens entre os jogos:** cada amiguinho salvo vai para `../personagens.js` (`'amiguinho:' + id`, retrato 256×256 e
corpo 384×512) e aparece no Vruuum! e na Purpurina; apagar tira de lá.

## Mapa

| Arquivo | O quê |
|---|---|
| `dados.js` | Etapas, cores, pelos, olhos, turma (bases), roupas (com o grupo: inteira ou de cima), partes de baixo (`BAIXOS`) e os grupos do guarda-roupa, estampas, patches, caixinhas e acessórios, conflitos, vozes, frases prontas, níveis. |
| `arte.js` | Todo o desenho em SVG: geometria e **pontos de ancoragem** por base (`AmiguinhoArte.geo`), camadas, roupas em pé e de 4 patas, acessórios, robozinho e LED, máquina, caixinha, cabide, certidão, vitrine. |
| `regras.js` | Montar (base, corpo, roupa, parte de baixo, acessórios com conflitos), tom, fofura, frases, gênero da voz (`R.genero`), validar dado lido (peça que mudou de caixinha vai para a caixinha atual), coleção no `localStorage` (`bolinho:meu-amiguinho:colecao`) com os exemplos. |
| `voz.js` | Efeitos WebAudio, fala do aparelho (voz de menininha ou de menininho), gravação e IndexedDB (`meu-amiguinho`/`vozes`), vozes prontas (`vozes/lista.json`, hoje vazia; `vozes/<idioma>/<f\|m>/<frase>.mp3`). |
| `vivo.js` | A pelúcia viva: partes com pivô animadas com curvas suaves; ~30 qps no aparelho fraco; "reduzir movimento" = só pisca. |
| `app.js` | Telas, histórico (uma entrada por etapa), painéis, máquina, Pronto, certidão PNG, coleção, personagens. `?teste` → `window.AmiguinhoDebug`. |
| `teste/` | `regras.test.js` (montagem, encaixe de cada peça em cada base, coleção), `arquivos.test.js`, `pagina.test.js`, `textos.test.js` (nenhum texto fora da caixinha, em pé e deitado × 3 idiomas × todas as opções), `paisagem.test.js` (aproveitamento da tela deitada), `voz.test.js` (menininha/menininho), `alinhamento.test.js` (no Chromium). |

Versão: `APP_VERSION` no `app.js` = `VERSAO` no `sw.js` = 1ª entrada do `versoes.json`.
