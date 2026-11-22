# Purpurina Nova Era — especificação do motor de movimento (referência do dono)

Guardado a pedido do dono em 22/Nov/2026: "a ideia é ter um funcionamento minimamente decente antes de eu ter os
créditos do Higgsfield recarregados". Reúne as especificações que ele trouxe (geradas no Gemini, 21–22/Nov/2026) e o
estado real de cada item no jogo, com o porquê das decisões. **Leia antes de mexer no movimento, no desfile, na
Baladinha ou no desenho do corpo.** Situação válida para a versão **0.9.10**.

Legenda: ✅ feito · 🟡 feito de outro jeito (mesmo resultado na tela) · ❌ não feito, com o motivo.

## 1. Esqueleto e pivôs

| Pedido | Situação | Onde |
|---|---|---|
| Cada parte gira na articulação (ombro, cotovelo, quadril, cabeça), não no centro da peça | ✅ | `boneca.js` (`bracoRig`, `.rig-cabeca`, `.pp-passo-*` com `transform-origin` no quadril) |
| Pontas arredondadas nas juntas (sem frestas) | ✅ | `seg()` em `bracoRig` (cápsulas); braço em duas passadas (contorno, depois preenchimento) |
| Árvore completa quadril → coluna → pescoço / coxa → joelho → tornozelo | 🟡 | Sem joelho e tornozelo separados: seria preciso redesenhar todas as calças, saias e sapatos em pedaços. O joelho "dobra" encolhendo a perna e levantando o pé (`perna()` no `animador.js`) |
| Cintura sem degrau entre blusa e calça | ✅ | O corpo inteiro se curva em duas faixas que se encontram na linha do quadril (`.pp-rebola`, `.pp-banda-*`; 0.9.4) |
| Contorno fino 25% mais escuro, nunca preto; degradê de volume | ✅ | `esc(cor, …)` nos traços; gradientes `vol` e `lado` |
| 8,5 cabeças de altura | ❌ | O dono pediu "tamanhos normais" e antes reclamou da adulta "muito esticada". Hoje: adulta com 6,8 cabeças, pernas com quase metade da altura, pescoço, braços e pernas na grossura medida de gente de verdade (0.9.5) |

## 2. Camadas (o que fica na frente)

| Pedido | Situação | Onde |
|---|---|---|
| Mão na nuca: antebraço e mão atrás da cabeça e do cabelo da frente, na frente do cabelo de trás | ✅ | `bracoRig(lado, atras)` desenha o antebraço duas vezes (`.rig-frente-*` e `.rig-atras-*`); `maoAtras(o, c)` escolhe; o animador troca (0.9.7) |
| Catwalk: a perna que vem para a frente fica por cima da outra | ✅ | O animador reordena `.pp-passo-e` / `.pp-passo-d` no DOM a cada troca (0.9.9) |

## 3. Movimento orgânico

| Pedido | Situação | Onde |
|---|---|---|
| Passo assimétrico (`fase = w + 0,22·sen w`) | ✅ | `fase()` no modo `andar` |
| Atrasos: coluna 0,15, cotovelo 0,30, pulso e cabelo 0,45 | 🟡 | Ombros 0,15, cotovelo 0,45, cabeça 0,6. Não há pulso nem cabelo de trás soltos no esqueleto |
| Micro-movimento parado (`sen(1,7t)·0,6 + cos(2,9t)·0,4`) | ✅ | `passo()` do animador: cabeça, cotovelos e tronco |
| Respiração | ✅ | Peito sobe e desce de leve (`resp`, ~4 s) |
| Pé plantado (sola paralela ao chão) | ✅ | O sapato gira e estica ao contrário da perna em volta do tornozelo (`data-ae` / `data-ad`; 0.9.9) |
| Sombra de cada pé no chão | ✅ | `.pp-sombra-pe-*`: escura no apoio, mais clara e menor quando o pé sobe (0.9.9) |

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

## 6. GIF para compartilhar (0.9.10)

`gif.js`: grava a cena 10 vezes por segundo, monta cada quadro com 360 px de largura e codifica um GIF que se repete
(256 cores por quadro, compressão LZW). Tudo no aparelho, sem internet. Botões 🎞️ GIF no fim do desfile e na
Baladinha, com 📤 Compartilhar (WhatsApp e outros apps) e 💾 Salvar. Ainda não roda no módulo `Fundo` (o jogo não
tem): se sair da tela no meio, o GIF se perde.

## 7. O que fica para quando houver créditos no Higgsfield

Fundos pintados (salão, provador, manicure, maquiagem, passarela), músicas compostas e ícones 3D: ver a tarefa
programada "Purpurina: checar créditos do Higgsfield" e `../purpurina/AGENDA.md`. Personagem pintada por IA em
camadas (pendência da Nova Era) só depois dos fundos.

## 8. Como conferir sem celular

- `node --test purpurina-nova/teste/*.test.js` (os testes da Nova Era conferem cada item acima).
- Quadros do andar: criar o animador com `modo: 'andar'` num desenho com `{ rig: true, passos: true }` e fotografar a
  cada ~150 ms (o mesmo jeito usado nas conversas de 21–22/Nov/2026).
