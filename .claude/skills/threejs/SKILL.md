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
