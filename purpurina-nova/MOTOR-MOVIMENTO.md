# Purpurina Nova Era — especificação do motor de movimento (referência do dono)

Guardado a pedido do dono em 22/Nov/2026: "a ideia é ter um funcionamento minimamente decente antes de eu ter os
créditos do Higgsfield recarregados". Reúne as especificações que ele trouxe (geradas no Gemini, 21–22/Nov/2026) e o
estado real de cada item no jogo, com o porquê das decisões. **Leia antes de mexer no movimento, no desfile, na
Baladinha ou no desenho do corpo.** Situação válida para a versão **0.9.16**.

Legenda: ✅ feito · 🟡 feito de outro jeito (mesmo resultado na tela) · ❌ não feito, com o motivo.

## 1. Esqueleto e pivôs

| Pedido | Situação | Onde |
|---|---|---|
| Cada parte gira na articulação (ombro, cotovelo, quadril, cabeça), não no centro da peça | ✅ | `boneca.js` (`bracoRig`, `.rig-cabeca`, `.pp-passo-*` com `transform-origin` no quadril) |
| Pontas arredondadas nas juntas (sem frestas) | ✅ | `seg()` em `bracoRig` (cápsulas); braço em duas passadas (contorno, depois preenchimento) |
| Árvore completa quadril → coluna → pescoço / coxa → joelho → tornozelo | 🟡 | Joelho desde a 0.9.14: cada perna sai em dois pedaços cortados na mesma linha do joelho (`.pp-canela-*`, `data-j`), e a canela entorta em volta dessa linha (não abre fresta, não precisa redesenhar calça nem sapato). O corte do lado da perna fica **dentro** da canela (senão a canela entortada traz um pedaço da outra perna: "perna fantasma"). Tornozelo: o sapato desentorta em volta dele. Baladinha e pulo usam `joelho: false` (uma cópia a menos de cada perna) |
| Cintura sem degrau entre blusa e calça | ✅ | O corpo inteiro se curva em duas faixas que se encontram na linha do quadril (`.pp-rebola`, `.pp-banda-*`; 0.9.4) |
| Contorno fino 25% mais escuro, nunca preto; degradê de volume | ✅ | `esc(cor, …)` nos traços; gradientes `vol` e `lado` |
| 8,5 cabeças de altura | ❌ | O dono pediu "tamanhos normais" e antes reclamou da adulta "muito esticada". Hoje: adulta com 6,8 cabeças, pescoço, braços e pernas na grossura medida de gente de verdade (0.9.5). Em 0.9.13 (dono: "pernas um pouco compridas", "pescoço muito comprido", "braços arqueados"): quadril 3,0 e ombro 1,2 (adulta), braço do mesmo tamanho e rente ao corpo (`ENCURTA` 0,79, pulso base 124/276), pose solta quase reta (`relax` 4/2) |

## 2. Camadas (o que fica na frente)

| Pedido | Situação | Onde |
|---|---|---|
| Mão na nuca: antebraço e mão atrás da cabeça e do cabelo da frente, na frente do cabelo de trás | ✅ | `bracoRig(lado, atras)` desenha o antebraço duas vezes (`.rig-frente-*` e `.rig-atras-*`); `maoAtras(o, c)` escolhe; o animador troca (0.9.7) |
| Catwalk: a perna que vem para a frente fica por cima da outra | ✅ | O animador reordena `.pp-passo-e` / `.pp-passo-d` no DOM a cada troca (0.9.9). **Linha única** (0.9.12, GIF do dono mostrou as pernas abrindo em "A"): na menina as pernas sempre fecham para a linha do meio (`dentro * (0,62 + 0,38 * max(0, frente))`, nunca para fora do quadril) e no ar a perna vem reta para a frente; uma passa NA FRENTE da outra pela troca de camada. (A tentativa da 0.9.11 de contornar por fora abriu as pernas demais e foi desfeita.) |

## 3. Movimento orgânico

| Pedido | Situação | Onde |
|---|---|---|
| Passo assimétrico (`fase = w + 0,22·sen w`) | ✅ | `fase()` no modo `andar` |
| Atrasos: coluna 0,15, cotovelo 0,30, pulso e cabelo 0,45 | 🟡 | Ombros 0,15, cotovelo 0,45, cabeça 0,6. Não há pulso nem cabelo de trás soltos no esqueleto |
| Micro-movimento parado (`sen(1,7t)·0,6 + cos(2,9t)·0,4`) | ✅ | `passo()` do animador: cabeça, cotovelos e tronco |
| Respiração | ✅ | Peito sobe e desce de leve (`resp`, ~4 s) |
| Pé plantado (sola paralela ao chão) | ✅ | O sapato gira e estica ao contrário da perna em volta do tornozelo (`data-ae` / `data-ad`; 0.9.9) |
| Sombra de cada pé no chão | ✅ | `.pp-sombra-pe-*`: escura no apoio, mais clara e menor quando o pé sobe (0.9.9) |
| Braço caído sem "parêntese" | ✅ | 0.9.15 (dono/Gemini: "braços armados como parênteses ( )"). O braço de base (`bracoRig`) já desce 10° para fora (ombro x 150, punho x 124), então o braço caído usa o ombro **para dentro** (`o` −6 a −4) e o cotovelo quase reto (`c` −3 a −5): o cotovelo fica perto da cintura. Vale no `relax`, no braço solto de `cintura`, `beijo`, `tchau`, `olhaE`/`olhaD` (do lado para onde o quadril vai, −1: acompanha o quadril) e no desenho sem pose. Andando: `abre` 1 (menina) e 5 (menino). Manga um pouco menos bufante (12,3k / 10,3k) |
| Mão relaxada de lado (sem "punho cerrado de frente") | ✅ | 0.9.15. `maoDeLado()` no `boneca.js`: palma virada para a coxa, fina e comprida vista de frente, polegar na frente, dedos curvando para a perna, aliança e esmalte. As duas mãos saem no desenho (`.rig-mao-frente-*` / `.rig-mao-lado-*`) e o animador mostra uma só: `maoSolta(o, c)` = braço caído (`o < 35`, `−40 < c < 45`) |
| Descanso assimétrico | ✅ | 0.9.15: `relax` com base `leve`; antes era `reta`, simétrica. 0.9.16: quadril 8 px para a esquerda e `solta` 1 (a perna direita dobra e o pé vira para fora) |
| Parada: peso numa perna, a outra solta (contrapposto) | ✅ | 0.9.14 (dono: "mão no ombro com o braço esquerdo… a perna e o pezinho virar para o lado direito"). `solta` nas `BASES` `gingaD`/`gingaE` (o quadril vai para o lado do peso). A perna solta gira 8° para o meio (joelho para dentro), a canela volta (`kE`/`kD` = ∓0,24), encolhe 3,5% (calcanhar sai do chão), passa na frente da outra e o pé vira **para fora** (ponta para o lado de fora do corpo, como nas referências de pose do dono, 22/Nov/2026; a primeira versão virava para dentro e foi trocada) — com o **desenho do sapato de lado** (`.pp-sapato-lado-*`, o mesmo da vitrine, `sapatoLado()` com calcanhar redondo, peito do pé e ponta, do tamanho do sapato de frente), nunca o de frente entortado (0.9.15; na 0.9.14 era `rotate/skewX` e virava um "bloquinho torto"). **Giro contínuo** (0.9.16, dono: "o pé vira para o lado de uma vez"): sem troca seca de `display`. Um número de 0 (frente) a 1 (lado) anda junto com a perna (`tDentro`, da `solta` interpolada; na vitrine `viraE`/`viraD`, do quanto o pé subiu): o sapato de frente estreita (`scaleX 1 − 0,5t`) e some devagar, o de lado cresce a partir do tornozelo (`0,3 + 0,7t`) e aparece devagar (cruzamento entre 0,3 e 0,7). Vale para todos os calçados sem redesenhar nenhum. (O morphing ponto a ponto sugerido pelo Gemini pediria refazer os 27 calçados com os mesmos pontos.) Só parada (`modo` vazio: estúdio, apresentação, fim do desfile); menino fica plantado (`cruza` 0). Bota, galocha, patins e cano alto (sapato com mais de 60 de altura) não giram nem desentortam: vão inteiros com a perna, senão o cano sai da calça |
| Piscar natural | ✅ | O olho pisca sozinho de tempos em tempos (`anim`); sem piscadinha fixa na placa da Baladinha (0.9.13) |

## 4. Perfis menina × menino (`BIO` no `animador.js`)

| Parâmetro | Menina | Menino | Situação |
|---|---|---|---|
| Pernas | Cruzam para a linha do meio | Trilhos paralelos (não cruzam) | ✅ |
| Quadril para o lado | Amplo (`quadril: 1,25`, ~15 px) | Mínimo (`0,2`, ~2,5 px) | ✅ |
| Inclinação do quadril e ombros em "S" | Pedida | Quase nula | ❌ Inclinar abria linhas na blusa e degraus no braço (testado na 0.9.7 e desfeito). Fica o "S" para os lados: quadril vai, ombros voltam um pouco |
| Braços | Perto do corpo, cotovelo dobra na ida | Mais soltos e afastados (`abre: 10`, `cotovelo: 24`) | ✅ |
| Parado | Pode pôr mão na cintura ou na nuca | Mão no bolso ou braços cruzados (`troca`) | ✅ |
| Idade | — | Pequeno: 1,25× mais rápido e quica 1,3×; adolescente e adulto: 0,95× | ✅ |

## 5. Passarela de frente (sem flutuar)

| Pedido | Situação | Onde |
|---|---|---|
| Escorço: pé da frente mais embaixo, o de trás mais em cima | ✅ | `compr = 1 + 0,05·frente` em `perna()` |
| Joelho sobe e o pé levanta no ar | ✅ | `y = −9·sobe`, `sy × (1 − 0,1·sobe)` |
| Quadril desce no pouso e sobe no meio do passo | ✅ | `v.cy` |
| Avançar pela passarela crescendo (do fundo à frente) | ✅ | `lugar(k)` no `app.js`: número inteiro de passadas, velocidade constante, freando só no fim |
| Faixas do chão deslizando | ❌ | Quem anda é a modelo, não a câmera; com o chão andando parece esteira |
| Sombra colada nos pés | ✅ | `drop-shadow(0 3px 4px)` (antes 12 px, parecia flutuar) |

## 5b. Pé de lado, vitrine e transições (0.9.16)

- **Sapato de lado** (`sapatoLado()` no `boneca.js`; dono: "cadê o sapatinho de lado… que coisa torta"): medidas de pé de
  verdade — comprido e baixo, o tornozelo (`A = x + 10`) em cima do calcanhar e o pé indo para a frente, calcanhar redondo,
  boca do sapato em curva, peito do pé, ponta arredondada e sola marcada; tênis com cadarço. Salto: o calcanhar no alto, o
  arco do pé descendo até a ponta e o salto fino embaixo. Descalça: arco, calcanhar e dedão. O contorno do pé não risca a
  emenda com a perna (`peNu`). Bota e cano alto sobem pela perna.
- **Sapato de frente em dois grupos** (`.pp-sapato-frente-e/-d`, cada um recortado no seu lado por dentro): estreitando um
  pé ao virar, o pedaço do outro pé não entra no recorte da perna (era um "fantasminha").
- **Virar como cartão**: o de frente estreita até 30% e, nesse instante, vira o de lado, também fininho, que alarga. Nunca os
  dois ao mesmo tempo meio transparentes.
- **Zoom no pé (vitrine)**: ela passa o peso de uma perna para a outra (ciclo de 6 s, curva suave), a perna solta dobra o
  joelho e o pé vira para fora; sem levantar o pé no ar. O calcanhar quase não sobe (`esy` 1,2%), senão o pé de lado
  parecia flutuar.
- **Sem pulo ao trocar de modo** (`misturaDe`): andar → pose no fim do desfile, entrar e sair da vitrine: o corpo vai do
  último quadro para o novo em 0,6 s.
- **Mão** de frente ↔ de lado aos poucos (`wl`, pelo ângulo do ombro e do cotovelo).
- **Baladinha**: o pé da perna que dobra gira para fora na batida (`peE`/`peD` = 0,85 · batida).
- **Pernas cruzadas** (base `cruzada`, segunda foto de referência): a perna solta gira mais e a canela volta menos, o pé
  pousa na frente do outro.

## 6. Pulo (0.9.11)

Modo `pular` do animador (placa de entrada da Baladinha): agacha (pernas encolhem a partir do quadril, joelhos abrem um
pouco, corpo desce o mesmo tanto, braços para trás), impulsiona, fica no ar (`.pp-rebola` sobe; a sombra fica no chão e
diminui), pousa amortecendo e volta. Ciclo de 1,1 s.

## 7. GIF para compartilhar (0.9.10)

`gif.js`: grava a cena 10 vezes por segundo, monta cada quadro com 360 px de largura e codifica um GIF que se repete
(256 cores por quadro, compressão LZW). Tudo no aparelho, sem internet. Botões 🎞️ GIF no fim do desfile e na
Baladinha, com 📤 Compartilhar (WhatsApp e outros apps) e 💾 Salvar. Ainda não roda no módulo `Fundo` (o jogo não
tem): se sair da tela no meio, o GIF se perde.

## 8. Referências de pose do dono (22/Nov/2026)

Fotos e figuras que o dono mandou como "pose natural decente". **Ficam só como referência: nenhuma foto entra no repositório**
(é público, e as fotos têm direito de imagem). O que cada uma ensina:

- **Foto de campanha de moda (modelo encostada numa barra)**: o peso numa perna só, reta, com o quadril bem para esse lado;
  o joelho da outra dobra para dentro, quase encostando no outro; o pé dela fica um pouco à frente, virado para fora,
  com o calcanhar um pouco erguido; ombros e cabeça inclinam para o lado contrário do quadril; olha para o lado, sorrindo.
- **Folhas de personagem de criança (frente, três quartos, perfil, costas) e poses de menina de vestido**: na pose solta o
  pé relaxado vira para fora e o joelho dobra para dentro; de três quartos os pés apontam para o lado do corpo; o pé de
  lado é comprido, com calcanhar, peito do pé e ponta (nunca o pé de frente entortado).
- **Silhuetas de ginástica e balé**: braços e pernas longos e soltos, mãos alongadas (nunca "bolinhas"), pontas dos pés
  esticadas.

## 9. O que fica para quando houver créditos no Higgsfield

**Fundos pintados: feitos** (24/Nov/2026, aprovados pelo dono): `fundos/camarim.webp`, `provador`, `manicure`, `maquiagem`,
`passarela` (Qwen-Image, 1328×1328, ~50–70 KB cada), como cenários em `pecas.js` (o camarim é o padrão). No desenho é um
`<image>` que cobre o quadro (`boneca.js`, `PINTADOS`); a foto e o GIF embutem a imagem (`PurpurinaFundos.embutir` no
`app.js`, usado também pelo `gif.js`), porque o desenho vira uma imagem fechada que não busca arquivos. Falta: o resto
abaixo.

Fundos pintados (salão, provador, manicure, maquiagem, passarela), músicas compostas e ícones 3D: ver a tarefa
programada "Purpurina: checar créditos do Higgsfield" e `../purpurina/AGENDA.md`. Personagem pintada por IA em
camadas (pendência da Nova Era) só depois dos fundos.

## 10. Como conferir sem celular

- `node --test purpurina-nova/teste/*.test.js` (os testes da Nova Era conferem cada item acima).
- Quadros do andar: criar o animador com `modo: 'andar'` num desenho com `{ rig: true, passos: true }` e fotografar a
  cada ~150 ms (o mesmo jeito usado nas conversas de 21–22/Nov/2026).
