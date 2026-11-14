/* Vruuum! — a garagem: 26 veículos, todos em 3D, desenhados em código (modelos3d.js; cavalo e dinossauro no cavalo.js):
   na curva aparece a lateral, no morro o teto. Grupos: carros, "moto, skate e montarias" e os que voam (desenho.js troca
   a estrada por uma rota no ar e os obstáculos por pássaros, nuvens de tempestade, anéis e correntes de ar).
   Estilos inspirados em carros esportivos famosos, mas sem marca, logotipo ou nome de fabricante.
   vel e curva: pequenas diferenças (até ~10%) para cada um ter seu jeito sem desequilibrar a corrida. */
(function (raiz) {
  'use strict';
  var MOD = raiz.VruuumModelos || (typeof require === 'function' ? require('./modelos3d.js') : null);
  // veículo em 3D (modelos3d.js): desenho parado de costas para os rivais/garagem e a cabeça do piloto no lugar certo
  function em3d(id, extra) {
    var v = { modelo: id, aberto: true, janela: { elipse: [0.5, 0.3, 0.2, 0.2] }, desenhar: MOD.desenhar(id) };
    Object.keys(extra).forEach(function (k) { v[k] = extra[k]; });
    var o = MOD.cabeca(id, 0, 0, v.w, v.h, 0.3, 0, 0); v.cab = o ? [o.x / v.w, o.y / v.h, 2 * o.r / v.h] : [0.5, 0.3, 0.15];
    return v;
  }
  var CAV = raiz.VruuumCavalo || (typeof require === 'function' ? require('./cavalo.js') : null);

  function tom(cor, f) {   // f > 0 clareia, f < 0 escurece
    var n = parseInt(cor.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function m(v) { return Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f)); }
    return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')';
  }

  var LISTA = [
    em3d('classico', { id: 'classico', grupo: 'terra', nome: ['Clássico', 'Classic', 'Clásico'], w: 800, h: 1120, vel: 1, curva: 1 }),
    em3d('conversivel', { id: 'conversivel', grupo: 'terra', nome: ['Conversível Rosa', 'Pink Convertible', 'Descapotable Rosa'], w: 820, h: 1120, vel: 1.02, curva: 1.04 }),
    em3d('gt', { id: 'gt', grupo: 'terra', nome: ['GT Redondo', 'Round GT', 'GT Redondo'], w: 820, h: 990, vel: 1.04, curva: 1.03 }),
    em3d('super', { id: 'super', grupo: 'terra', nome: ['Superesportivo', 'Supercar', 'Superdeportivo'], w: 920, h: 960, vel: 1.08, curva: 0.95 }),
    em3d('kart', { id: 'kart', capacete: true, grupo: 'terra', nome: ['Kart', 'Kart', 'Kart'], w: 720, h: 760, vel: 0.96, curva: 1.12 }),
    em3d('monstrao', { id: 'monstrao', grupo: 'terra', nome: ['Monstrão', 'Monster Truck', 'Camión Monstruo'], w: 960, h: 1550, vel: 0.95, curva: 0.98 }),
    em3d('moto', { id: 'moto', capacete: true, grupo: 'moto', nome: ['Moto', 'Motorbike', 'Moto'], w: 520, h: 1250, vel: 1.03, curva: 1.1 }),
    em3d('skate', { id: 'skate', semMotor: true, quadros: 12, grupo: 'moto', nome: ['Skate', 'Skateboard', 'Skate'], w: 560, h: 1050, vel: 0.94, curva: 1.15 }),
    { id: 'cavalo', semMotor: true, voz: 'cavalo', janela: { elipse: [0.5, 0.16, 0.3, 0.2] }, cab: [0.5, 0.16, 0.132], aberto: true, quadros: 12, cavalo: true, grupo: 'moto', nome: ['Cavalo', 'Horse', 'Caballo'], w: 720, h: 1050, vel: 0.97, curva: 1.12, desenhar: function (c, W, H, cor, e, f, corpo) { CAV.desenhar(c, W, H, cor, e, f, corpo); } },
    { id: 'dino', semMotor: true, voz: 'dino', janela: { elipse: [0.5, 0.16, 0.3, 0.2] }, cab: [0.5, 0.16, 0.132], aberto: true, quadros: 12, cavalo: true, bicho: 'dino', grupo: 'moto', nome: ['Dinossauro', 'Dinosaur', 'Dinosaurio'], w: 720, h: 1050, vel: 0.98, curva: 1.08, desenhar: function (c, W, H, cor, e, f, corpo) { CAV.desenhar(c, W, H, cor, e, f, corpo, 'dino'); } },
    em3d('galinha', { id: 'galinha', quadros: 8, galinha: true, semMotor: true, voz: 'galo', grupo: 'moto', nome: ['Galinha', 'Hen', 'Gallina'], w: 900, h: 1000, vel: 0.95, curva: 1.12 }),
    em3d('pipoca', { id: 'pipoca', quadros: 6, grupo: 'terra', nome: ['Carrinho de Pipoca', 'Popcorn Cart', 'Carrito de Palomitas'], w: 820, h: 900, vel: 0.95, curva: 1.08 }),
    em3d('sorvete', { id: 'sorvete', quadros: 8, grupo: 'terra', nome: ['Carrinho de Sorvete', 'Ice Cream Cart', 'Carrito de Helados'], w: 820, h: 960, vel: 0.95, curva: 1.08 }),
    em3d('hamburguer', { id: 'hamburguer', grupo: 'terra', nome: ['Carro-Hambúrguer', 'Burger Car', 'Coche Hamburguesa'], w: 900, h: 860, vel: 1.0, curva: 1.0 }),
    em3d('furgao', { id: 'furgao', grupo: 'terra', nome: ['Furgão de Surfe', 'Surf Van', 'Furgoneta de Surf'], w: 900, h: 1000, vel: 0.99, curva: 1.0 }),
    em3d('escolar', { id: 'escolar', quadros: 8, grupo: 'terra', nome: ['Ônibus Escolar', 'School Bus', 'Autobús Escolar'], w: 1000, h: 1100, vel: 0.95, curva: 0.96 }),
    em3d('pelucias', { id: 'pelucias', quadros: 8, grupo: 'terra', nome: ['Caminhão de Pelúcias', 'Plush Claw Truck', 'Camión de Peluches'], w: 1000, h: 1060, vel: 0.96, curva: 0.98 }),
    em3d('patins', { id: 'patins', capacete: true, semMotor: true, quadros: 12, grupo: 'moto', nome: ['Patins', 'Roller Skates', 'Patines'], w: 700, h: 1170, vel: 0.95, curva: 1.15 }),
    em3d('guincho', { id: 'guincho', quadros: 8, grupo: 'terra', nome: ['Caminhão Guincho', 'Tow Truck', 'Camión Grúa'], w: 760, h: 1290, vel: 0.95, curva: 0.96 }),
    em3d('ovo', { id: 'ovo', quadros: 8, semPiloto: true, semMotor: true, grupo: 'moto', nome: ['Ovo Corredor', 'Running Egg', 'Huevo Corredor'], w: 720, h: 1000, vel: 0.97, curva: 1.14 }),
    em3d('aviao', { id: 'aviao', grupo: 'ar', nome: ['Aviãozinho', 'Little Plane', 'Avioncito'], w: 1500, h: 760, vel: 1, curva: 1.05 }),
    em3d('jato', { id: 'jato', grupo: 'ar', nome: ['Jato', 'Jet', 'Jet'], w: 1300, h: 700, vel: 1.1, curva: 0.92 }),
    em3d('treno', { id: 'treno', semMotor: true, quadros: 8, grupo: 'ar', nome: ['Trenó do Papai Noel', "Santa's Sleigh", 'Trineo de Papá Noel'], w: 880, h: 1180, vel: 1.0, curva: 1.05 }),
    em3d('arara', { id: 'arara', semMotor: true, voz: 'arara', quadros: 8, grupo: 'ar', nome: ['Arara Gigante', 'Giant Macaw', 'Guacamayo Gigante'], w: 1300, h: 1000, vel: 1.04, curva: 1.08 }),
    em3d('morcego', { id: 'morcego', quadros: 8, dracula: true, abobora: true, semMotor: true, voz: 'morcego', grupo: 'ar', nome: ['Morcego (vira Drácula!)', 'Bat (turns into Dracula!)', 'Murciélago (¡se vuelve Drácula!)'], w: 1300, h: 1000, vel: 1.02, curva: 1.1 }),
    em3d('heli', { id: 'heli', grupo: 'ar', nome: ['Helicóptero', 'Helicopter', 'Helicóptero'], w: 1100, h: 900, vel: 0.95, curva: 1.12 })
  ];
  var GRUPOS = [
    { id: 'terra', nome: ['🚗 Carros', '🚗 Cars', '🚗 Coches'] },
    { id: 'moto', nome: ['🏍️ Moto, skate e montarias', '🏍️ Bike, skateboard and rides', '🏍️ Moto, skate y monturas'] },
    { id: 'ar', nome: ['✈️ No céu (voa!)', '✈️ In the sky (flies!)', '✈️ En el cielo (¡vuela!)'] }
  ];
  function achar(id) { for (var k = 0; k < LISTA.length; k++) if (LISTA[k].id === id) return LISTA[k]; return null; }
  function voa(id) { var v = achar(id); return !!(v && v.grupo === 'ar'); }

  var VruuumVeiculos = { LISTA: LISTA, GRUPOS: GRUPOS, achar: achar, voa: voa, tom: tom };
  if (typeof module !== 'undefined' && module.exports) module.exports = VruuumVeiculos;
  else raiz.VruuumVeiculos = VruuumVeiculos;
})(this);
