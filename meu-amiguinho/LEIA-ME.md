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
3. **Me deixa fofinho!** — o **coraçãozinho** (6 cores): segurar = beijinho + desejo, e ele voa para dentro da pelúcia;
   a **máquina de fofura** (carrocinha com rodas, janela de flocos girando e luzes que trocam): segure o botão, os flocos
   voam pelo bico e a pelúcia incha; medidor pouco · no ponto · cheio demais; no ponto = estrelinhas; cheio demais =
   gordinha engraçada; 🤗 Apertão tira um pouco.
4. **Me veste!** — 35 roupas num guarda-roupa de cabides (pijamas, macacão com pezinho e touca, vestidos, tule, tutu,
   jardineiras, camisetas, moletom, polo, corta-vento, jaquetas, colete de skatista, uniforme, 6 heróis próprios com capa
   e máscara, duende, Papai Noel, abóbora, pinguim, boneco de neve, dinossauro, neve), cores, estampas próprias e
   **patches** no peito (letras A–Z e figurinhas). Cada roupa tem versão de 4 patas (casaco nas costas, mangas nas patas da
   frente, perninhas de trás).
5. **Me enfeita!** — **balcão de caixinhas de acrílico** (12 caixinhas, 50 acessórios, vários ao mesmo tempo, um por
   caixinha): laços (cores, glitter, pedrinhas, gigante, mini arco-íris, fitinhas), tiaras e chapéus, óculos, colares,
   coleira com guia, pulseiras e pochete, mochilas e asas, na mãozinha, filhotinho no colo (da mesma espécie, com nome) e
   ursinho de bolso, unicorninho abraçadinho, sapatos e patins, skate, muletas e cadeira de rodas (nos de 4 patas, carrinho
   de rodas). Escolher um pode tirar outro (patins × skate etc., `CONFLITOS` no `dados.js`).
6. **Me dá uma voz!** — uma ou duas frases: prontas (com o nome de quem cuida), escritas (até 60 letras) ou **gravadas**
   (5 s, efeito "voz de bichinho" = mais agudo). A gravação fica **só no aparelho** (IndexedDB), nunca é enviada; o
   microfone só é pedido no toque em Gravar. Jeito de falar (fininha, de urso, devagarinho) e sons fofos.
7. **Me dá um nome!** — nome (🎲 sorteia), nome do filhotinho, quem vai cuidar, padrinho/madrinha e a data de hoje.

**Pronto!** → caixinha-casinha balança, o telhado abre e o amiguinho pula com confete → tela do amiguinho: ele respira,
pisca, reage ao toque (abraço, aceno, pulinho; os de 4 patas passeiam e rolam; a preguiça balança no galho; o robozinho
troca a carinha), dança com a música; o **❤ no peito** fala a frase (alternando as duas). **📜 Certidão** de nascimento
(salva como PNG no aparelho). **📚 Minha coleção**: vitrine com casinhas; já vem com dois exemplos (a coala Alice com a
nenenzinha Kaká, e a ovelhinha Coraçãozinho de casaco de Papai Noel), que não se apagam (editar vira um novo).

**Níveis:** 🐣 Fácil (menos opções em cada etapa) · 🐥 Médio (tudo) · 📋 Encomenda (difícil: um cartão pede um amiguinho,
"uma coelhinha de pelo rosa, de pijaminha lilás, com laço azul e patins", às vezes com cor do coração e ponto de fofura;
estrelas por acerto).

**Personagens entre os jogos:** cada amiguinho salvo vai para `../personagens.js` (`'amiguinho:' + id`, retrato 256×256 e
corpo 384×512) e aparece no Vruuum! e na Purpurina; apagar tira de lá.

## Mapa

| Arquivo | O quê |
|---|---|
| `dados.js` | Etapas, cores, pelos, olhos, turma (bases), roupas, estampas, patches, caixinhas e acessórios, conflitos, vozes, frases prontas, níveis. |
| `arte.js` | Todo o desenho em SVG: geometria e **pontos de ancoragem** por base (`AmiguinhoArte.geo`), camadas, roupas em pé e de 4 patas, acessórios, robozinho e LED, máquina, caixinha, cabide, certidão, vitrine. |
| `regras.js` | Montar (base, corpo, roupa, acessórios com conflitos), fofura, frases, Encomenda (pedido e estrelas), validar dado lido, coleção no `localStorage` (`bolinho:meu-amiguinho:colecao`) com os exemplos. |
| `voz.js` | Efeitos WebAudio, fala do aparelho (voz mais fininha), gravação e IndexedDB (`meu-amiguinho`/`vozes`), vozes prontas (`vozes/lista.json`, hoje vazia). |
| `vivo.js` | A pelúcia viva: partes com pivô animadas com curvas suaves; ~30 qps no aparelho fraco; "reduzir movimento" = só pisca. |
| `app.js` | Telas, histórico (uma entrada por etapa), painéis, máquina, Pronto, certidão PNG, coleção, personagens. `?teste` → `window.AmiguinhoDebug`. |
| `teste/` | `regras.test.js` (montagem, encaixe de cada peça em cada base, encomenda, coleção), `arquivos.test.js`, `pagina.test.js` (no Chromium). |

Versão: `APP_VERSION` no `app.js` = `VERSAO` no `sw.js` = 1ª entrada do `versoes.json`.
