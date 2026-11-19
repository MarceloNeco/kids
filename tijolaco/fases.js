/* TIJOLAÇO — as 8 fases do TijoLinto (formato parecido com o da referência, em JSON).
   Campo deitado de 1000 × 620 unidades (em pé, o jogo troca x por y sozinho). Tijolo: raio 16.
   Cada fase:
     lancador   { x, y } fixo, ou { trilho: [[x0,y0],[x1,y1]] } (anda no andaime)
     trilhos    [{ p: [[x,y]…] }] ou [{ pecas: [{ p: […] }, { portao: { curto: […], longo: […], botao: [x,y] } }, { p: […] }] }]
                o caminho começa na boca da manilha (primeiro ponto) e termina na caçamba (último)
     manilhas   [[[x0,y0],[x1,y1]]] canos onde a fila some (quem cruza por cima passa numa ponte)
     vel        velocidade da fila (unidades por segundo, no nível Médio)
     rajada     quantos tijolos entram correndo no começo
     meta       tijolos estourados para encher a Barra da Obra (no Médio)
     cores      no máximo quantas cores (o nível limita: fácil 4, médio 5, difícil 6)
     poder      chance de um tijolo novo vir com poder · poderes: quais podem vir
     capacete   de quantos em quantos segundos aparece o capacete dourado */
(function (raiz) {
  'use strict';
  var FASES = [
    { id: 1, nome: { pt: 'Fundação', en: 'Foundation', es: 'Cimientos' },
      lancador: { x: 560, y: 315 },
      trilhos: [{ p: [[16, 92], [200, 70], [500, 60], [790, 68], [925, 135], [950, 310], [918, 488], [780, 560], [500, 572], [220, 556], [92, 470], [70, 300], [128, 182], [300, 152], [520, 150], [720, 165], [828, 240], [842, 362], [770, 452], [600, 478], [420, 470], [292, 420], [240, 330]] }],
      vel: 30, rajada: 22, meta: 54, cores: 4, poder: 0.04, poderes: ['devagar', 'marreta', 'prumo'], capacete: 22 },

    { id: 2, nome: { pt: 'Serpentina', en: 'Snake Run', es: 'Serpentina' },
      lancador: { x: 620, y: 255 },
      trilhos: [{ p: [[984, 80], [800, 68], [560, 78], [385, 108], [252, 178], [205, 290], [262, 385], [400, 425], [600, 412], [760, 440], [826, 515], [700, 572], [450, 580], [210, 575], [64, 538]] }],
      vel: 32, rajada: 22, meta: 60, poder: 0.05, capacete: 20 },

    { id: 3, nome: { pt: 'A Manilha', en: 'The Pipe', es: 'La Tubería' },
      lancador: { x: 300, y: 165 },
      trilhos: [{ p: [[16, 330], [180, 330], [380, 330], [580, 330], [760, 320], [880, 240], [902, 130], [822, 62], [690, 62], [620, 130], [600, 240], [600, 330], [600, 430], [562, 530], [440, 575], [280, 570], [160, 522], [120, 446]] }],
      manilhas: [[[515, 330], [690, 329]]],
      vel: 33, rajada: 22, meta: 64, poder: 0.05, capacete: 20 },

    { id: 4, nome: { pt: 'O Portão', en: 'The Gate', es: 'La Puerta' },
      lancador: { x: 500, y: 330 },
      trilhos: [{ pecas: [
        { p: [[16, 560], [200, 570], [480, 572], [740, 560], [880, 505], [922, 400]] },
        { portao: { curto: [[928, 285]], longo: [[828, 438], [712, 372], [694, 268], [782, 205]], botao: [842, 318] } },
        { p: [[900, 150], [820, 72], [600, 64], [380, 66], [180, 80], [92, 160], [86, 300], [160, 400], [282, 420]] }
      ] }],
      vel: 34, rajada: 20, meta: 64, poder: 0.05, capacete: 20 },

    { id: 5, nome: { pt: 'Labirinto', en: 'Maze', es: 'Laberinto' },
      lancador: { x: 520, y: 330 },
      trilhos: [{ pecas: [
        { p: [[16, 250], [60, 320], [72, 450], [130, 556], [300, 572], [500, 574], [700, 572], [880, 555], [905, 455]] },
        { portao: { curto: [[938, 350]], longo: [[830, 430], [770, 370], [850, 300]], botao: [880, 365] } },
        { p: [[945, 250], [928, 118], [800, 60], [550, 60]] },
        { portao: { curto: [[400, 62]], longo: [[500, 145], [400, 182], [300, 140]], botao: [400, 116] } },
        { p: [[250, 60], [150, 66], [72, 92]] }
      ] }],
      manilhas: [[[410, 574], [590, 574]]],
      vel: 36, rajada: 20, meta: 70, poder: 0.05, capacete: 20 },

    { id: 6, nome: { pt: 'Duas Frentes', en: 'Two Fronts', es: 'Dos Frentes' },
      lancador: { x: 500, y: 310 },
      trilhos: [
        { p: [[16, 565], [150, 572], [325, 522], [398, 400], [392, 250], [322, 122], [190, 78], [92, 140], [80, 282], [160, 368], [252, 330]] },
        { p: [[984, 565], [850, 572], [675, 522], [602, 400], [608, 250], [678, 122], [810, 78], [908, 140], [920, 282], [840, 368], [748, 330]] }
      ],
      vel: 20, rajada: 14, meta: 76, poder: 0.05, capacete: 18 },

    { id: 7, nome: { pt: 'Cruzamento', en: 'Crossroads', es: 'Cruce' },
      lancador: { x: 600, y: 330 },
      trilhos: [
        { pecas: [
          { p: [[16, 140], [150, 140], [330, 140], [520, 140], [700, 150]] },
          { portao: { curto: [[812, 205]], longo: [[812, 72], [930, 100], [958, 212]], botao: [858, 168] } },
          { p: [[892, 305], [880, 420], [800, 505], [705, 538]] }
        ] },
        { p: [[262, 40], [262, 150], [262, 280], [200, 400], [120, 480], [160, 560], [300, 575], [440, 560], [520, 500]] }
      ],
      manilhas: [[[190, 140], [340, 140]]],
      vel: 22, rajada: 14, meta: 80, poder: 0.06, capacete: 18 },

    { id: 8, nome: { pt: 'No Andaime', en: 'On the Scaffold', es: 'En el Andamio' },
      lancador: { trilho: [[150, 578], [850, 578]] },
      trilhos: [{ p: [[16, 62], [300, 60], [700, 62], [905, 85], [948, 160], [880, 240], [600, 252], [300, 250], [118, 280], [80, 360], [150, 425], [380, 438], [640, 432], [820, 410]] }],
      manilhas: [[[420, 251], [580, 251]]],
      vel: 34, rajada: 22, meta: 84, poder: 0.06, capacete: 18 }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = FASES;
  else raiz.TijolacoFases = FASES;
})(this);
