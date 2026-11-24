---
name: threejs
description: Como escrever código 3D com Three.js nos apps da SolverONE (motor-pixel, jogos do Bolinho de Chuva, RiseONE). Usar sempre que for criar ou mexer em cena 3D, câmera, luz, material, modelo .glb, animação, sombra ou shader com Three.js.
---

# Three.js na SolverONE

Base: as instruções oficiais para IAs do próprio Three.js (`docs/llms.txt` do repositório github.com/mrdoob/three.js,
licença MIT, cópia em `referencia/`), adaptadas às regras da plataforma (dono, 24/Nov/2026).

## Regras da SolverONE (valem antes das do Three.js)

1. **Nunca CDN.** O Three.js mora uma vez só no aparelho, na gaveta compartilhada do motor:
   `solverone.com.br/motor-pixel/1.0/libs/three.module.js` (r187, `three@0.187.0`) e os addons em
   `1.0/libs/three-addons/` (OrbitControls, GLTFLoader, pós-processamento do brilho). Importe por caminho relativo
   ou pelo motor (`motor-pixel/1.0/motor.js`); nada de `cdn.jsdelivr.net`, `unpkg` ou `cdnjs`. Precisa de addon que não
   está lá? Copie para `three-addons/` do motor (minificado, `import 'three'` trocado por caminho relativo) e registre
   o peso no `manifesto.json`.
2. **Versão nova do Three.js = pasta nova do motor** (`1.1/`), nunca por cima da `1.0/`.
3. **WebGLRenderer por padrão.** O tablet Amazon Fire das crianças e celulares velhos não têm WebGPU. Use
   `WebGPURenderer`/TSL só com volta automática para WebGL e só quando o efeito precisar.
4. **Leve e calmo:** respeitar "reduzir movimento" e o modo leve do motor; `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`;
   parar o laço de desenho com a aba escondida (`document.hidden`); liberar geometrias, materiais e texturas
   (`dispose()`) ao sair da cena.
5. **Nada de nome de app dentro de `motor-pixel/1.0/`** (o que só um jogo usa fica no jogo) e nenhuma chave ou segredo.
6. Personagem 3D montado por partes segue o **teste de alinhamento obrigatório** da plataforma (nada solto, cortado,
   flutuando ou fora do eixo).

## Instruções oficiais do Three.js para IAs (resumo)

- **Import moderno (ES modules)**, nunca o `three.min.js` antigo com `<script src>`. Na SolverONE, o caminho é o local
  (regra 1), não o do CDN que o texto oficial mostra.
  ```js
  import * as THREE from '/motor-pixel/1.0/libs/three.module.js';   // mesmo endereço solverone.com.br
  ```
- **WebGLRenderer** é o maduro e compatível (a maioria dos exemplos); **WebGPURenderer**
  (`import * as THREE from 'three/webgpu'`, `await renderer.init()`) para TSL, compute shaders e materiais de nós.
- **TSL** (Three.js Shading Language) em vez de GLSL cru, quando usar WebGPURenderer; materiais de nós:
  `MeshBasicNodeMaterial`, `MeshStandardNodeMaterial`, `MeshPhysicalNodeMaterial`, `LineBasicNodeMaterial`,
  `SpriteNodeMaterial`.
- Peças essenciais: `Scene`, `PerspectiveCamera`/`OrthographicCamera`, `Mesh`, `InstancedMesh` (muitos objetos iguais),
  `Group`, `MeshStandardMaterial`/`MeshPhysicalMaterial`, `AmbientLight` + `DirectionalLight`, `GLTFLoader` (modelos
  `.glb`), `TextureLoader`, `OrbitControls`, `Vector3`, `Quaternion`, `Color`.

## Consultar a documentação completa

`referencia/llms-full.txt` (≈380 KB) tem a API inteira e a referência completa do TSL, com exemplos de código. Não leia
inteiro: procure o que precisa (`grep -n "NomeDaClasse" referencia/llms-full.txt`) e leia só o trecho.
`referencia/llms.txt` é o resumo oficial com os links do manual (threejs.org/manual).

Atualizar a referência: copiar de novo `docs/llms.txt` e `docs/llms-full.txt` do repositório oficial na mesma versão
do Three.js que o motor usa.

## Receita: motion 3D a partir de um vídeo de referência (dono, 24/Nov/2026)

Quando o dono anexar um vídeo de referência para uma animação 3D (abertura, vinheta, telão, personagem dançando):

1. **Estudar e medir em números**, não "no olho": extrair os quadros com `ffmpeg` (ex.: `ffmpeg -i ref.mp4 -vf fps=10 q/%04d.png`),
   olhar os quadros e anotar numa tabela a **estrutura** (momentos e duração de cada um), o **ritmo** (batidas por minuto,
   cortes por segundo), as **pausas**, os **picos** (quando acontece o "uau") e a **câmera** (posição, lente, movimento,
   velocidade). Mudança entre quadros (`ffmpeg ... -vf "select='gt(scene,0.3)'",showinfo`) ajuda a achar cortes e picos.
2. **Do vídeo fica só o método.** Nunca copiar marca, personagem, cenário, texto nem paleta de cores (regra de propriedade
   intelectual da SolverONE): os bichinhos, cores e cenários são nossos.
3. **Montar o motion em Three.js, em código**, seguindo a câmera e o ritmo medidos, com o tema do dono e as regras desta
   skill (Three.js do motor, WebGL, leve, "reduzir movimento").
4. **Antes de animar, mostrar uma imagem parada de cada momento** (print de cada etapa) e **esperar o ok do dono**.
5. **No fim, comparar**: medir o resultado do mesmo jeito do passo 1 (tempos, picos, câmera), mostrar as duas tabelas
   lado a lado e ajustar o que ficou diferente.

Modelo de pedido que o dono pode usar (veio de um treinamento): "Anexei um vídeo de referência. Use ele para modelar o meu
motion graphic 3D sobre [TEMA], em three.js, tudo em código", seguido dos 5 passos acima.

## Técnicas do "Motion 3D por referência" (Felipe Borges)

Fonte: github.com/Felpborges/motion-3d-por-referencia (material distribuído pelo autor para uso livre em vídeo público;
dono, 24/Nov/2026: "importar as técnicas que ele está ensinando"). Resumo com as nossas palavras e as regras daqui.

**Para jogo e para vídeo:**
- **Luz de lado, pouco ambiente.** Luz principal a 50°–60° da câmera e uma contraluz por trás. Quem decide o contraste é o
  ambiente: `environmentIntensity` 0,95 deixa chapado (≈1:1); 0,5–0,6 dá volume (2:1 a 2,5:1). Baixou o ambiente, suba a
  exposição. O objeto principal ("herói") sempre com lado claro e lado escuro.
- **Sombra:** `PCFShadowMap` (o `PCFSoftShadowMap` saiu no r187, a nossa versão) e câmera de sombra justa em volta da cena.
  A sombra tem que encostar no objeto.
- **Material de brinquedo bonito, não de massinha:** verniz (`clearcoat`), duas cores, microrrelevo em superfície grande;
  metal precisa de algo claro para refletir.
- **Bloco macio de brinquedo** (cantos arredondados, "superelipse") para pelúcias, peças e móveis fofos.
- **Lente da câmera:** quase sem convergência 17°–26°; natural 28°–42°; linhas fugindo 55°–70°. Nada alto entre a câmera e o
  herói; o lado de perto cresce com a perspectiva.
- **Cor "acesa":** a cor de um material se mede numa área iluminada e sem brilho; no olho sai mais escura e mais saturada.
- **Tom de cor:** "neutro" para cores de marca, produto e pastel (o Bolinho); "ACES" para noite, neon e fotorreal.
- **Shader:** todo `pow()` com `max(x, 0.0)`; brilho (bloom) com limiar acima de 1,0; torno (`LatheGeometry`) de baixo para cima.
- **Troca de estado** (solto → preso, parado → andando) é sempre uma mistura de 0,2–0,4 s, nunca um salto seco.
- **Ritmo:** "eleja um soco e acalme o resto": um momento forte (muita coisa mudando em pouco tempo), com pausa antes e
  depois e câmera parada durante a ação. Nunca "acelerar tudo".
- **Revisão de um minuto** (antes de animar e antes de entregar): tudo cabe na tela? algo tapa o herói? herói de frente ou
  três quartos? tem lado claro e escuro? sombra encosta? branco estourado ou preto afundado? cada peça se reconhece na
  miniatura? alguma atravessa outra? texto inteiro, com acento? algo some por ter a cor do fundo?
- **Os números servem ao olho:** nunca mudar uma cor do design só para um teste passar.

**Só para vídeo (MP4):**
- O quadro é **função pura do tempo** (`renderAt(t)`): sem relógio, sem somar entre quadros, sem `Math.random` (sorteio com
  semente). Todos os instantes numa tabela. Um render final só; antes, rascunhos pequenos e uma **folha de quadros** para
  olhar antes de gastar o render final.
- Cena com vários objetos: **cada objeto é uma peça** própria, feita e revisada sozinha (quatro vistas, com a luz do filme),
  enquanto a cena anda com "substitutos" do mesmo tamanho. Até cinco rodadas por peça.

**Ferramenta completa do autor (medir a referência, modelo de projeto, comparar no fim, Atlas com 18 motions):** não fica
copiada aqui; baixe na hora de fazer um vídeo:
```bash
git clone --depth 1 https://github.com/Felpborges/motion-3d-por-referencia /tmp/motion-3d && bash /tmp/motion-3d/instalar.sh
# precisa de node, python3 (numpy, pillow, scipy) e ffmpeg; depois: skill "motion-3d-por-referencia" e "/referencia" (Atlas)
```
Ela segue a "Receita" acima (medir, só o método, imagem parada antes, comparar). O vídeo pronto entra no app como arquivo
(ex.: `clipes/radio-dj.mp4` no kids), sem CDN.
