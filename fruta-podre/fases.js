/* FRUTA PODRE — fases do Mundo 1, "A Quitanda do Seu Zé", no formato da especificação (seção 6.2).
   Coordenadas do mundo em pixels: o chão fica em y = 600 (topo da calçada) e x, y são o CENTRO de cada peça.
   Acréscimos ao formato: "title" nos três idiomas, "width" (largura do mundo) e "static": true (bancada fixa, não quebra).
   Tipos: blocos wood_plank, wood_crate, glass_jar, glass_pane, stone_slab, stone_block; pragas mosca_zumbidora,
   barata_cascuda, rato_ladrao (armor "bottle_cap" = capacete de tampinha, aguenta 2 golpes); perigo vinegar_barrel.
   Vigia: teste/regras.test.js (cada fase monta, fica de pé sozinha e tem pragas e frutas). */
(function (raiz) {
  var MUNDO = { id: 'mundo1', nome: { pt: 'A Quitanda do Seu Zé', en: "Mr. Zé's Fruit Stand", es: 'La frutería de don Zé' } };
  var FASES = [
    {
      "levelId": "mundo1_fase01",
      "title": { "pt": "A Primeira Bancada", "en": "The First Stand", "es": "El primer puesto" },
      "width": 1600,
      "parScores": { "oneStar": 15000, "twoStars": 20000, "threeStars": 25000 },
      "slingshot": { "x": 180, "y": 470, "ammoQueue": ["maca_podre", "maca_podre", "maca_podre"] },
      "blocks": [
        { "type": "wood_plank", "x": 960, "y": 550, "width": 20, "height": 100, "angle": 0 },
        { "type": "wood_plank", "x": 1080, "y": 550, "width": 20, "height": 100, "angle": 0 },
        { "type": "wood_plank", "x": 1020, "y": 490, "width": 160, "height": 20, "angle": 0 },
        { "type": "glass_jar", "x": 985, "y": 455, "width": 36, "height": 50, "angle": 0 },
        { "type": "glass_jar", "x": 1055, "y": 455, "width": 36, "height": 50, "angle": 0 },
        { "type": "wood_plank", "x": 1020, "y": 420, "width": 120, "height": 20, "angle": 0 },
        { "type": "wood_crate", "x": 1220, "y": 570, "width": 60, "height": 60, "angle": 0 },
        { "type": "glass_jar", "x": 1220, "y": 515, "width": 36, "height": 50, "angle": 0 }
      ],
      "enemies": [
        { "type": "barata_cascuda", "x": 1020, "y": 582, "armor": "none" },
        { "type": "mosca_zumbidora", "x": 1020, "y": 368, "armor": "none" },
        { "type": "mosca_zumbidora", "x": 1220, "y": 448, "armor": "none" }
      ],
      "hazards": []
    },
    {
      "levelId": "mundo1_fase02",
      "title": { "pt": "Potes de Vidro", "en": "Glass Jars", "es": "Tarros de cristal" },
      "width": 1700,
      "parScores": { "oneStar": 20000, "twoStars": 26000, "threeStars": 31000 },
      "slingshot": { "x": 180, "y": 470, "ammoQueue": ["trio_uva", "trio_uva", "maca_podre"] },
      "blocks": [
        { "type": "glass_jar", "x": 985, "y": 575, "width": 36, "height": 50, "angle": 0 },
        { "type": "glass_jar", "x": 1025, "y": 575, "width": 36, "height": 50, "angle": 0 },
        { "type": "glass_jar", "x": 1065, "y": 575, "width": 36, "height": 50, "angle": 0 },
        { "type": "glass_jar", "x": 1105, "y": 575, "width": 36, "height": 50, "angle": 0 },
        { "type": "glass_pane", "x": 1045, "y": 543, "width": 160, "height": 14, "angle": 0 },
        { "type": "glass_jar", "x": 1005, "y": 511, "width": 36, "height": 50, "angle": 0 },
        { "type": "glass_jar", "x": 1045, "y": 511, "width": 36, "height": 50, "angle": 0 },
        { "type": "glass_jar", "x": 1085, "y": 511, "width": 36, "height": 50, "angle": 0 },
        { "type": "glass_pane", "x": 1045, "y": 479, "width": 120, "height": 14, "angle": 0 },
        { "type": "glass_jar", "x": 1025, "y": 447, "width": 36, "height": 50, "angle": 0 },
        { "type": "glass_jar", "x": 1065, "y": 447, "width": 36, "height": 50, "angle": 0 },
        { "type": "wood_plank", "x": 1045, "y": 412, "width": 100, "height": 20, "angle": 0 },
        { "type": "wood_plank", "x": 1270, "y": 550, "width": 20, "height": 100, "angle": 0 },
        { "type": "wood_plank", "x": 1370, "y": 550, "width": 20, "height": 100, "angle": 0 },
        { "type": "glass_pane", "x": 1320, "y": 493, "width": 130, "height": 14, "angle": 0 },
        { "type": "glass_jar", "x": 1320, "y": 461, "width": 36, "height": 50, "angle": 0 }
      ],
      "enemies": [
        { "type": "barata_cascuda", "x": 1045, "y": 384, "armor": "none" },
        { "type": "barata_cascuda", "x": 1320, "y": 582, "armor": "none" },
        { "type": "mosca_zumbidora", "x": 925, "y": 470, "armor": "none" },
        { "type": "mosca_zumbidora", "x": 1175, "y": 430, "armor": "none" }
      ],
      "hazards": []
    },
    {
      "levelId": "mundo1_fase03",
      "title": { "pt": "Parede de Tábuas", "en": "The Plank Wall", "es": "El muro de tablas" },
      "width": 1700,
      "parScores": { "oneStar": 15000, "twoStars": 21000, "threeStars": 26000 },
      "slingshot": { "x": 180, "y": 470, "ammoQueue": ["pimenta_jato", "pimenta_jato", "maca_podre"] },
      "blocks": [
        { "type": "wood_plank", "x": 930, "y": 530, "width": 20, "height": 140, "angle": 0 },
        { "type": "wood_plank", "x": 951, "y": 530, "width": 20, "height": 140, "angle": 0 },
        { "type": "wood_plank", "x": 1060, "y": 540, "width": 20, "height": 120, "angle": 0 },
        { "type": "wood_plank", "x": 1200, "y": 540, "width": 20, "height": 120, "angle": 0 },
        { "type": "wood_plank", "x": 1130, "y": 470, "width": 170, "height": 20, "angle": 0 },
        { "type": "wood_plank", "x": 1080, "y": 435, "width": 20, "height": 50, "angle": 0 },
        { "type": "wood_plank", "x": 1180, "y": 435, "width": 20, "height": 50, "angle": 0 },
        { "type": "wood_plank", "x": 1130, "y": 400, "width": 140, "height": 20, "angle": 0 },
        { "type": "wood_plank", "x": 1270, "y": 530, "width": 20, "height": 140, "angle": 0 },
        { "type": "wood_plank", "x": 1291, "y": 530, "width": 20, "height": 140, "angle": 0 },
        { "type": "wood_crate", "x": 1380, "y": 570, "width": 60, "height": 60, "angle": 0 }
      ],
      "enemies": [
        { "type": "barata_cascuda", "x": 1130, "y": 582, "armor": "none" },
        { "type": "rato_ladrao", "x": 1130, "y": 437, "armor": "bottle_cap" },
        { "type": "mosca_zumbidora", "x": 1380, "y": 500, "armor": "none" }
      ],
      "hazards": []
    },
    {
      "levelId": "mundo1_fase04",
      "title": { "pt": "A Torre de Caixotes", "en": "The Crate Tower", "es": "La torre de cajas" },
      "width": 1800,
      "parScores": { "oneStar": 15000, "twoStars": 21000, "threeStars": 26000 },
      "slingshot": { "x": 180, "y": 470, "ammoQueue": ["maca_podre", "trio_uva", "pimenta_jato", "melancia_passada"] },
      "blocks": [
        { "type": "wood_crate", "x": 1080, "y": 570, "width": 60, "height": 60, "angle": 0 },
        { "type": "wood_crate", "x": 1080, "y": 510, "width": 60, "height": 60, "angle": 0 },
        { "type": "wood_crate", "x": 1080, "y": 450, "width": 60, "height": 60, "angle": 0 },
        { "type": "glass_jar", "x": 1028, "y": 575, "width": 36, "height": 50, "angle": 0 },
        { "type": "glass_jar", "x": 1132, "y": 575, "width": 36, "height": 50, "angle": 0 },
        { "type": "stone_slab", "x": 1080, "y": 410, "width": 160, "height": 20, "angle": 0 },
        { "type": "glass_jar", "x": 1020, "y": 375, "width": 36, "height": 50, "angle": 0 },
        { "type": "glass_jar", "x": 1140, "y": 375, "width": 36, "height": 50, "angle": 0 },
        { "type": "wood_plank", "x": 1220, "y": 550, "width": 20, "height": 100, "angle": 0 },
        { "type": "wood_plank", "x": 1310, "y": 550, "width": 20, "height": 100, "angle": 0 },
        { "type": "glass_pane", "x": 1265, "y": 493, "width": 120, "height": 14, "angle": 0 },
        { "type": "wood_plank", "x": 1265, "y": 476, "width": 100, "height": 20, "angle": 0 }
      ],
      "enemies": [
        { "type": "rato_ladrao", "x": 1080, "y": 377, "armor": "bottle_cap" },
        { "type": "barata_cascuda", "x": 1265, "y": 582, "armor": "none" },
        { "type": "mosca_zumbidora", "x": 950, "y": 450, "armor": "none" }
      ],
      "hazards": []
    },
    {
      "levelId": "mundo1_fase05",
      "title": { "pt": "Cuidado: Vinagre!", "en": "Watch Out: Vinegar!", "es": "¡Cuidado: vinagre!" },
      "width": 1800,
      "parScores": { "oneStar": 15000, "twoStars": 25000, "threeStars": 35000 },
      "slingshot": { "x": 180, "y": 470, "ammoQueue": ["maca_podre", "abacaxi_azedo", "trio_uva"] },
      "blocks": [
        { "type": "wood_plank", "x": 930, "y": 540, "width": 20, "height": 120, "angle": 0 },
        { "type": "wood_plank", "x": 1030, "y": 540, "width": 20, "height": 120, "angle": 0 },
        { "type": "wood_plank", "x": 980, "y": 470, "width": 140, "height": 20, "angle": 0 },
        { "type": "wood_plank", "x": 1190, "y": 540, "width": 20, "height": 120, "angle": 0 },
        { "type": "wood_plank", "x": 1290, "y": 540, "width": 20, "height": 120, "angle": 0 },
        { "type": "stone_slab", "x": 1240, "y": 470, "width": 140, "height": 20, "angle": 0 },
        { "type": "glass_jar", "x": 1188, "y": 435, "width": 36, "height": 50, "angle": 0 },
        { "type": "glass_jar", "x": 1292, "y": 435, "width": 36, "height": 50, "angle": 0 }
      ],
      "enemies": [
        { "type": "barata_cascuda", "x": 980, "y": 442, "armor": "none" },
        { "type": "rato_ladrao", "x": 1240, "y": 437, "armor": "bottle_cap" },
        { "type": "mosca_zumbidora", "x": 1110, "y": 490, "armor": "none" }
      ],
      "hazards": [
        { "type": "vinegar_barrel", "x": 980, "y": 571 },
        { "type": "vinegar_barrel", "x": 1110, "y": 571 },
        { "type": "vinegar_barrel", "x": 1240, "y": 571 }
      ]
    },
    {
      "levelId": "mundo1_fase06",
      "title": { "pt": "O Bunker de Pedra", "en": "The Stone Bunker", "es": "El búnker de piedra" },
      "width": 1800,
      "parScores": { "oneStar": 20000, "twoStars": 30000, "threeStars": 40000 },
      "slingshot": { "x": 180, "y": 470, "ammoQueue": ["melancia_passada", "abacaxi_azedo", "maca_podre"] },
      "blocks": [
        { "type": "stone_block", "x": 1000, "y": 580, "width": 40, "height": 40, "angle": 0 },
        { "type": "stone_block", "x": 1000, "y": 540, "width": 40, "height": 40, "angle": 0 },
        { "type": "stone_block", "x": 1000, "y": 500, "width": 40, "height": 40, "angle": 0 },
        { "type": "stone_block", "x": 1160, "y": 580, "width": 40, "height": 40, "angle": 0 },
        { "type": "stone_block", "x": 1160, "y": 540, "width": 40, "height": 40, "angle": 0 },
        { "type": "stone_block", "x": 1160, "y": 500, "width": 40, "height": 40, "angle": 0 },
        { "type": "stone_slab", "x": 1080, "y": 470, "width": 200, "height": 20, "angle": 0 },
        { "type": "wood_crate", "x": 1080, "y": 430, "width": 60, "height": 60, "angle": 0 },
        { "type": "glass_jar", "x": 1080, "y": 375, "width": 36, "height": 50, "angle": 0 }
      ],
      "enemies": [
        { "type": "rato_ladrao", "x": 1055, "y": 577, "armor": "bottle_cap" },
        { "type": "barata_cascuda", "x": 1112, "y": 582, "armor": "none" },
        { "type": "barata_cascuda", "x": 1030, "y": 442, "armor": "none" },
        { "type": "mosca_zumbidora", "x": 1080, "y": 315, "armor": "none" }
      ],
      "hazards": [
        { "type": "vinegar_barrel", "x": 945, "y": 571 },
        { "type": "vinegar_barrel", "x": 1215, "y": 571 }
      ]
    },
    {
      "levelId": "mundo1_fase07",
      "title": { "pt": "Feira em Dois Andares", "en": "Two-Story Market", "es": "Mercadillo de dos pisos" },
      "width": 1900,
      "parScores": { "oneStar": 20000, "twoStars": 24000, "threeStars": 30000 },
      "slingshot": { "x": 180, "y": 470, "ammoQueue": ["trio_uva", "pimenta_jato", "melancia_passada", "abacaxi_azedo"] },
      "blocks": [
        { "type": "wood_plank", "x": 1120, "y": 488, "width": 300, "height": 24, "angle": 0, "static": true },
        { "type": "wood_plank", "x": 990, "y": 550, "width": 20, "height": 100, "angle": 0, "static": true },
        { "type": "wood_plank", "x": 1250, "y": 550, "width": 20, "height": 100, "angle": 0, "static": true },
        { "type": "wood_plank", "x": 1040, "y": 431, "width": 20, "height": 90, "angle": 0 },
        { "type": "wood_plank", "x": 1200, "y": 431, "width": 20, "height": 90, "angle": 0 },
        { "type": "glass_pane", "x": 1120, "y": 379, "width": 180, "height": 14, "angle": 0 },
        { "type": "glass_jar", "x": 1080, "y": 347, "width": 36, "height": 50, "angle": 0 },
        { "type": "glass_jar", "x": 1160, "y": 347, "width": 36, "height": 50, "angle": 0 },
        { "type": "wood_plank", "x": 1120, "y": 312, "width": 120, "height": 20, "angle": 0 },
        { "type": "stone_block", "x": 1360, "y": 580, "width": 40, "height": 40, "angle": 0 },
        { "type": "stone_block", "x": 1360, "y": 540, "width": 40, "height": 40, "angle": 0 }
      ],
      "enemies": [
        { "type": "rato_ladrao", "x": 1120, "y": 453, "armor": "bottle_cap" },
        { "type": "barata_cascuda", "x": 1170, "y": 582, "armor": "none" },
        { "type": "barata_cascuda", "x": 1360, "y": 502, "armor": "none" },
        { "type": "mosca_zumbidora", "x": 1120, "y": 258, "armor": "none" }
      ],
      "hazards": [
        { "type": "vinegar_barrel", "x": 1060, "y": 571 }
      ]
    },
    {
      "levelId": "mundo1_fase08",
      "title": { "pt": "O Castelo do Seu Zé", "en": "Mr. Zé's Castle", "es": "El castillo de don Zé" },
      "width": 2000,
      "parScores": { "oneStar": 25000, "twoStars": 40000, "threeStars": 55000 },
      "slingshot": { "x": 180, "y": 470, "ammoQueue": ["maca_podre", "trio_uva", "pimenta_jato", "melancia_passada", "abacaxi_azedo"] },
      "blocks": [
        { "type": "wood_plank", "x": 960, "y": 540, "width": 20, "height": 120, "angle": 0 },
        { "type": "wood_plank", "x": 1040, "y": 540, "width": 20, "height": 120, "angle": 0 },
        { "type": "stone_slab", "x": 1000, "y": 470, "width": 120, "height": 20, "angle": 0 },
        { "type": "wood_plank", "x": 1110, "y": 530, "width": 20, "height": 140, "angle": 0 },
        { "type": "wood_plank", "x": 1250, "y": 530, "width": 20, "height": 140, "angle": 0 },
        { "type": "stone_slab", "x": 1180, "y": 450, "width": 180, "height": 20, "angle": 0 },
        { "type": "wood_crate", "x": 1180, "y": 410, "width": 60, "height": 60, "angle": 0 },
        { "type": "glass_jar", "x": 1180, "y": 355, "width": 36, "height": 50, "angle": 0 },
        { "type": "glass_jar", "x": 1125, "y": 415, "width": 36, "height": 50, "angle": 0 },
        { "type": "glass_jar", "x": 1235, "y": 415, "width": 36, "height": 50, "angle": 0 },
        { "type": "stone_block", "x": 1350, "y": 580, "width": 40, "height": 40, "angle": 0 },
        { "type": "stone_block", "x": 1390, "y": 580, "width": 40, "height": 40, "angle": 0 },
        { "type": "stone_block", "x": 1350, "y": 540, "width": 40, "height": 40, "angle": 0 },
        { "type": "stone_block", "x": 1390, "y": 540, "width": 40, "height": 40, "angle": 0 },
        { "type": "wood_plank", "x": 1370, "y": 510, "width": 100, "height": 20, "angle": 0 }
      ],
      "enemies": [
        { "type": "barata_cascuda", "x": 1000, "y": 442, "armor": "none" },
        { "type": "rato_ladrao", "x": 1150, "y": 577, "armor": "bottle_cap" },
        { "type": "mosca_zumbidora", "x": 1180, "y": 290, "armor": "none" },
        { "type": "rato_ladrao", "x": 1370, "y": 477, "armor": "bottle_cap" },
        { "type": "mosca_zumbidora", "x": 1460, "y": 470, "armor": "none" }
      ],
      "hazards": [
        { "type": "vinegar_barrel", "x": 1000, "y": 571 },
        { "type": "vinegar_barrel", "x": 1215, "y": 571 },
        { "type": "vinegar_barrel", "x": 1460, "y": 571 }
      ]
    }
  ];
  var F = { MUNDO: MUNDO, FASES: FASES };
  if (typeof module === 'object' && module.exports) module.exports = F; else raiz.FrutaFases = F;
})(this);
