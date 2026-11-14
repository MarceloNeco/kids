# Labirinto — Bolinho de Chuva

Brincadeira de labirinto da família **Bolinho de Chuva** (SolverONE · kids). Cada partida é um labirinto **novo**, feito
na hora, em três formatos e três níveis. A criança leva um **cachorrinho** pelos corredores ou **desenha o caminho** com
o dedo. Sem login, e **sem internet** depois de aberto uma vez (pode ser instalado).

Endereço: https://solverone.com.br/kids/labirinto/

## Como brincar

- **Formato**: ⬛ quadrado (jardim), ⚪ redondo (anéis e fatias, no espaço), ⬢ colmeia (hexágonos, cor de mel) ou
  🎲 surpresa (um de cada vez, alternando).
- **Nível**: fácil, médio ou difícil — o labirinto cresce (quadrado 6×8, 10×14 e 15×22; redondo com 4, 7 e 11 anéis;
  colmeia com 37, 91 e 217 casas). No difícil, no celular, a câmera chega perto e **segue o cachorrinho**; dois dedos
  aproximam e arrastam, e os botões 🔍+ 🔍− ⤢ (ver tudo) ficam embaixo à esquerda. No computador, a rodinha do mouse dá zoom.
- **🐶 Levar o cachorrinho**: toque onde o cachorrinho **consegue ver, em linha reta**, e ele vai andando até lá. Ele não
  acha o caminho sozinho (quem acha é a criança) e nunca vira por conta própria. Em linha reta quer dizer: no ⬛ quadrado,
  a mesma fileira ou a mesma coluna; na ⬢ colmeia, uma das 6 direções retas; no ⚪ redondo, o mesmo anel (pelo lado mais
  curto) ou a mesma fatia, para dentro ou para fora. Se tiver parede no meio, ele anda até a última casa antes da parede e
  para. Se o toque pedir uma curva, ele fica no lugar, inclina a cabeça com um "hmm?" e um somzinho, e as casas que ele
  enxerga brilham por ~1 s. Arrastando o dedo, ele segue o rastro do dedo, sempre em retas, virando só onde o dedo virou.
  Anda a 3,5 casas por segundo, sempre no mesmo ritmo, com patinhas alternando, corpo balançando, orelhas e rabo mexendo
  e poeirinha atrás; parado, respira, abana o rabo e pisca (com "reduzir movimento", só desliza). No computador, as
  **setas** do teclado andam uma casa por vez.
- **✏️ Desenhar o caminho**: arraste o cachorrinho (a ponta da linha). Se a linha tentar atravessar uma parede, ela
  **para** na parede e não continua; aparece um anel piscando na ponta e um pontilhado do dedo até ela — volte o dedo até
  a ponta e siga dali. **↩** desfaz o último traço, **🗑️** apaga a linha (se apagar o trecho onde pegou o item, o item volta
  e a porta fecha de novo). As setas também desenham, uma casa por vez.
- **🦴 Missão** (em cerca de 7 de cada 10 labirintos): a saída começa **trancada** (porta vermelha com cadeado). Primeiro
  pegue o item do meio — osso, chave, estrela ou tesouro. Ao pegar: confete, o cachorrinho pula, uma estrelinha voa até a
  porta e a porta abre brilhando. Sem missão, é só achar a saída 🏁 (no redondo sem missão, a meta é a bandeira no meio).
- **Fim**: o cachorrinho sai pela porta, chovem confetes e fogos, e aparecem de 1 a 3 ⭐ pelo tempo (comparado com o
  tamanho do caminho certo). O recorde de estrelas de cada formato e nível aparece no menu.
- **🔄** faz outro labirinto; o botão ✏️/🐶 da barra troca o jeito de brincar e recomeça o mesmo labirinto.
- **3D**: ao começar, a câmera vem do alto, girando e chegando perto, e as paredes sobem de dentro para fora. As paredes
  têm altura e se inclinam como vistas de cima, mudando conforme a câmera anda. Com "reduzir movimento" ligado no
  aparelho, a abertura é só um esmaecer e as festas ficam sem pulos nem confete.
- Música: a trilha comum do Bolinho (🔇 desliga, ⏭ pula), com 12 músicas da Purpurina e da Peluqueria. 🔊 no menu liga e
  desliga os efeitos. EN/PT troca a língua. 🏠 volta para o Bolinho de Chuva; o Voltar do celular sai do labirinto para o menu.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | As telas (menu, jogo, fim). Interruptor `data-recurso="labirinto"` (RootifyONE). |
| `gerador.js` | Gera o labirinto pela semente (busca em profundidade): quadrado, redondo e colmeia, três tamanhos, entrada, saída e item. |
| `regras.js` | Em que casa está um ponto, o que o cachorrinho enxerga em linha reta (`reta`, `visiveis`), caminho certo (só por passagens abertas), colisão da linha com as paredes (passinhos curtos, nunca fura), missão e estrelas. |
| `desenho.js` | Chão e paredes em 3D, cachorrinho (andar com patas, balanço, orelhas, rabo; parado respirando; "hmm?"), itens, cadeado, bandeira, confetes. |
| `som.js` | Efeitos feitos na hora (WebAudio). |
| `app.js` | Telas, câmera, toques, pinça, teclado, festa, recordes (`localStorage`: `bolinho:labirinto:pref` e `bolinho:labirinto:recordes`). `APP_VERSION`. |
| `sw.js` | Sem internet (cache `labirinto-v…`). `VERSAO`. |
| `manifest.webmanifest`, `icone.svg`, `icone-192.png`, `icone-512.png` | Instalar (ícone original, feito em SVG e exportado para PNG). |
| `versoes.json` | Novidades de cada versão (PT/EN/ES). |
| `teste/` | Testes: `node --test labirinto/teste/*.test.js` (da raiz do repositório kids). |

Peças da raiz usadas com `../`: `recursos.js`, `atualizar.js`, `telacheia.js`, `trilha.js`, `instalar.js` (só com
`?instalar`), e a fonte da Rabiscolândia.

## Para testar no computador

`?teste` liga o `window.LabirintoDebug`; `?semente=123` fixa o labirinto; `?missao=1` ou `?missao=0` força a missão.
Idioma: português, inglês ou espanhol, escolhido só na estante (`../idioma.js`); o jogo não tem botão de idioma. Textos com
`data-t="pt|en|es"`, rótulos (aria-label) com `data-rotulo="pt|en|es"` e `t(pt, en, es)` no `app.js`.

A cada versão: subir `APP_VERSION` (app.js), `VERSAO` (sw.js) e a entrada nova em `versoes.json` — os testes conferem.
