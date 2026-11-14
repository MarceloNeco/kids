/* Purpurina — catálogo: cores, partes da personagem, maquiagem, roupas, acessórios, cenários e desafios.
   Só dados (nada de tela), para dar para testar no Node e para trocar ou acrescentar peças sem mexer
   no resto. Peça nova = um item em "opcoes" (id, pt, en, es, tags) + o desenho dela em boneca.js.
   As "tags" dizem para que a peça combina (praia, princesa, inverno…) e são o que os desafios conferem. */
(function (raiz) {
  'use strict';

  function c(id, hex, pt, en, es, fam, brilho) { return { id: id, hex: hex, pt: pt, en: en, es: es, fam: fam || [], brilho: !!brilho }; }
  function o(id, pt, en, es, tags) { return { id: id, pt: pt, en: en, es: es, tags: tags || [] }; }
  var NENHUM = function (pt, en, es) { return o('nenhum', pt || 'Nenhum', en || 'None', es || 'Ninguno'); };

  // ---------- paletas ----------
  var CORES = {
    roupa: [
      c('chiclete', '#ff4fa3', 'Rosa chiclete', 'Bubblegum pink', 'Rosa chicle', ['rosa', 'vivo']),
      c('rosaclaro', '#ffb3d9', 'Rosa clarinho', 'Light pink', 'Rosa clarito', ['rosa', 'claro']),
      c('vermelho', '#e8384f', 'Vermelho', 'Red', 'Rojo', ['vermelho', 'vivo']),
      c('coral', '#ff8a6b', 'Coral', 'Coral', 'Coral', ['laranja', 'vivo']),
      c('amarelo', '#ffd23f', 'Amarelo', 'Yellow', 'Amarillo', ['amarelo', 'vivo', 'claro']),
      c('menta', '#86ecc8', 'Verde-menta', 'Mint', 'Verde menta', ['verde', 'claro', 'mar']),
      c('verde', '#3cc46a', 'Verde', 'Green', 'Verde', ['verde', 'vivo', 'mar']),
      c('ceu', '#8fd0ff', 'Azul-céu', 'Sky blue', 'Azul cielo', ['azul', 'claro', 'mar']),
      c('azul', '#3f6ee8', 'Azul', 'Blue', 'Azul', ['azul', 'vivo', 'mar']),
      c('lilas', '#cfa8ff', 'Lilás', 'Lilac', 'Lila', ['roxo', 'claro', 'mar']),
      c('roxo', '#8a3fd1', 'Roxo', 'Purple', 'Morado', ['roxo', 'vivo']),
      c('branco', '#fbf7ff', 'Branco', 'White', 'Blanco', ['branco', 'claro']),
      c('preto', '#2f2639', 'Preto', 'Black', 'Negro', ['preto', 'escuro']),
      c('dourado', '#f2c14e', 'Dourado', 'Gold', 'Dorado', ['brilho', 'amarelo'], true),
      c('prata', '#d3dae8', 'Prateado', 'Silver', 'Plateado', ['brilho', 'claro'], true),
      c('rose', '#e8a598', 'Rosé', 'Rose gold', 'Oro rosa', ['brilho', 'rosa'], true),
      c('nude', '#e8c4a8', 'Nude', 'Nude', 'Nude', ['claro']), c('marrom', '#8b5a3c', 'Marrom', 'Brown', 'Marrón', ['escuro']),
      c('vinho', '#8e1f45', 'Vinho', 'Burgundy', 'Granate', ['vermelho', 'escuro']), c('turquesa', '#22c3c3', 'Turquesa', 'Turquoise', 'Turquesa', ['azul', 'verde', 'mar', 'vivo']),
      c('laranja', '#ff9a2e', 'Laranja', 'Orange', 'Naranja', ['laranja', 'vivo'])
    ],
    pele: [
      c('p1', '#ffe5d6', 'Tom 1', 'Tone 1', 'Tono 1'), c('p2', '#fbd3b8', 'Tom 2', 'Tone 2', 'Tono 2'), c('p3', '#f1c19c', 'Tom 3', 'Tone 3', 'Tono 3'),
      c('p4', '#e0a87f', 'Tom 4', 'Tone 4', 'Tono 4'), c('p5', '#c98c63', 'Tom 5', 'Tone 5', 'Tono 5'), c('p6', '#a96e49', 'Tom 6', 'Tone 6', 'Tono 6'),
      c('p7', '#8a5336', 'Tom 7', 'Tone 7', 'Tono 7'), c('p8', '#653b22', 'Tom 8', 'Tone 8', 'Tono 8')
    ],
    cabelo: [
      c('preto', '#2a1d1b', 'Preto', 'Black', 'Negro'), c('escuro', '#4a2c20', 'Castanho-escuro', 'Dark brown', 'Castaño oscuro'),
      c('castanho', '#7b4a2b', 'Castanho', 'Brown', 'Castaño'), c('ruivo', '#c4572c', 'Ruivo', 'Red', 'Pelirrojo'),
      c('loiroEscuro', '#bf8f4f', 'Loiro escuro', 'Dark blonde', 'Rubio oscuro'), c('loiro', '#e3b85c', 'Loiro', 'Blonde', 'Rubio'), c('platinado', '#f4e3ab', 'Loiro clarinho', 'Light blonde', 'Rubio clarito'),
      c('rosa', '#ff8fc8', 'Rosa', 'Pink', 'Rosa', ['fantasia']), c('lilas', '#b892ff', 'Lilás', 'Lilac', 'Lila', ['fantasia']),
      c('azul', '#6fb8ff', 'Azul', 'Blue', 'Azul', ['fantasia']), c('menta', '#6fe0c0', 'Verde-água', 'Aqua', 'Verde agua', ['fantasia'])
    ],
    olhos: [
      c('castanho', '#6b3e26', 'Castanhos', 'Brown', 'Marrones'), c('preto', '#2a1c1a', 'Pretos', 'Black', 'Negros'), c('verde', '#3e9a5a', 'Verdes', 'Green', 'Verdes'),
      c('azul', '#3b7fd6', 'Azuis', 'Blue', 'Azules'), c('mel', '#b9822f', 'Cor de mel', 'Hazel', 'Color miel'), c('cinza', '#6f8a9c', 'Azul-acinzentados', 'Grey-blue', 'Gris azulado'), c('verdeClaro', '#7f9c78', 'Verde-acinzentados', 'Grey-green', 'Gris verdoso'), c('violeta', '#8a55d6', 'Violeta', 'Violet', 'Violeta')
    ],
    blush: [
      c('rosa', '#ff8fb1', 'Rosa', 'Pink', 'Rosa'), c('pessego', '#ffab8a', 'Pêssego', 'Peach', 'Melocotón'), c('coral', '#ff7f6b', 'Coral', 'Coral', 'Coral'),
      c('lilas', '#d59bff', 'Lilás', 'Lilac', 'Lila'), c('vermelho', '#ef5a6f', 'Vermelhinho', 'Rosy red', 'Rojito')
    ],
    sombra: [
      c('rosa', '#ff8fc8', 'Rosa', 'Pink', 'Rosa'), c('lilas', '#b892ff', 'Lilás', 'Lilac', 'Lila'), c('azul', '#6fb8ff', 'Azul', 'Blue', 'Azul'),
      c('verde', '#6fe0a0', 'Verde', 'Green', 'Verde'), c('dourado', '#f2c14e', 'Dourado', 'Gold', 'Dorado', [], true), c('marrom', '#a8724a', 'Marrom', 'Brown', 'Marrón'),
      c('roxo', '#8a3fd1', 'Roxo', 'Purple', 'Morado'), c('prata', '#d3dae8', 'Prateado', 'Silver', 'Plateado', [], true)
    ],
    delineado: [
      c('preto', '#1d1420', 'Preto', 'Black', 'Negro'), c('marrom', '#5a3420', 'Marrom', 'Brown', 'Marrón'), c('azul', '#2f5fd0', 'Azul', 'Blue', 'Azul'),
      c('roxo', '#7a2fc0', 'Roxo', 'Purple', 'Morado'), c('rosa', '#ff3f9a', 'Rosa', 'Pink', 'Rosa'), c('dourado', '#d9a227', 'Dourado', 'Gold', 'Dorado', [], true)
    ],
    cilios: [
      c('preto', '#1d1420', 'Pretos', 'Black', 'Negros'), c('marrom', '#5a3420', 'Marrons', 'Brown', 'Marrones'), c('roxo', '#7a2fc0', 'Roxos', 'Purple', 'Morados'),
      c('azul', '#2f5fd0', 'Azuis', 'Blue', 'Azules'), c('rosa', '#ff3f9a', 'Rosa', 'Pink', 'Rosa')
    ],
    batom: [
      c('rosaclaro', '#ff9ec4', 'Rosa clarinho', 'Light pink', 'Rosa clarito'), c('chiclete', '#ff4fa3', 'Rosa chiclete', 'Bubblegum', 'Rosa chicle'),
      c('vermelho', '#d92b45', 'Vermelho', 'Red', 'Rojo'), c('coral', '#ff6f61', 'Coral', 'Coral', 'Coral'), c('nude', '#d99a86', 'Natural', 'Nude', 'Natural'),
      c('cereja', '#a3123a', 'Cereja', 'Cherry', 'Cereza'), c('roxo', '#9b3fb5', 'Roxo', 'Purple', 'Morado'), c('lilas', '#c08bf0', 'Lilás', 'Lilac', 'Lila')
    ],
    glitter: [
      c('dourado', '#ffd76a', 'Dourado', 'Gold', 'Dorado', [], true), c('prata', '#eef2ff', 'Prateado', 'Silver', 'Plateado', [], true),
      c('rosa', '#ff7cc8', 'Rosa', 'Pink', 'Rosa', [], true), c('lilas', '#c9a3ff', 'Lilás', 'Lilac', 'Lila', [], true),
      c('arco', '#ff7cc8', 'Arco-íris', 'Rainbow', 'Arcoíris', [], true)
    ]
  };

  // ---------- grupos (abas) ----------
  var GRUPOS = [
    { id: 'eu', ico: '👧', pt: 'Eu', en: 'Me', es: 'Yo' },
    { id: 'make', ico: '💄', pt: 'Maquiagem', en: 'Makeup', es: 'Maquillaje', curto: { pt: 'Make', en: 'Makeup', es: 'Maquillaje' } },
    { id: 'roupa', ico: '👗', pt: 'Roupas', en: 'Clothes', es: 'Ropa' },
    { id: 'joias', ico: '💎', pt: 'Joias', en: 'Jewelry', es: 'Joyas' },
    { id: 'acess', ico: '👑', pt: 'Acessórios', en: 'Accessories', es: 'Accesorios', curto: { pt: 'Enfeites', en: 'Extras', es: 'Adornos' } },
    { id: 'fundo', ico: '🏞️', pt: 'Cenário', en: 'Scene', es: 'Escenario' }
  ];

  /* Cada categoria: id, grupo, ícone, nome, opcoes (estilos) e/ou cores (nome da paleta).
     "area" é o pedaço do desenho que aparece na miniatura do botão (x, y, largura, altura).
     "nenhum" na primeira opção quer dizer que dá para tirar. */
  var A = { rosto: [86, 96, 228, 228], olhos: [116, 168, 168, 100], boca: [146, 224, 108, 84], cabeca: [46, 16, 308, 360],
    corpo: [70, 300, 260, 300], cintura: [70, 400, 260, 260], pes: [110, 560, 180, 120], tudo: [0, 40, 400, 660], pescoco: [90, 220, 220, 180],
    mao: [80, 456, 84, 76], anel: [80, 470, 70, 62], peito: [140, 340, 120, 100], cabeloTodo: [20, 10, 360, 640] };
  /* zoom do palco por parte (ver app.js): rosto, busto, mãos ou cabeça */
  var ZOOM = { pes: [96, 520, 208, 170], unhas: [76, 462, 92, 80], rosto: [72, 70, 256, 260], busto: [56, 120, 288, 300], maos: [56, 428, 150, 130], cabeca: [30, 20, 340, 430] };
  var CATEGORIAS = [
    { id: 'pele', grupo: 'eu', ico: '🎨', pt: 'Pele', en: 'Skin', es: 'Piel', cores: 'pele', area: A.rosto, zoom: 'rosto' },
    { id: 'personagem', grupo: 'eu', ico: '👧', pt: 'Menina ou menino', en: 'Girl or boy', es: 'Niña o niño', area: A.cabeca, zoom: 'cabeca', opcoes: [
      o('menina', 'Menina', 'Girl', 'Niña'), o('menino', 'Menino', 'Boy', 'Niño')
    ] },
    { id: 'rosto', grupo: 'eu', ico: '🙂', pt: 'Rosto', en: 'Face shape', es: 'Cara', area: A.rosto, zoom: 'rosto', opcoes: [
      o('oval', 'Oval', 'Oval', 'Ovalada'), o('redondo', 'Redondinho', 'Round', 'Redondita'), o('coracao', 'Coração', 'Heart', 'Corazón'), o('fininho', 'Fininho', 'Slim', 'Delgadita'),
      o('bochechudo', 'Bochechudo', 'Chubby cheeks', 'Mofletuda'), o('largo', 'Largo', 'Wide', 'Ancha'), o('quadradinho', 'Quadradinho', 'Square', 'Cuadradita'),
      o('comprido', 'Comprido', 'Long', 'Alargada')
    ] },
    { id: 'nariz', grupo: 'eu', ico: '👃', pt: 'Nariz', en: 'Nose', es: 'Nariz', area: A.rosto, zoom: 'rosto', opcoes: [
      o('botao', 'Botãozinho', 'Button', 'Botoncito'), o('arrebitado', 'Arrebitado', 'Upturned', 'Respingona'), o('fininho', 'Fininho', 'Slim', 'Delgadita'),
      o('redondinho', 'Redondinho', 'Round tip', 'Redondita'), o('pequenino', 'Pequenininho', 'Tiny', 'Chiquitita'), o('batatinha', 'Batatinha', 'Button bulb', 'De patata'),
      o('largo', 'Largo', 'Wide', 'Ancha'), o('reto', 'Reto', 'Straight', 'Recta')
    ] },
    { id: 'testa', grupo: 'eu', ico: '🙆', pt: 'Testa', en: 'Forehead', es: 'Frente', area: A.cabeca, zoom: 'cabeca', opcoes: [
      o('baixa', 'Baixinha', 'Low', 'Bajita'), o('normal', 'No meio', 'Middle', 'En el medio'), o('alta', 'Alta', 'High', 'Alta'), o('bemAlta', 'Testona', 'Very high', 'Muy alta')
    ] },
    { id: 'formaOlho', grupo: 'eu', ico: '👁️', pt: 'Formato dos olhos', en: 'Eye shape', es: 'Forma de los ojos', area: A.olhos, zoom: 'rosto', opcoes: [
      o('redondos', 'Redondinhos', 'Round', 'Redonditos'), o('amendoados', 'Amendoados', 'Almond', 'Almendrados'), o('grandes', 'Grandões', 'Big', 'Grandotes'),
      o('pequenos', 'Pequenos', 'Small', 'Pequeños'), o('puxadinhos', 'Puxadinhos', 'Upturned', 'Rasgados hacia arriba'), o('caidos', 'Caidinhos', 'Downturned', 'Caídos'),
      o('fininhos', 'Fininhos (sem dobrinha)', 'Narrow monolid', 'Rasgados (sin pliegue)'), o('fininhosPuxados', 'Fininhos puxadinhos', 'Narrow upturned monolid', 'Rasgados hacia arriba (sin pliegue)'), o('sorridentes', 'Fechadinhos sorrindo', 'Smiling crescent', 'Cerraditos sonriendo')
    ] },
    { id: 'distOlhos', grupo: 'eu', ico: '↔️', pt: 'Olhos perto ou longe', en: 'Eye spacing', es: 'Ojos juntos o separados', area: A.olhos, zoom: 'rosto', opcoes: [
      o('juntos', 'Mais juntinhos', 'Closer together', 'Más juntitos'), o('normal', 'No meio', 'Middle', 'En el medio'), o('afastados', 'Mais afastados', 'Farther apart', 'Más separados')
    ] },
    { id: 'formaBoca', grupo: 'eu', ico: '👄', pt: 'Boca', en: 'Mouth', es: 'Boca', area: A.boca, zoom: 'rosto', opcoes: [
      o('coracao', 'Coraçãozinho', 'Little heart', 'Corazoncito'), o('fininha', 'Fininha', 'Thin', 'Delgadita'), o('cheinha', 'Cheinha', 'Full', 'Carnosa'),
      o('larga', 'Larga', 'Wide', 'Ancha'), o('pequenininha', 'Pequenininha', 'Tiny', 'Chiquitita'), o('sorrisinho', 'Sorrisinho', 'Little smile', 'Sonrisita')
    ] },
    { id: 'cabelo', grupo: 'eu', ico: '💇', pt: 'Cabelo', en: 'Hair', es: 'Pelo', cores: 'cabelo', area: A.cabeca, zoom: 'cabeca', opcoes: [
      o('longo', 'Longo e liso', 'Long and straight', 'Largo y liso'), o('ondulado', 'Ondulado', 'Wavy', 'Ondulado'), o('cacheado', 'Cacheado', 'Curly', 'Rizado'),
      o('rabo', 'Rabo de cavalo', 'Ponytail', 'Coleta', ['esporte']), o('chiquinhas', 'Maria-chiquinha', 'Pigtails', 'Coletas'), o('coque', 'Coque', 'Bun', 'Moño', ['bailarina', 'princesa']),
      o('chanel', 'Chanel', 'Bob', 'Melena corta'), o('trancas', 'Duas tranças', 'Two braids', 'Dos trenzas'),
      o('franja', 'Liso com franja', 'Straight with bangs', 'Liso con flequillo'), o('afro', 'Black power', 'Afro', 'Afro', ['pop']), o('puffs', 'Dois puffs', 'Two puffs', 'Dos puffs', ['pop']),
      o('lateral', 'Rabo de lado', 'Side ponytail', 'Coleta de lado'), o('trancaLado', 'Trança de lado', 'Side braid', 'Trenza de lado', ['princesa', 'jardim']),
      o('meio', 'Meio preso', 'Half-up', 'Medio recogido'), o('pixie', 'Joãozinho', 'Pixie cut', 'Pixie'), o('sereia', 'Longo de sereia', 'Mermaid hair', 'Largo de sirena', ['sereia', 'princesa']),
      o('coqueDuplo', 'Dois coquinhos', 'Space buns', 'Dos moñitos', ['pop']), o('box', 'Tranças box', 'Box braids', 'Trenzas box', ['pop']),
      o('cortina', 'Franja cortina', 'Curtain bangs', 'Flequillo cortina'), o('lob', 'Ondas no ombro', 'Shoulder waves', 'Ondas al hombro'), o('rabinhoAlto', 'Rabo alto', 'High ponytail', 'Coleta alta', ['esporte', 'pop']),
      o('coroaTranca', 'Trança coroa', 'Crown braid', 'Trenza corona', ['princesa', 'jardim']), o('coqueBaguncado', 'Coque bagunçado', 'Messy bun', 'Moño despeinado', ['casual']),
      o('cachosCurtos', 'Cachinhos curtos', 'Short curls', 'Rizos cortos'), o('ondasLongas', 'Ondas longas', 'Long waves', 'Ondas largas', ['praia', 'princesa']),
      o('franjinha', 'Franjinha', 'Baby bangs', 'Flequillito'), o('chiquinhasBaixas', 'Chiquinhas baixas', 'Low pigtails', 'Coletas bajas', ['jardim']),
      o('dreads', 'Dreads', 'Locs', 'Rastas', ['pop']), o('ondasLado', 'Ondas de lado', 'Side-swept waves', 'Ondas de lado', ['festa', 'princesa']),
      o('cacheadoLongo', 'Cachos longos', 'Long ringlets', 'Rizos largos', ['princesa']),
      o('lisoPontas', 'Liso de pontas redondinhas', 'Straight with curled-in ends', 'Liso con puntas hacia dentro', ['princesa', 'festa']), o('lisoRepartido', 'Liso repartido no meio', 'Sleek middle part', 'Liso con raya en medio', ['festa', 'pop']),
      o('chanelPontas', 'Chanel de pontas para dentro', 'Rounded bob', 'Melena con puntas hacia dentro', ['escola', 'festa']), o('pontasFora', 'Pontas para fora', 'Flipped ends', 'Puntas hacia fuera', ['pop', 'festa']),
      o('cachinhos', 'Cachinhos de molinha', 'Spiral curls', 'Rizos en espiral', ['princesa', 'festa']), o('encaracolado', 'Encaracolado volumoso', 'Big curly hair', 'Rizado con mucho volumen', ['pop', 'praia']),
      o('rabinhoCachos', 'Rabo de cachos', 'Curly ponytail', 'Coleta de rizos', ['festa', 'pop']),
      o('curtinho', 'Curtinho', 'Short cut', 'Cortito', ['escola', 'esporte']), o('topete', 'Topete', 'Quiff', 'Tupé', ['pop', 'escola']),
o('cachosSoltos', 'Cacheado solto (risca no meio)', 'Loose curls (middle part)', 'Rizos sueltos (raya en medio)', ['casual', 'praia', 'festa']),       o('armado', 'Ondulado armadinho', 'Big wavy hair', 'Ondulado con volumen', ['casual', 'praia']), o('armadoLongo', 'Ondulado armado longo', 'Long big waves', 'Ondulado largo con volumen', ['praia', 'festa'])
    ] },
    { id: 'mechas', grupo: 'eu', ico: '🌈', pt: 'Mechas', en: 'Highlights', es: 'Mechones', cores: 'cabelo', area: A.cabeloTodo, zoom: 'cabeca', opcoes: [
      NENHUM('Sem mechas', 'No highlights', 'Sin mechones'), o('pontas', 'Pontas coloridas', 'Colored tips', 'Puntas de colores', ['pop']), o('frente', 'Mechas na frente', 'Front streaks', 'Mechones al frente', ['pop']),
      o('arco', 'Arco-íris', 'Rainbow', 'Arcoíris', ['pop', 'festa'])
    ] },
    { id: 'olhos', grupo: 'eu', ico: '👀', pt: 'Olhos', en: 'Eyes', es: 'Ojos', cores: 'olhos', area: A.olhos, zoom: 'rosto' },

    { id: 'base', grupo: 'make', ico: '🧴', pt: 'Base', en: 'Foundation', es: 'Base', area: A.rosto, zoom: 'rosto', opcoes: [
      NENHUM('Sem base', 'No foundation', 'Sin base'), o('natural', 'Natural', 'Natural', 'Natural'), o('iluminada', 'Iluminada', 'Glowy', 'Iluminada', ['brilho', 'festa']),
      o('bronze', 'Bronzeada', 'Sun-kissed', 'Bronceada', ['praia', 'verao']), o('sardas', 'Sardinhas', 'Freckles', 'Pecas', ['jardim'])
    ] },
    { id: 'blush', grupo: 'make', ico: '🌸', pt: 'Blush', en: 'Blush', es: 'Colorete', cores: 'blush', area: A.rosto, zoom: 'rosto', opcoes: [
      NENHUM('Sem blush', 'No blush', 'Sin colorete'), o('redondo', 'Bochecha redonda', 'Round cheeks', 'Mofletes redondos'), o('coracao', 'Coraçõezinhos', 'Little hearts', 'Corazoncitos', ['festa']),
      o('diagonal', 'Fininho', 'Swept', 'Delgadito')
    ] },
    { id: 'sombra', grupo: 'make', ico: '🎨', pt: 'Sombra', en: 'Eyeshadow', es: 'Sombra', cores: 'sombra', area: A.olhos, zoom: 'rosto', opcoes: [
      NENHUM('Sem sombra', 'No eyeshadow', 'Sin sombra'), o('simples', 'Simples', 'Simple', 'Sencilla'), o('esfumada', 'Esfumada', 'Smoky', 'Ahumada'),
      o('arco', 'Arco-íris', 'Rainbow', 'Arcoíris', ['pop', 'festa']), o('brilhante', 'Com brilho', 'Shimmer', 'Con brillo', ['brilho', 'festa', 'princesa'])
    ] },
    { id: 'delineado', grupo: 'make', ico: '✏️', pt: 'Delineado', en: 'Eyeliner', es: 'Delineador', cores: 'delineado', area: A.olhos, zoom: 'rosto', opcoes: [
      NENHUM('Sem delineado', 'No eyeliner', 'Sin delineador'), o('fino', 'Fininho', 'Thin', 'Finito'), o('gatinho', 'Gatinho', 'Cat eye', 'Ojo de gato', ['pop']), o('grosso', 'Marcado', 'Bold', 'Marcado', ['pop'])
    ] },
    { id: 'cilios', grupo: 'make', ico: '👁️', pt: 'Cílios', en: 'Lashes', es: 'Pestañas', cores: 'cilios', area: A.olhos, zoom: 'rosto', opcoes: [
      NENHUM('Sem cílios postiços', 'No false lashes', 'Sin pestañas postizas'), o('curtos', 'Naturais', 'Natural', 'Naturales'), o('longos', 'Longos', 'Long', 'Largas', ['festa']), o('boneca', 'De boneca', 'Doll lashes', 'De muñeca', ['princesa', 'pop']),
      o('gatinho', 'Gatinho', 'Cat-eye lashes', 'De gatita', ['pop']), o('volume', 'Volume', 'Volume', 'Volumen', ['festa', 'pop']), o('baixo', 'Em cima e embaixo', 'Top and bottom', 'Arriba y abajo'),
      o('arco', 'Arco-íris', 'Rainbow lashes', 'Arcoíris', ['pop', 'festa']), o('strass', 'Com strass', 'With rhinestones', 'Con brillantes', ['brilho', 'festa', 'princesa']),
      o('fadinha', 'De fadinha', 'Fairy lashes', 'De hada', ['fada', 'princesa']), o('dramaticos', 'Bem longos', 'Dramatic lashes', 'Superlargas', ['festa', 'pop']),
      o('coracao', 'Com coraçãozinho', 'With little hearts', 'Con corazoncitos', ['festa', 'aniversario'])
    ] },
    { id: 'unhas', grupo: 'make', ico: '💅', pt: 'Unhas', en: 'Nails', es: 'Uñas', cores: 'roupa', area: [86, 478, 66, 56], zoom: 'unhas', opcoes: [
      NENHUM('Sem esmalte', 'No polish', 'Sin esmalte'), o('liso', 'Esmalte liso', 'Plain polish', 'Esmalte liso'), o('francesinha', 'Francesinha', 'French tips', 'Francesa', ['festa', 'princesa']),
      o('glitter', 'Com glitter', 'Glitter', 'Con purpurina', ['brilho', 'festa']), o('bolinhas', 'Bolinhas', 'Polka dots', 'Lunares', ['pop']), o('arco', 'Arco-íris', 'Rainbow', 'Arcoíris', ['pop', 'festa']),
      o('degrade', 'Degradê', 'Ombré', 'Degradado'), o('coracao', 'Coraçãozinho', 'Little hearts', 'Corazoncitos', ['festa', 'aniversario'])
    ] },
    { id: 'batom', grupo: 'make', ico: '💋', pt: 'Batom', en: 'Lipstick', es: 'Pintalabios', cores: 'batom', area: A.boca, zoom: 'rosto', opcoes: [
      NENHUM('Sem batom', 'No lipstick', 'Sin pintalabios'), o('cremoso', 'Cremoso', 'Creamy', 'Cremoso'), o('gloss', 'Gloss', 'Gloss', 'Gloss', ['festa']),
      o('brilho', 'Com glitter', 'Glitter', 'Con purpurina', ['brilho', 'pop']), o('degrade', 'Degradê', 'Ombré', 'Degradado')
    ] },
    { id: 'glitter', grupo: 'make', ico: '✨', pt: 'Glitter', en: 'Glitter', es: 'Purpurina', cores: 'glitter', area: A.tudo, zoom: 'rosto', opcoes: [
      NENHUM('Sem glitter', 'No glitter', 'Sin purpurina'), o('bochechas', 'Nas bochechas', 'On the cheeks', 'En las mejillas', ['brilho']), o('olhos', 'Perto dos olhos', 'Around the eyes', 'Cerca de los ojos', ['brilho']),
      o('cabelo', 'No cabelo', 'In the hair', 'En el pelo', ['brilho']), o('tudo', 'Chuva de glitter!', 'Glitter shower!', '¡Lluvia de purpurina!', ['brilho', 'festa'])
    ] },
    { id: 'adesivo', grupo: 'make', ico: '💟', pt: 'Adesivos', en: 'Stickers', es: 'Pegatinas', area: A.rosto, zoom: 'rosto', opcoes: [
      NENHUM('Sem adesivo', 'No sticker', 'Sin pegatina'), o('coracao', 'Coração', 'Heart', 'Corazón', ['festa']), o('estrela', 'Estrela', 'Star', 'Estrella', ['pop', 'pijama']),
      o('lua', 'Lua', 'Moon', 'Luna', ['pijama']), o('borboleta', 'Borboleta', 'Butterfly', 'Mariposa', ['jardim']), o('arco', 'Arco-íris', 'Rainbow', 'Arcoíris', ['festa']),
      o('flor', 'Flor', 'Flower', 'Flor', ['jardim']), o('floco', 'Floco de neve', 'Snowflake', 'Copo de nieve', ['inverno']), o('concha', 'Concha', 'Shell', 'Concha', ['praia', 'sereia'])
    ] },

    { id: 'vestido', grupo: 'roupa', ico: '👗', pt: 'Vestidos', en: 'Dresses', es: 'Vestidos', cores: 'roupa', area: A.tudo, opcoes: [
      NENHUM('Sem vestido', 'No dress', 'Sin vestido'), o('princesa', 'De princesa', 'Princess gown', 'De princesa', ['princesa', 'festa', 'longo']),
      o('rodado', 'Curto rodado', 'Short twirl dress', 'Corto con vuelo', ['festa', 'aniversario', 'pop']), o('sereia', 'Sereia', 'Mermaid', 'Sirena', ['sereia', 'festa', 'princesa']),
      o('verao', 'De alcinha', 'Sundress', 'De tirantes', ['praia', 'verao', 'jardim']), o('festa', 'De festa com laço', 'Party dress with bow', 'De fiesta con lazo', ['festa', 'aniversario']),
      o('camisola', 'Camisola', 'Nightgown', 'Camisón', ['pijama']), o('gala', 'Longo de gala', 'Evening gown', 'Largo de gala', ['festa', 'princesa', 'longo']),
      o('jardineira', 'Jardineira', 'Pinafore', 'Pichi', ['jardim', 'casual', 'escola']), o('macacao', 'Macacão', 'Jumpsuit', 'Mono', ['pop', 'festa']),
      o('tomara', 'Tomara que caia balonê', 'Strapless bubble dress', 'Palabra de honor globo', ['festa', 'aniversario', 'pop']), o('casaco', 'Casaco longo', 'Long coat', 'Abrigo largo', ['inverno']),
      o('fada', 'De fada (com asas)', 'Fairy dress (with wings)', 'De hada (con alas)', ['princesa', 'festa', 'jardim'])
    ] },
    { id: 'blusa', grupo: 'roupa', ico: '👚', pt: 'Blusas', en: 'Tops', es: 'Blusas', cores: 'roupa', area: A.corpo, opcoes: [
      NENHUM('Só o top básico', 'Basic top only', 'Solo el top básico'), o('camiseta', 'Camiseta', 'T-shirt', 'Camiseta', ['casual', 'jardim']), o('regata', 'Regata', 'Tank top', 'Camiseta sin mangas', ['praia', 'verao', 'pop']),
      o('babados', 'Com babados', 'Ruffle top', 'Con volantes', ['jardim', 'festa', 'princesa']), o('sueter', 'Suéter quentinho', 'Cozy sweater', 'Jersey calentito', ['inverno']),
      o('jaqueta', 'Jaqueta', 'Jacket', 'Chaqueta', ['pop', 'inverno']), o('pijama', 'Blusa de pijama', 'Pajama top', 'Blusa de pijama', ['pijama']),
      o('moletom', 'Moletom com capuz', 'Hoodie', 'Sudadera con capucha', ['inverno', 'casual', 'esporte']), o('camisa', 'Camisa', 'Button shirt', 'Camisa', ['escola', 'casual']),
      o('ombro', 'Ombro a ombro', 'Off-shoulder', 'Hombros descubiertos', ['praia', 'verao', 'festa']), o('laco', 'Blusa de laço', 'Bow blouse', 'Blusa con lazo', ['festa', 'princesa', 'aniversario']),
      o('colete', 'Colete', 'Vest', 'Chaleco', ['pop', 'casual'])
    ] },
    { id: 'saia', grupo: 'roupa', ico: '🩰', pt: 'Saias', en: 'Skirts', es: 'Faldas', cores: 'roupa', area: A.cintura, opcoes: [
      NENHUM('Sem saia', 'No skirt', 'Sin falda'), o('curta', 'Curtinha', 'Mini skirt', 'Cortita', ['pop', 'festa', 'casual']),
      o('tutu', 'Tutu de bailarina', 'Ballet tutu', 'Tutú de bailarina', ['bailarina', 'festa', 'princesa', 'pop', 'aniversario']),
      o('longa', 'Longa', 'Long skirt', 'Larga', ['jardim', 'princesa']), o('pregas', 'De pregas', 'Pleated', 'Plisada', ['casual', 'escola']),
      o('balone', 'Balonê', 'Bubble skirt', 'Globo', ['festa', 'pop']), o('camadas', 'Em camadas', 'Tiered', 'Con capas', ['jardim', 'festa']),
      o('jeans', 'Saia jeans', 'Denim skirt', 'Falda vaquera', ['casual', 'pop', 'verao'])
    ] },
    { id: 'calca', grupo: 'roupa', ico: '👖', pt: 'Calças e shorts', en: 'Pants and shorts', es: 'Pantalones y shorts', cores: 'roupa', area: A.cintura, opcoes: [
      NENHUM('Sem calça', 'No pants', 'Sin pantalón'), o('jeans', 'Calça justa', 'Skinny pants', 'Pantalón ajustado', ['casual', 'pop']), o('shorts', 'Shorts', 'Shorts', 'Shorts', ['praia', 'verao']),
      o('legging', 'Legging', 'Leggings', 'Mallas', ['esporte', 'inverno', 'pop']), o('pantalona', 'Pantalona', 'Flared pants', 'Pantalón acampanado', ['festa', 'pop']),
      o('pijama', 'Calça de pijama', 'Pajama pants', 'Pantalón de pijama', ['pijama']), o('bermuda', 'Bermuda', 'Bermuda shorts', 'Bermudas', ['verao', 'casual']),
      o('jogger', 'Jogger', 'Joggers', 'Jogger', ['esporte', 'casual', 'inverno']), o('rasgada', 'Calça rasgadinha', 'Ripped jeans', 'Vaqueros rotos', ['pop', 'casual'])
    ] },
    { id: 'estampa', grupo: 'roupa', ico: '🎀', pt: 'Estampa', en: 'Pattern', es: 'Estampado', cores: 'roupa', area: A.corpo, opcoes: [
      o('liso', 'Sem estampa', 'No pattern', 'Sin estampado'), o('bolinhas', 'Bolinhas', 'Polka dots', 'Lunares', ['festa', 'pop']), o('listras', 'Listras', 'Stripes', 'Rayas', ['praia', 'casual']),
      o('estrelas', 'Estrelinhas', 'Little stars', 'Estrellitas', ['pop', 'pijama']), o('coracoes', 'Coraçõezinhos', 'Little hearts', 'Corazoncitos', ['festa', 'pijama']),
      o('flores', 'Florzinhas', 'Little flowers', 'Florecitas', ['jardim', 'praia']), o('xadrez', 'Xadrez', 'Plaid', 'Cuadros', ['piquenique', 'escola', 'inverno']),
      o('arcoiris', 'Arco-íris', 'Rainbow stripes', 'Rayas arcoíris', ['pop', 'festa']), o('oncinha', 'Oncinha', 'Leopard', 'Leopardo', ['pop'])
    ] },
    { id: 'sapatos', grupo: 'roupa', ico: '👟', pt: 'Sapatos', en: 'Shoes', es: 'Zapatos', cores: 'roupa', area: [110, 500, 180, 190], zoom: 'pes', opcoes: [
      NENHUM('Descalça', 'Barefoot', 'Descalza'), o('tenis', 'Tênis', 'Sneakers', 'Zapatillas', ['casual', 'pop', 'esporte']), o('sapatilha', 'Sapatilha', 'Ballet flats', 'Bailarinas', ['bailarina', 'princesa', 'festa', 'jardim']),
      o('sandalia', 'Sandália', 'Sandals', 'Sandalias', ['praia', 'verao', 'jardim']), o('bota', 'Bota', 'Boots', 'Botas', ['inverno', 'pop']),
      o('salto', 'Sapato de cristal', 'Glass slippers', 'Zapatitos de cristal', ['princesa', 'festa']), o('pantufa', 'Pantufa', 'Slippers', 'Pantuflas', ['pijama']),
      o('boneca', 'Sapato de boneca', 'Mary Janes', 'Zapatos de muñeca', ['festa', 'escola', 'princesa']), o('patins', 'Patins', 'Roller skates', 'Patines', ['pop', 'esporte']),
      o('chinelo', 'Chinelo', 'Flip-flops', 'Chanclas', ['praia', 'verao']), o('galocha', 'Galocha', 'Rain boots', 'Botas de agua', ['inverno', 'jardim']),
      o('princesa', 'Sapato de princesa', 'Princess shoes', 'Zapatos de princesa', ['princesa', 'festa']), o('scarpin', 'Salto alto', 'High heels', 'Tacón alto', ['festa', 'princesa']),
      o('saltoMedio', 'Salto médio', 'Mid heels', 'Tacón medio', ['festa']), o('saltoBaixo', 'Salto baixinho', 'Kitten heels', 'Tacón bajito', ['festa', 'escola']),
      o('plataforma', 'Sandália plataforma', 'Platform sandals', 'Sandalias de plataforma', ['pop', 'verao']), o('anabela', 'Anabela', 'Wedges', 'Cuñas', ['verao', 'festa', 'praia']),
      o('rasteirinha', 'Rasteirinha', 'Strappy flats', 'Sandalias planas', ['praia', 'verao', 'jardim']), o('chineloFlor', 'Chinelo com flor', 'Flower flip-flops', 'Chanclas con flor', ['praia', 'verao']),
      o('clog', 'Tamanco de furinhos', 'Holey clogs', 'Zuecos con agujeritos', ['casual', 'praia', 'pop']), o('mocassim', 'Mocassim', 'Loafers', 'Mocasines', ['escola', 'casual']),
      o('social', 'Sapato social', 'Oxfords', 'Zapatos de vestir', ['escola', 'festa']), o('tenisAlto', 'Tênis cano alto', 'High-top sneakers', 'Zapatillas altas', ['pop', 'esporte']),
      o('tenisLuz', 'Tênis de luzinha', 'Light-up sneakers', 'Zapatillas con luces', ['pop', 'festa']), o('tenisGlitter', 'Tênis de glitter', 'Glitter sneakers', 'Zapatillas con purpurina', ['pop', 'brilho']),
      o('botaCano', 'Bota de cano alto', 'Knee-high boots', 'Botas altas', ['inverno', 'pop']), o('botaNeve', 'Bota de neve', 'Snow boots', 'Botas de nieve', ['inverno']),
      o('ponta', 'Sapatilha de ponta', 'Pointe shoes', 'Zapatillas de punta', ['bailarina', 'princesa'])
    ] },

    { id: 'cabeca', grupo: 'acess', ico: '👑', pt: 'Coroas e chapéus', en: 'Crowns and hats', es: 'Coronas y sombreros', cores: 'roupa', area: A.cabeca, zoom: 'cabeca', opcoes: [
      NENHUM('Nada na cabeça', 'Nothing', 'Nada en la cabeza'), o('tiara', 'Tiara', 'Tiara', 'Tiara', ['princesa', 'festa']), o('coroa', 'Coroa', 'Crown', 'Corona', ['princesa']),
      o('flores', 'Coroa de flores', 'Flower crown', 'Corona de flores', ['jardim', 'praia']), o('chapeu', 'Chapéu de praia', 'Sun hat', 'Sombrero de playa', ['praia', 'verao']),
      o('gorro', 'Gorro', 'Beanie', 'Gorro', ['inverno']), o('orelhas', 'Orelhinhas de gato', 'Cat ears', 'Orejitas de gato', ['pijama', 'pop']),
      o('diadema', 'Diadema de joias', 'Jeweled headband', 'Diadema de joyas', ['princesa', 'festa', 'joia']),
      o('faixa', 'Faixa com nó', 'Knotted headband', 'Diadema con nudo', ['escola', 'casual', 'pop']), o('unicornio', 'Tiara de unicórnio', 'Unicorn headband', 'Diadema de unicornio', ['pop', 'fada', 'aniversario']),
      o('estrelas', 'Tiara de estrelinhas', 'Star headband', 'Diadema de estrellitas', ['pop', 'pijama', 'festa'])
    ] },
    { id: 'laco', grupo: 'acess', ico: '🎀', pt: 'Laços', en: 'Bows', es: 'Lazos', cores: 'roupa', area: A.cabeca, zoom: 'cabeca', opcoes: [
      NENHUM('Sem laço', 'No bow', 'Sin lazo'), o('alto', 'Laço no alto', 'Top bow', 'Lazo arriba', ['festa', 'aniversario']), o('lado', 'Laço do lado', 'Side bow', 'Lazo de lado', ['festa', 'aniversario']),
      o('dois', 'Dois lacinhos', 'Two little bows', 'Dos lacitos', ['aniversario', 'pop']), o('estrela', 'Presilha de estrela', 'Star clip', 'Horquilla de estrella', ['pop']),
      o('presilhas', 'Presilhas coloridas', 'Colorful clips', 'Horquillas de colores', ['pop', 'escola']), o('perolas', 'Presilhas de pérola', 'Pearl clips', 'Horquillas de perla', ['princesa', 'festa', 'joia']),
      o('borboletas', 'Presilhas de borboleta', 'Butterfly clips', 'Horquillas de mariposa', ['jardim', 'pop']), o('florGrande', 'Flor no cabelo', 'Big hair flower', 'Flor en el pelo', ['praia', 'jardim', 'verao']),
      o('lacao', 'Laço gigante', 'Giant bow', 'Lazo gigante', ['festa', 'aniversario', 'princesa'])
    ] },
    { id: 'brincos', grupo: 'joias', ico: '💎', pt: 'Brincos', en: 'Earrings', es: 'Pendientes', cores: 'roupa', area: A.rosto, zoom: 'rosto', opcoes: [
      NENHUM('Sem brinco', 'No earrings', 'Sin pendientes'), o('bolinha', 'Bolinha', 'Studs', 'Bolitas'), o('argola', 'Argola', 'Hoops', 'Aros', ['pop']),
      o('estrela', 'Estrela', 'Stars', 'Estrellas', ['pop']), o('coracao', 'Coração', 'Hearts', 'Corazones', ['festa', 'aniversario']), o('gota', 'Gota brilhante', 'Sparkly drops', 'Gotas brillantes', ['princesa', 'festa', 'joia']),
      o('perola', 'Pérola', 'Pearl', 'Perla', ['princesa', 'festa', 'joia']), o('diamante', 'Diamante', 'Diamond', 'Diamante', ['princesa', 'festa', 'joia', 'brilho']),
      o('lua', 'Lua', 'Moon', 'Luna', ['pijama']), o('borboleta', 'Borboleta', 'Butterfly', 'Mariposa', ['jardim']), o('flor', 'Florzinha', 'Little flower', 'Florecita', ['jardim', 'praia']),
      o('pingente', 'Pingente longo', 'Chandelier', 'Colgantes largos', ['festa', 'princesa', 'joia']), o('cereja', 'Cereja', 'Cherries', 'Cerezas', ['pop', 'verao']),
      o('cascata', 'Cascata de cristais', 'Crystal cascade', 'Cascada de cristales', ['princesa', 'festa', 'joia', 'brilho']), o('argolaPerola', 'Argola com pérola', 'Pearl hoops', 'Aros con perla', ['joia', 'festa']),
      o('lacinho', 'Lacinho', 'Little bows', 'Lacitos', ['aniversario', 'festa']), o('franja', 'Franjinha de fios', 'Tassels', 'Borlas', ['pop', 'praia']),
      o('morango', 'Morango', 'Strawberries', 'Fresas', ['pop', 'verao'])
    ] },
    { id: 'colar', grupo: 'joias', ico: '📿', pt: 'Colares', en: 'Necklaces', es: 'Collares', cores: 'roupa', area: A.pescoco, zoom: 'busto', opcoes: [
      NENHUM('Sem colar', 'No necklace', 'Sin collar'), o('perolas', 'Pérolas', 'Pearls', 'Perlas', ['princesa', 'festa', 'joia']), o('coracao', 'Coração', 'Heart', 'Corazón', ['festa', 'aniversario']),
      o('gargantilha', 'Gargantilha', 'Choker', 'Gargantilla', ['pop']), o('estrela', 'Estrela', 'Star', 'Estrella', ['pop']), o('flores', 'Colar de flores', 'Flower lei', 'Collar de flores', ['praia', 'jardim']),
      o('diamantes', 'De diamantes', 'Diamond necklace', 'De diamantes', ['princesa', 'festa', 'joia', 'brilho']), o('medalhao', 'Medalhão', 'Locket', 'Medallón', ['festa', 'joia']),
      o('micangas', 'Miçangas coloridas', 'Colorful beads', 'Cuentas de colores', ['pop', 'praia']), o('lua', 'Lua', 'Moon', 'Luna', ['pijama']), o('concha', 'Concha', 'Shell', 'Concha', ['praia', 'sereia']),
      o('laco', 'Gargantilha de laço', 'Bow choker', 'Gargantilla con lazo', ['festa', 'aniversario']), o('duplo', 'Duas correntes', 'Layered chains', 'Dos cadenas', ['pop', 'joia']),
      o('borboleta', 'Borboleta', 'Butterfly', 'Mariposa', ['jardim'])
    ] },
    { id: 'pulseira', grupo: 'joias', ico: '⌚', pt: 'Pulseiras', en: 'Bracelets', es: 'Pulseras', cores: 'roupa', area: A.mao, zoom: 'maos', opcoes: [
      NENHUM('Sem pulseira', 'No bracelet', 'Sin pulsera'), o('simples', 'Bracelete', 'Bangle', 'Brazalete', ['joia']), o('berloque', 'Berloques', 'Charm bracelet', 'Con colgantes', ['festa', 'joia']),
      o('perolas', 'Pérolas', 'Pearls', 'Perlas', ['princesa', 'joia']), o('micangas', 'Miçangas', 'Beads', 'Cuentas', ['pop', 'praia']), o('relogio', 'Relógio', 'Watch', 'Reloj', ['casual', 'escola']),
      o('varias', 'Várias pulseiras', 'Stacked bangles', 'Varias pulseras', ['pop', 'joia']), o('amizade', 'Da amizade', 'Friendship bracelet', 'De la amistad', ['casual', 'jardim'])
    ] },
    { id: 'anel', grupo: 'joias', ico: '💍', pt: 'Anéis', en: 'Rings', es: 'Anillos', cores: 'roupa', area: A.anel, zoom: 'maos', opcoes: [
      NENHUM('Sem anel', 'No ring', 'Sin anillo'), o('simples', 'Aliancinha', 'Band', 'Anillito', ['joia']), o('pedra', 'Com pedra', 'Gemstone', 'Con piedra', ['princesa', 'festa', 'joia']),
      o('coracao', 'Coração', 'Heart', 'Corazón', ['festa', 'joia']), o('flor', 'Flor', 'Flower', 'Flor', ['jardim', 'joia']), o('estrela', 'Estrela', 'Star', 'Estrella', ['pop', 'joia']),
      o('dois', 'Nas duas mãos', 'On both hands', 'En las dos manos', ['festa', 'joia'])
    ] },
    { id: 'broche', grupo: 'joias', ico: '🏵️', pt: 'Broches', en: 'Brooches', es: 'Broches', cores: 'roupa', area: A.peito, zoom: 'busto', opcoes: [
      NENHUM('Sem broche', 'No brooch', 'Sin broche'), o('estrela', 'Estrela', 'Star', 'Estrella', ['pop', 'joia']), o('laco', 'Laço', 'Bow', 'Lazo', ['festa', 'joia']),
      o('flor', 'Flor', 'Flower', 'Flor', ['jardim', 'joia']), o('coracao', 'Coração', 'Heart', 'Corazón', ['festa', 'joia']), o('borboleta', 'Borboleta', 'Butterfly', 'Mariposa', ['jardim', 'joia']),
      o('joia', 'Pedra brilhante', 'Big gem', 'Piedra brillante', ['princesa', 'festa', 'joia'])
    ] },
    { id: 'oculos', grupo: 'acess', ico: '🕶️', pt: 'Óculos', en: 'Glasses', es: 'Gafas', cores: 'roupa', area: A.rosto, zoom: 'rosto', opcoes: [
      NENHUM('Sem óculos', 'No glasses', 'Sin gafas'), o('sol', 'De sol', 'Sunglasses', 'De sol', ['praia', 'verao', 'pop']), o('coracao', 'De coração', 'Heart glasses', 'De corazón', ['pop', 'festa']),
      o('estrela', 'De estrela', 'Star glasses', 'De estrella', ['pop', 'festa']), o('redondo', 'Redondinho', 'Round glasses', 'Redondas', ['casual', 'escola']),
      o('retangular', 'Retangular', 'Rectangle frames', 'Rectangulares', ['escola', 'casual']), o('quadrado', 'Quadradão', 'Square frames', 'Cuadradas grandes', ['escola', 'pop']),
      o('gatinho', 'Gatinho', 'Cat-eye frames', 'De gatita', ['festa', 'pop']), o('oval', 'Oval', 'Oval frames', 'Ovaladas', ['escola', 'casual']),
      o('redondoGrande', 'Redondo grandão', 'Big round frames', 'Redondas grandes', ['pop', 'casual']), o('aviador', 'Aviador', 'Aviator', 'Aviador', ['pop', 'verao']),
      o('meioAro', 'Meio aro', 'Half-rim', 'Medio aro', ['escola']), o('fininho', 'Aro fininho', 'Thin wire', 'Aro finito', ['escola', 'casual'])
    ] },
    { id: 'bolsa', grupo: 'acess', ico: '👜', pt: 'Bolsas', en: 'Bags', es: 'Bolsos', cores: 'roupa', area: A.corpo, opcoes: [
      NENHUM('Sem bolsa', 'No bag', 'Sin bolso'), o('mao', 'Bolsinha de mão', 'Clutch', 'Bolsito de mano', ['festa', 'princesa']), o('ombro', 'Bolsa de ombro', 'Shoulder bag', 'Bolso de hombro', ['casual', 'pop']),
      o('coracao', 'Bolsa de coração', 'Heart bag', 'Bolso de corazón', ['festa', 'aniversario', 'pop']), o('cesta', 'Cesta de piquenique', 'Picnic basket', 'Cesta de pícnic', ['jardim', 'piquenique']),
      o('praia', 'Bolsa de palha', 'Straw beach bag', 'Bolso de paja', ['praia', 'verao'])
    ] },

    { id: 'cenario', grupo: 'fundo', ico: '🏞️', pt: 'Cenário', en: 'Scene', es: 'Escenario', area: null, opcoes: [
      o('quarto', 'Meu quarto', 'My bedroom', 'Mi habitación', ['pijama']), o('praia', 'Praia', 'Beach', 'Playa', ['praia']), o('castelo', 'Baile no castelo', 'Castle ball', 'Baile en el castillo', ['princesa']),
      o('palco', 'Palco do show', 'Concert stage', 'Escenario del concierto', ['pop']), o('jardim', 'Jardim', 'Garden', 'Jardín', ['jardim']), o('neve', 'Neve', 'Snow', 'Nieve', ['inverno']),
      o('festa', 'Festa de aniversário', 'Birthday party', 'Fiesta de cumpleaños', ['aniversario']), o('mar', 'Fundo do mar', 'Under the sea', 'Fondo del mar', ['sereia'])
    ] }
  ];

  // como a personagem começa (e o que volta no "começar de novo")
  var PADRAO = {
    pele: 'p3', personagem: 'menina', rosto: 'oval', nariz: 'botao', testa: 'normal', formaOlho: 'redondos', distOlhos: 'normal', formaBoca: 'coracao', cabelo: 'ondulado', cabeloCor: 'castanho', mechas: 'nenhum', mechasCor: 'rosa', olhos: 'castanho',
    base: 'nenhum', blush: 'nenhum', blushCor: 'rosa', sombra: 'nenhum', sombraCor: 'lilas', delineado: 'nenhum', delineadoCor: 'preto',
    cilios: 'curtos', ciliosCor: 'preto', unhas: 'nenhum', unhasCor: 'chiclete', batom: 'nenhum', batomCor: 'rosaclaro', glitter: 'nenhum', glitterCor: 'dourado', adesivo: 'nenhum',
    vestido: 'nenhum', vestidoCor: 'lilas', blusa: 'camiseta', blusaCor: 'rosaclaro', saia: 'nenhum', saiaCor: 'chiclete',
    calca: 'jeans', calcaCor: 'ceu', estampa: 'liso', estampaCor: 'branco', sapatos: 'tenis', sapatosCor: 'branco',
    cabeca: 'nenhum', cabecaCor: 'dourado', laco: 'nenhum', lacoCor: 'chiclete', brincos: 'nenhum', brincosCor: 'dourado', pulseira: 'nenhum', pulseiraCor: 'dourado', anel: 'nenhum', anelCor: 'dourado', broche: 'nenhum', brocheCor: 'dourado',
    colar: 'nenhum', colarCor: 'dourado', oculos: 'nenhum', oculosCor: 'chiclete', bolsa: 'nenhum', bolsaCor: 'chiclete', cenario: 'quarto'
  };

  /* Desafios: cada um tem 3 dicas. Estrelas = dicas cumpridas, mas sempre pelo menos 1 (ninguém perde).
     Forma das dicas (conferidas em visual.js):
       { c: 'sapatos', tag: 'praia' }        a peça visível da categoria tem essa tag
       { c: 'cabeca', v: ['coroa','tiara'] } a categoria está numa dessas opções
       { c: 'glitter', algum: true }         a categoria não está em "nenhum"
       { roupa: true, tag: 'praia' }         alguma roupa visível (vestido, blusa, saia, calça) tem a tag
       { roupa: true, fam: ['azul'] }        alguma roupa visível é de uma cor dessa família
       { qualquer: [ … ] } / { todos: [ … ] } */
  var DESAFIOS = [
    { id: 'praia', ico: '🏖️', cenario: 'praia', pt: 'Festa na praia', en: 'Beach party', es: 'Fiesta en la playa', dicas: [
      { pt: 'Roupa fresquinha de verão', en: 'Cool summer clothes', es: 'Ropa fresquita de verano', t: { roupa: true, tag: 'verao' } },
      { pt: 'Algo para o sol: chapéu ou óculos de sol', en: 'Something for the sun: hat or sunglasses', es: 'Algo para el sol: sombrero o gafas de sol', t: { qualquer: [{ c: 'cabeca', v: ['chapeu'] }, { c: 'oculos', v: ['sol'] }] } },
      { pt: 'Sandália nos pés', en: 'Sandals on your feet', es: 'Sandalias en los pies', t: { c: 'sapatos', v: ['sandalia'] } }
    ] },
    { id: 'baile', ico: '👑', cenario: 'castelo', pt: 'Baile de princesa', en: 'Princess ball', es: 'Baile de princesas', dicas: [
      { pt: 'Vestido de princesa ou de sereia', en: 'Princess or mermaid gown', es: 'Vestido de princesa o de sirena', t: { c: 'vestido', v: ['princesa', 'sereia'] } },
      { pt: 'Coroa ou tiara', en: 'Crown or tiara', es: 'Corona o tiara', t: { c: 'cabeca', v: ['coroa', 'tiara'] } },
      { pt: 'Muito brilho: glitter ou sombra brilhante', en: 'Lots of sparkle: glitter or shimmer shadow', es: 'Mucho brillo: purpurina o sombra brillante', t: { qualquer: [{ c: 'glitter', algum: true }, { c: 'sombra', v: ['brilhante'] }] } }
    ] },
    { id: 'show', ico: '🎤', cenario: 'palco', pt: 'Show de pop star', en: 'Pop star concert', es: 'Concierto de estrella del pop', dicas: [
      { pt: 'Roupa de pop star', en: 'Pop star outfit', es: 'Ropa de estrella del pop', t: { roupa: true, tag: 'pop' } },
      { pt: 'Estrela: nos óculos, nos brincos, no laço ou no rosto', en: 'A star: glasses, earrings, clip or face', es: 'Una estrella: en las gafas, los pendientes, el lazo o la cara', t: { qualquer: [{ c: 'oculos', v: ['estrela'] }, { c: 'brincos', v: ['estrela'] }, { c: 'laco', v: ['estrela'] }, { c: 'adesivo', v: ['estrela'] }] } },
      { pt: 'Delineado e batom', en: 'Eyeliner and lipstick', es: 'Delineador y pintalabios', t: { todos: [{ c: 'delineado', algum: true }, { c: 'batom', algum: true }] } }
    ] },
    { id: 'piquenique', ico: '🌸', cenario: 'jardim', pt: 'Piquenique no jardim', en: 'Garden picnic', es: 'Pícnic en el jardín', dicas: [
      { pt: 'Uma flor: na cabeça, no rosto, no colar ou na estampa', en: 'A flower: head, face, necklace or pattern', es: 'Una flor: en la cabeza, la cara, el collar o el estampado', t: { qualquer: [{ c: 'cabeca', v: ['flores'] }, { c: 'adesivo', v: ['flor', 'borboleta'] }, { c: 'colar', v: ['flores'] }, { c: 'estampa', v: ['flores'] }] } },
      { pt: 'Cesta de piquenique', en: 'Picnic basket', es: 'Cesta de pícnic', t: { c: 'bolsa', v: ['cesta'] } },
      { pt: 'Roupa de cor clarinha', en: 'Light-colored clothes', es: 'Ropa de color clarito', t: { roupa: true, fam: ['claro'] } }
    ] },
    { id: 'pijama', ico: '🌙', cenario: 'quarto', pt: 'Festa do pijama', en: 'Sleepover', es: 'Fiesta de pijamas', dicas: [
      { pt: 'Pijama ou camisola', en: 'Pajamas or nightgown', es: 'Pijama o camisón', t: { roupa: true, tag: 'pijama' } },
      { pt: 'Pantufa', en: 'Slippers', es: 'Pantuflas', t: { c: 'sapatos', v: ['pantufa'] } },
      { pt: 'Adesivo de lua ou estrela', en: 'Moon or star sticker', es: 'Pegatina de luna o estrella', t: { c: 'adesivo', v: ['lua', 'estrela'] } }
    ] },
    { id: 'neve', ico: '❄️', cenario: 'neve', pt: 'Dia de neve', en: 'Snow day', es: 'Día de nieve', dicas: [
      { pt: 'Gorro na cabeça', en: 'Beanie on your head', es: 'Gorro en la cabeza', t: { c: 'cabeca', v: ['gorro'] } },
      { pt: 'Roupa quentinha', en: 'Warm clothes', es: 'Ropa calentita', t: { roupa: true, tag: 'inverno' } },
      { pt: 'Bota nos pés', en: 'Boots on your feet', es: 'Botas en los pies', t: { c: 'sapatos', v: ['bota'] } }
    ] },
    { id: 'aniversario', ico: '🎂', cenario: 'festa', pt: 'Festa de aniversário', en: 'Birthday party', es: 'Fiesta de cumpleaños', dicas: [
      { pt: 'Roupa de festa', en: 'Party clothes', es: 'Ropa de fiesta', t: { roupa: true, tag: 'festa' } },
      { pt: 'Laço no cabelo', en: 'A bow in your hair', es: 'Un lazo en el pelo', t: { c: 'laco', v: ['alto', 'lado', 'dois'] } },
      { pt: 'Um coração: bolsa, colar, brincos ou rosto', en: 'A heart: bag, necklace, earrings or face', es: 'Un corazón: bolso, collar, pendientes o cara', t: { qualquer: [{ c: 'bolsa', v: ['coracao'] }, { c: 'colar', v: ['coracao'] }, { c: 'brincos', v: ['coracao'] }, { c: 'adesivo', v: ['coracao'] }, { c: 'blush', v: ['coracao'] }] } }
    ] },
    { id: 'sereia', ico: '🧜‍♀️', cenario: 'mar', pt: 'Sereia no fundo do mar', en: 'Mermaid under the sea', es: 'Sirena en el fondo del mar', dicas: [
      { pt: 'Vestido de sereia', en: 'Mermaid dress', es: 'Vestido de sirena', t: { c: 'vestido', v: ['sereia'] } },
      { pt: 'Concha no rosto', en: 'Shell on your face', es: 'Concha en la cara', t: { c: 'adesivo', v: ['concha'] } },
      { pt: 'Cores do mar: azul, verde ou lilás', en: 'Sea colors: blue, green or lilac', es: 'Colores del mar: azul, verde o lila', t: { roupa: true, fam: ['mar'] } }
    ] },
    { id: 'joias', ico: '💎', cenario: 'castelo', pt: 'Noite das joias', en: 'Jewelry night', es: 'Noche de joyas', dicas: [
      { pt: 'Brincos de joia: pérola, diamante, gota ou pingente', en: 'Jewel earrings: pearl, diamond, drop or chandelier', es: 'Pendientes de joya: perla, diamante, gota o colgante', t: { c: 'brincos', tag: 'joia' } },
      { pt: 'Colar de joia', en: 'A jewel necklace', es: 'Un collar de joya', t: { c: 'colar', tag: 'joia' } },
      { pt: 'Pulseira ou anel', en: 'A bracelet or a ring', es: 'Una pulsera o un anillo', t: { qualquer: [{ c: 'pulseira', algum: true }, { c: 'anel', algum: true }] } }
    ] },
    { id: 'maluco', ico: '🤪', cenario: 'festa', pt: 'Dia do cabelo maluco', en: 'Crazy hair day', es: 'Día del pelo loco', dicas: [
      { pt: 'Cabelo de cor divertida (rosa, lilás, azul ou verde-água)', en: 'Fun hair color (pink, lilac, blue or aqua)', es: 'Pelo de color divertido (rosa, lila, azul o verde agua)', t: { c: 'cabeloCor', v: ['rosa', 'lilas', 'azul', 'menta'] } },
      { pt: 'Mechas coloridas', en: 'Colored highlights', es: 'Mechones de colores', t: { c: 'mechas', algum: true } },
      { pt: 'Penteado divertido: puffs, coquinhos, chiquinhas ou black power', en: 'Fun hairdo: puffs, space buns, pigtails or afro', es: 'Peinado divertido: puffs, moñitos, coletas o afro', t: { c: 'cabelo', v: ['puffs', 'coqueDuplo', 'chiquinhas', 'afro'] } }
    ] }
  ];

  var porId = {};
  CATEGORIAS.forEach(function (cat) { porId[cat.id] = cat; });
  function categoria(id) { return porId[id] || null; }
  function opcao(catId, id) { var cat = porId[catId]; if (!cat || !cat.opcoes) return null; for (var i = 0; i < cat.opcoes.length; i++) if (cat.opcoes[i].id === id) return cat.opcoes[i]; return null; }
  function cor(paleta, id) { var l = CORES[paleta] || []; for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return l[0] || null; }

  var API = { ZOOM: ZOOM, CORES: CORES, GRUPOS: GRUPOS, CATEGORIAS: CATEGORIAS, PADRAO: PADRAO, DESAFIOS: DESAFIOS, categoria: categoria, opcao: opcao, cor: cor };
  raiz.PurpurinaPecas = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : this);
