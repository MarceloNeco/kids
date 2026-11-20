/* H-rraaa (pasta a-garra) — os prêmios em 3D, montados em código com peças simples (bolas, cilindros, cones, caixas), todos desenho
   próprio (nenhum personagem de marca). Cada tipo vira UMA geometria com as cores nos vértices (rápido no celular) e,
   por cima, os olhos (piscam) e as asas (batem) como pecinhas separadas.
     MAQUINAS             as máquinas (cada uma é um jogo): nome, prêmios, o raro e se os bichinhos são vivos
     NOMES[tipo]          [pt, en, es]
     criarPremio(tipo)    THREE.Group de raio ~1 (o app escala pelo raio da física)
     animar(obj, t, vivo) olhos piscando, asas batendo, bichinho vivo se mexendo */
import * as THREE from './libs/three.module.js';

export const MAQUINAS = {
  telefone: { nome: ['Cabine de Telefone', 'Phone Booth', 'Cabina de Teléfono'], prem: ['Pelúcias', 'Plushies', 'Peluches'],
    tipos: ['urso', 'coelho', 'gato', 'cachorro', 'ovelha', 'pinguim', 'unicornio', 'sapo', 'porquinho', 'panda', 'pato', 'girafa'], raro: 'urso-dourado' },
  neon: { nome: ['Neon', 'Neon', 'Neón'], prem: ['Bichinhos que mexem', 'Wiggly critters', 'Bichitos que se mueven'], vivos: true,
    tipos: ['dino', 'polvo', 'pintinho', 'macaco', 'raposa', 'hamster', 'coruja', 'tartaruga'], raro: 'dino-dourado' },
  estrelas: { nome: ['Estrelas', 'Stars', 'Estrellas'], prem: ['Insetos', 'Bugs', 'Insectos'],
    tipos: ['joaninha', 'abelha', 'borboleta', 'besouro', 'lagarta', 'libelula', 'formiga', 'vagalume'], raro: 'joaninha-dourada' },
  lanchonete: { nome: ['Lanchonete', 'Burger Bar', 'Hamburguesería'], prem: ['Hambúrgueres e lanches', 'Burgers and snacks', 'Hamburguesas y más'],
    tipos: ['x-burguer', 'x-salada', 'x-bacon', 'duplo', 'x-frango', 'vegano', 'x-tudo', 'cachorro-quente', 'batata', 'milk-shake'], raro: 'burguer-dourado' },
  bichos: { nome: ['Bichos de Verdade', 'Real Animals', 'Animales de Verdad'], prem: ['Filhotes que andam', 'Puppies that walk', 'Cachorros que caminan'], andam: true,
    tipos: ['salsicha', 'salsicha-caramelo', 'salsicha-malhado', 'labrador', 'gato-rajado', 'coelho-marrom', 'porquinho-da-india', 'pinguim-imperador', 'pato-real', 'jabuti', 'leaozinho'], raro: 'salsicha-dourado' },
  // gigantes: poucas pelúcias enormes numa cabine grande, com garra grande (Maquina.GIGANTE)
  gigantes: { nome: ['Gigantes', 'Giants', 'Gigantes'], prem: ['Pelúcias enormes', 'Huge plushies', 'Peluches enormes'], gigante: true,
    tipos: ['ursao', 'coelhona', 'dinossauro', 'axolote', 'baleia', 'gatao', 'cachorrao'], raro: 'ursao-dourado' },
  // a de Festas muda com a época do ano (festas.js): os prêmios e o raro são os da festa de hoje
  festas: { nome: ['Festas do Ano', 'Holidays', 'Fiestas del Año'], prem: ['Muda com a época do ano', 'Changes with the season', 'Cambia según la época del año'], tipos: [], raro: '' }
};
const FESTAS = typeof window !== 'undefined' ? window.Festas : null;
export const FESTA = FESTAS ? FESTAS.atual(location.search) : 'natal';
if (FESTAS) Object.assign(MAQUINAS.festas, { festa: FESTA, tipos: FESTAS.LISTA[FESTA].tipos, raro: FESTAS.LISTA[FESTA].raro });

export const NOMES = {
  urso: ['Ursinho', 'Teddy', 'Osito'], coelho: ['Coelhinha', 'Bunny', 'Conejita'], gato: ['Gatinho', 'Kitty', 'Gatito'], cachorro: ['Cachorrinho', 'Puppy', 'Perrito'],
  ovelha: ['Ovelhinha', 'Lamb', 'Ovejita'], pinguim: ['Pinguim', 'Penguin', 'Pingüino'], unicornio: ['Unicórnio', 'Unicorn', 'Unicornio'], sapo: ['Sapinho', 'Froggy', 'Ranita'],
  porquinho: ['Porquinha', 'Piggy', 'Cerdita'], panda: ['Panda', 'Panda', 'Panda'], pato: ['Patinho', 'Duckling', 'Patito'], girafa: ['Girafinha', 'Giraffe', 'Jirafita'],
  'urso-dourado': ['Ursinho dourado', 'Golden teddy', 'Osito dorado'],
  dino: ['Dino', 'Dino', 'Dino'], polvo: ['Polvinho', 'Octopus', 'Pulpito'], pintinho: ['Pintinho', 'Chick', 'Pollito'], macaco: ['Macaquinho', 'Monkey', 'Monito'],
  raposa: ['Raposinha', 'Fox', 'Zorrita'], hamster: ['Hamster', 'Hamster', 'Hámster'], coruja: ['Corujinha', 'Owl', 'Buhito'], tartaruga: ['Tartaruga', 'Turtle', 'Tortuga'],
  'dino-dourado': ['Dino dourado', 'Golden dino', 'Dino dorado'],
  joaninha: ['Joaninha', 'Ladybug', 'Mariquita'], abelha: ['Abelhinha', 'Bee', 'Abejita'], borboleta: ['Borboleta', 'Butterfly', 'Mariposa'], besouro: ['Besouro', 'Beetle', 'Escarabajo'],
  lagarta: ['Lagarta', 'Caterpillar', 'Oruga'], libelula: ['Libélula', 'Dragonfly', 'Libélula'], formiga: ['Formiguinha', 'Ant', 'Hormiguita'], vagalume: ['Vaga-lume', 'Firefly', 'Luciérnaga'],
  'joaninha-dourada': ['Joaninha dourada', 'Golden ladybug', 'Mariquita dorada'],
  'x-burguer': ['X-Burguer', 'Cheeseburger', 'Hamburguesa con queso'], 'x-salada': ['X-Salada', 'Salad burger', 'Hamburguesa con ensalada'], 'x-bacon': ['X-Bacon', 'Bacon burger', 'Hamburguesa con beicon'],
  duplo: ['Burguer duplo', 'Double burger', 'Hamburguesa doble'], 'x-frango': ['X-Frango', 'Chicken burger', 'Hamburguesa de pollo'], vegano: ['Burguer verde', 'Veggie burger', 'Hamburguesa vegetal'],
  'x-tudo': ['X-Tudo', 'Everything burger', 'Hamburguesa completa'], 'cachorro-quente': ['Cachorro-quente', 'Hot dog', 'Perrito caliente'], batata: ['Batata frita', 'Fries', 'Patatas fritas'],
  'milk-shake': ['Milk-shake', 'Milkshake', 'Batido'], 'burguer-dourado': ['Burguer dourado', 'Golden burger', 'Hamburguesa dorada'],
  labrador: ['Cachorro labrador', 'Labrador', 'Perro labrador'], 'gato-rajado': ['Gato rajado', 'Tabby cat', 'Gato atigrado'], 'coelho-marrom': ['Coelho', 'Rabbit', 'Conejo'],
  'porquinho-da-india': ['Porquinho-da-índia', 'Guinea pig', 'Cobaya'], 'pinguim-imperador': ['Pinguim-imperador', 'Emperor penguin', 'Pingüino emperador'],
  'pato-real': ['Pato', 'Mallard duck', 'Pato'], jabuti: ['Jabuti', 'Tortoise', 'Tortuga de tierra'], leaozinho: ['Leãozinho', 'Lion cub', 'Leoncito'],
  salsicha: ['Salsicha preto e caramelo', 'Black and tan dachshund', 'Salchicha negro y canela'], 'salsicha-caramelo': ['Salsicha caramelo', 'Red dachshund', 'Salchicha canela'],
  'salsicha-malhado': ['Salsicha malhado', 'Dapple dachshund', 'Salchicha moteado'], 'salsicha-dourado': ['Salsicha dourado', 'Golden dachshund', 'Salchicha dorado'],
  ursao: ['Ursão do coração', 'Big heart bear', 'Osote del corazón'], coelhona: ['Coelhona orelhuda', 'Floppy bunny', 'Conejota orejona'], dinossauro: ['Dinossauro', 'Dinosaur', 'Dinosaurio'],
  axolote: ['Axolote', 'Axolotl', 'Ajolote'], baleia: ['Baleia', 'Whale', 'Ballena'], gatao: ['Gatão', 'Big cat', 'Gatote'], cachorrao: ['Cachorrão', 'Big dog', 'Perrazo'],
  'ursao-dourado': ['Ursão dourado', 'Golden big bear', 'Osote dorado'],
  // festas (festas.js)
  'papai-noel': ['Papai Noel', 'Santa Claus', 'Papá Noel'], 'boneco-neve': ['Boneco de neve', 'Snowman', 'Muñeco de nieve'], rena: ['Rena', 'Reindeer', 'Reno'],
  presente: ['Presente', 'Gift', 'Regalo'], 'arvore-natal': ['Árvore de Natal', 'Christmas tree', 'Árbol de Navidad'], biscoito: ['Biscoito de gengibre', 'Gingerbread man', 'Galleta de jengibre'],
  'papai-noel-dourado': ['Papai Noel dourado', 'Golden Santa', 'Papá Noel dorado'],
  mascara: ['Máscara', 'Mask', 'Máscara'], pandeiro: ['Pandeiro', 'Tambourine', 'Pandereta'], palhaco: ['Palhacinho', 'Little clown', 'Payasito'], coroa: ['Coroa do Rei Momo', 'Carnival crown', 'Corona de carnaval'],
  arara: ['Arara', 'Macaw', 'Guacamayo'], chocalho: ['Chocalho', 'Maraca', 'Maraca'], 'mascara-dourada': ['Máscara dourada', 'Golden mask', 'Máscara dorada'],
  'coelho-pascoa': ['Coelho da Páscoa', 'Easter bunny', 'Conejo de Pascua'], 'ovo-pascoa': ['Ovo pintado', 'Painted egg', 'Huevo pintado'], 'ovo-chocolate': ['Ovo de chocolate', 'Chocolate egg', 'Huevo de chocolate'],
  'pintinho-casca': ['Pintinho na casca', 'Hatching chick', 'Pollito en el cascarón'], cenoura: ['Cenoura', 'Carrot', 'Zanahoria'], cesta: ['Cesta de ovos', 'Egg basket', 'Cesta de huevos'],
  'ovo-pascoa-dourado': ['Ovo dourado', 'Golden egg', 'Huevo dorado'],
  milho: ['Milho', 'Corn on the cob', 'Mazorca'], 'chapeu-palha': ['Chapéu de palha', 'Straw hat', 'Sombrero de paja'], fogueira: ['Fogueira', 'Bonfire', 'Hoguera'],
  pipoca: ['Pipoca', 'Popcorn', 'Palomitas'], sanfona: ['Sanfona', 'Accordion', 'Acordeón'], 'maca-do-amor': ['Maçã do amor', 'Candy apple', 'Manzana de caramelo'], 'milho-dourado': ['Milho dourado', 'Golden corn', 'Mazorca dorada'],
  piao: ['Pião', 'Spinning top', 'Peonza'], bola: ['Bola', 'Ball', 'Pelota'], ioio: ['Ioiô', 'Yo-yo', 'Yoyó'], carrinho: ['Carrinho', 'Toy car', 'Cochecito'],
  pirulito: ['Pirulito', 'Lollipop', 'Piruleta'], robo: ['Robô', 'Robot', 'Robot'], 'robo-dourado': ['Robô dourado', 'Golden robot', 'Robot dorado'],
  abobora: ['Abóbora', 'Pumpkin', 'Calabaza'], fantasma: ['Fantasminha', 'Little ghost', 'Fantasmita'], morcego: ['Morceguinho', 'Little bat', 'Murcielaguito'],
  'gato-preto': ['Gato preto', 'Black cat', 'Gato negro'], 'chapeu-bruxa': ['Chapéu de bruxa', 'Witch hat', 'Sombrero de bruja'], aranha: ['Aranhinha', 'Little spider', 'Arañita'],
  'abobora-dourada': ['Abóbora dourada', 'Golden pumpkin', 'Calabaza dorada']
};

/* ---------- peças básicas ---------- */
const GEO = {
  bola: new THREE.SphereGeometry(1, 22, 16), bolinha: new THREE.SphereGeometry(1, 10, 8),
  cil: new THREE.CylinderGeometry(1, 1, 1, 22), cone: new THREE.ConeGeometry(1, 1, 16), caixa: new THREE.BoxGeometry(1, 1, 1),
  toro: new THREE.TorusGeometry(1, 0.35, 10, 24), arco: new THREE.TorusGeometry(1, 0.3, 8, 16, Math.PI), capsula: new THREE.CapsuleGeometry(0.5, 1, 6, 14)
};
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _c = new THREE.Color();
const v3 = (e) => (typeof e === 'number' ? [e, e, e] : e);

class Kit {
  constructor() { this.partes = []; this.olhos = []; this.asas = []; }
  add(geo, cor, pos, esc, rot) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    _m.compose(_p.set(...(pos || [0, 0, 0])), _q.setFromEuler(_e.set(...(rot || [0, 0, 0]))), _s.set(...v3(esc == null ? 1 : esc)));
    g.applyMatrix4(_m);
    if (g.attributes.uv) g.deleteAttribute('uv');
    _c.set(cor);
    const n = g.attributes.position.count, cs = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { cs[i * 3] = _c.r; cs[i * 3 + 1] = _c.g; cs[i * 3 + 2] = _c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(cs, 3));
    this.partes.push(g);
    return this;
  }
  bola(cor, pos, esc, rot) { return this.add(GEO.bola, cor, pos, esc, rot); }
  bolinha(cor, pos, esc, rot) { return this.add(GEO.bolinha, cor, pos, esc, rot); }
  cil(cor, pos, esc, rot) { return this.add(GEO.cil, cor, pos, esc, rot); }
  cone(cor, pos, esc, rot) { return this.add(GEO.cone, cor, pos, esc, rot); }
  caixa(cor, pos, esc, rot) { return this.add(GEO.caixa, cor, pos, esc, rot); }
  toro(cor, pos, esc, rot) { return this.add(GEO.toro, cor, pos, esc, rot); }
  arco(cor, pos, esc, rot) { return this.add(GEO.arco, cor, pos, esc, rot); }
  capsula(cor, pos, esc, rot) { return this.add(GEO.capsula, cor, pos, esc, rot); }
  olho(pos, r) { this.olhos.push({ pos, r }); return this; }
  // pernas finas de inseto: de um ponto a outro
  vara(cor, a, b, grossura) {
    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), l = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    const e = new THREE.Euler().setFromQuaternion(q);
    return this.cil(cor, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], [grossura || 0.04, l, grossura || 0.04], [e.x, e.y, e.z]);
  }
  asa(cor, pivo, esc, lado, inclina) { this.asas.push({ cor, pivo, esc, lado, inclina: inclina || 0 }); return this; }
  geometria() { return juntar(this.partes); }
}
function juntar(lista) {
  let n = 0; lista.forEach((g) => { n += g.attributes.position.count; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), cor = new Float32Array(n * 3);
  let o = 0;
  lista.forEach((g) => { pos.set(g.attributes.position.array, o); nor.set(g.attributes.normal.array, o); cor.set(g.attributes.color.array, o); o += g.attributes.position.count * 3; });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(cor, 3));
  g.computeBoundingSphere();
  return g;
}

/* ---------- os tipos ---------- */
const MARROM = '#3a2418', PRETO = '#17141c', BRANCO = '#fbf8f2', ROSA = '#ff9fb8';
// etiqueta de pelúcia, como as das fotos
function etiqueta(k, x, y, z) { k.caixa('#ffffff', [x, y, z], [0.22, 0.3, 0.02], [0, 0.3, 0.4]).caixa('#e63946', [x, y - 0.03, z + 0.012], [0.16, 0.05, 0.01], [0, 0.3, 0.4]); }
function bochechas(k, y, z, l) { k.bolinha('#ff8fab', [-(l || 0.32), y, z], [0.1, 0.06, 0.04]).bolinha('#ff8fab', [l || 0.32, y, z], [0.1, 0.06, 0.04]); }
function sorriso(k, y, z, cor, l) { k.arco(cor || MARROM, [0, y + (l || 0.1) * 0.5, z], [l || 0.1, l || 0.1, 0.25], [0, 0, Math.PI]); }
// bicho de pelúcia comum: corpo, cabeça, barriga, bracinhos e pezinhos; as orelhas e o resto vêm de cada tipo
function bicho(k, c, op) {
  op = op || {};
  const cab = op.cab || 0.62, cy = 0.4;
  k.bola(c.corpo, [0, -0.32, 0], [0.7, 0.62, 0.62]);
  k.bola(c.barriga || c.corpo, [0, -0.36, 0.34], [0.46, 0.42, 0.34]);
  k.bola(c.corpo, [0, cy, 0.04], cab);
  k.bola(c.corpo, [-0.6, -0.2, 0.25], [0.2, 0.3, 0.2], [0, 0, 0.6]).bola(c.corpo, [0.6, -0.2, 0.25], [0.2, 0.3, 0.2], [0, 0, -0.6]);
  k.bola(c.pe || c.corpo, [-0.32, -0.82, 0.32], [0.22, 0.16, 0.26]).bola(c.pe || c.corpo, [0.32, -0.82, 0.32], [0.22, 0.16, 0.26]);
  k.olho([-0.22, cy + 0.1, cab * 0.92], 0.085).olho([0.22, cy + 0.1, cab * 0.92], 0.085);
  if (!op.semBoca) bochechas(k, cy - 0.06, cab * 0.86, 0.36);
  if (!op.semEtiqueta) etiqueta(k, 0.55, -0.55, 0.42);
  return cy;
}
function focinho(k, cor, cy, nariz) {
  k.bola(cor, [0, cy - 0.12, 0.55], [0.24, 0.17, 0.14]);
  k.bolinha(nariz || MARROM, [0, cy - 0.06, 0.68], [0.08, 0.06, 0.05]);
  sorriso(k, cy - 0.18, 0.66, MARROM, 0.05);
}

const TIPOS = {
  /* --- pelúcias (Cabine de Telefone) --- */
  urso(k) { const c = { corpo: '#b9804b', barriga: '#ecd0a8' }; const cy = bicho(k, c);
    k.bola(c.corpo, [-0.42, cy + 0.48, 0], 0.2).bola(c.corpo, [0.42, cy + 0.48, 0], 0.2).bola('#e9a98d', [-0.42, cy + 0.48, 0.1], [0.11, 0.11, 0.08]).bola('#e9a98d', [0.42, cy + 0.48, 0.1], [0.11, 0.11, 0.08]);
    focinho(k, '#ecd0a8', cy); },
  coelho(k) { const c = { corpo: '#f8bfd4', barriga: '#fff1f6' }; const cy = bicho(k, c);
    k.bola(c.corpo, [-0.2, cy + 0.85, -0.05], [0.13, 0.42, 0.1], [0, 0, 0.15]).bola(c.corpo, [0.2, cy + 0.85, -0.05], [0.13, 0.42, 0.1], [0, 0, -0.15]);
    k.bola('#ff8fb8', [-0.2, cy + 0.85, 0.03], [0.07, 0.32, 0.04], [0, 0, 0.15]).bola('#ff8fb8', [0.2, cy + 0.85, 0.03], [0.07, 0.32, 0.04], [0, 0, -0.15]);
    k.bolinha('#ff6f9f', [0, cy - 0.05, 0.62], [0.06, 0.05, 0.05]); sorriso(k, cy - 0.15, 0.6, MARROM, 0.05); },
  gato(k) { const c = { corpo: '#f6a74a', barriga: '#ffe3bd' }; const cy = bicho(k, c);
    k.cone(c.corpo, [-0.35, cy + 0.58, 0], [0.18, 0.32, 0.12], [0, 0, 0.3]).cone(c.corpo, [0.35, cy + 0.58, 0], [0.18, 0.32, 0.12], [0, 0, -0.3]);
    k.cone('#ffcf9b', [-0.34, cy + 0.56, 0.06], [0.1, 0.2, 0.05], [0, 0, 0.3]).cone('#ffcf9b', [0.34, cy + 0.56, 0.06], [0.1, 0.2, 0.05], [0, 0, -0.3]);
    for (const s of [-1, 1]) for (const a of [-0.12, 0.12]) k.cil('#5a3a28', [s * 0.42, cy - 0.12 + a * 0.4, 0.5], [0.012, 0.32, 0.012], [0, 0, Math.PI / 2 + a * s]);
    [-0.16, 0, 0.16].forEach((x) => k.caixa('#d9772a', [x, cy + 0.5, 0.36], [0.05, 0.16, 0.05]));
    k.bolinha('#ff8fab', [0, cy - 0.06, 0.62], [0.06, 0.04, 0.04]); sorriso(k, cy - 0.15, 0.6, MARROM, 0.05); },
  cachorro(k) { const c = { corpo: '#f0d6ab', barriga: '#fff6e6' }; const cy = bicho(k, c);
    k.bola('#a8774a', [-0.6, cy + 0.02, 0], [0.16, 0.36, 0.16], [0, 0, 0.3]).bola('#a8774a', [0.6, cy + 0.02, 0], [0.16, 0.36, 0.16], [0, 0, -0.3]);
    k.bola('#c9a074', [0.24, cy + 0.14, 0.5], [0.18, 0.16, 0.08]);
    focinho(k, '#fff6e6', cy, '#2b1d16'); },
  ovelha(k) { const c = { corpo: '#fbf8f2', barriga: '#fbf8f2', pe: '#5b4a42' }; const cy = bicho(k, c, { cab: 0.5 });
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; k.bola('#ffffff', [Math.cos(a) * 0.48, cy + 0.12 + Math.sin(a) * 0.42, -0.08], 0.22); }
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; k.bola('#ffffff', [Math.cos(a) * 0.55, -0.32 + Math.sin(a) * 0.45, 0.05], 0.24); }
    k.bola('#e9d6c2', [0, cy - 0.02, 0.32], [0.36, 0.34, 0.25]);
    k.bola('#5b4a42', [-0.5, cy + 0.15, 0.05], [0.2, 0.09, 0.12], [0, 0, -0.4]).bola('#5b4a42', [0.5, cy + 0.15, 0.05], [0.2, 0.09, 0.12], [0, 0, 0.4]);
    k.olhos.forEach((o) => { o.pos[2] = 0.53; o.pos[1] = cy + 0.04; });
    sorriso(k, cy - 0.14, 0.56, MARROM, 0.05); },
  pinguim(k) { const c = { corpo: '#2d3554', barriga: '#ffffff', pe: '#ff9a1f' }; const cy = bicho(k, c, { semBoca: false });
    k.bola('#ffffff', [0, cy - 0.02, 0.22], [0.48, 0.44, 0.42]);
    k.cone('#ff9a1f', [0, cy - 0.1, 0.66], [0.09, 0.2, 0.06], [Math.PI / 2, 0, 0]);
    k.bola(c.corpo, [-0.66, -0.25, 0.1], [0.12, 0.42, 0.22], [0, 0, 0.5]).bola(c.corpo, [0.66, -0.25, 0.1], [0.12, 0.42, 0.22], [0, 0, -0.5]); },
  unicornio(k) { const c = { corpo: '#fdf8ff', barriga: '#ffffff', pe: '#d9c7ff' }; const cy = bicho(k, c);
    k.cone('#ffd36b', [0, cy + 0.78, 0.18], [0.1, 0.42, 0.1], [0.25, 0, 0]);
    ['#ff8fb8', '#ffd166', '#7ef9ff', '#c6a4ff', '#9be37d'].forEach((cor, i) => k.bola(cor, [-0.28 + i * 0.12, cy + 0.5 - Math.abs(i - 2) * 0.06, -0.3], [0.14, 0.2, 0.14]));
    k.cone('#fdf8ff', [-0.38, cy + 0.55, 0], [0.12, 0.24, 0.1], [0, 0, 0.35]).cone('#fdf8ff', [0.38, cy + 0.55, 0], [0.12, 0.24, 0.1], [0, 0, -0.35]);
    k.bolinha('#ffc9de', [-0.08, cy - 0.12, 0.6], 0.04).bolinha('#ffc9de', [0.08, cy - 0.12, 0.6], 0.04); },
  sapo(k) { const c = { corpo: '#6cc04a', barriga: '#d9f5a8' }; const cy = bicho(k, c, { cab: 0.58 });
    k.bola(c.corpo, [-0.28, cy + 0.42, 0.2], 0.2).bola(c.corpo, [0.28, cy + 0.42, 0.2], 0.2);
    k.olhos.forEach((o, i) => { o.pos = [i ? 0.28 : -0.28, cy + 0.45, 0.37]; o.r = 0.1; });
    k.bola('#ffffff', [-0.28, cy + 0.45, 0.3], 0.14).bola('#ffffff', [0.28, cy + 0.45, 0.3], 0.14);
    sorriso(k, cy - 0.04, 0.56, '#2e5e1e', 0.2); },
  porquinho(k) { const c = { corpo: '#ffbfd0', barriga: '#ffe0e8' }; const cy = bicho(k, c);
    k.cone(c.corpo, [-0.36, cy + 0.55, 0.05], [0.15, 0.24, 0.1], [0.3, 0, 0.3]).cone(c.corpo, [0.36, cy + 0.55, 0.05], [0.15, 0.24, 0.1], [0.3, 0, -0.3]);
    k.cil('#ff9ab5', [0, cy - 0.1, 0.6], [0.2, 0.1, 0.14], [Math.PI / 2, 0, 0]);
    k.bolinha('#b34d6e', [-0.07, cy - 0.1, 0.66], 0.035).bolinha('#b34d6e', [0.07, cy - 0.1, 0.66], 0.035); },
  panda(k) { const c = { corpo: '#fbfbfb', barriga: '#ffffff', pe: '#1f1f24' }; const cy = bicho(k, c);
    k.bola('#1f1f24', [-0.42, cy + 0.48, 0], 0.2).bola('#1f1f24', [0.42, cy + 0.48, 0], 0.2);
    k.bola('#1f1f24', [-0.23, cy + 0.08, 0.5], [0.14, 0.17, 0.08], [0, 0, 0.5]).bola('#1f1f24', [0.23, cy + 0.08, 0.5], [0.14, 0.17, 0.08], [0, 0, -0.5]);
    k.bola('#1f1f24', [-0.6, -0.2, 0.25], [0.21, 0.31, 0.21], [0, 0, 0.6]).bola('#1f1f24', [0.6, -0.2, 0.25], [0.21, 0.31, 0.21], [0, 0, -0.6]);
    k.olhos.forEach((o) => { o.pos[2] = 0.6; o.r = 0.07; });
    focinho(k, '#ffffff', cy, '#1f1f24'); },
  pato(k) { const c = { corpo: '#ffd93b', barriga: '#fff3a6', pe: '#ff9a1f' }; const cy = bicho(k, c);
    k.bola('#ff9a1f', [0, cy - 0.1, 0.6], [0.26, 0.09, 0.2]);
    k.bola('#ffd93b', [0, cy + 0.6, 0], [0.08, 0.16, 0.08], [0, 0, 0.3]);
    k.bola('#c9a4ff', [0, -0.05, 0.1], [0.7, 0.1, 0.62]); },   // lencinho, como o patinho amarelo das fotos
  girafa(k) { const c = { corpo: '#ffd36b', barriga: '#fff0c4', pe: '#8a5a2b' }; const cy = bicho(k, c);
    [[-0.3, -0.1, 0.5], [0.35, -0.45, 0.48], [-0.4, -0.55, 0.38], [0.2, cy + 0.3, 0.48], [-0.35, cy + 0.2, 0.42], [0.5, -0.1, 0.3]].forEach((p) => k.bola('#b8742c', p, [0.13, 0.11, 0.06]));
    k.cil('#d9a441', [-0.18, cy + 0.6, 0], [0.04, 0.25, 0.04]).cil('#d9a441', [0.18, cy + 0.6, 0], [0.04, 0.25, 0.04]);
    k.bola('#8a5a2b', [-0.18, cy + 0.74, 0], 0.07).bola('#8a5a2b', [0.18, cy + 0.74, 0], 0.07);
    k.bola('#ffd36b', [-0.5, cy + 0.3, 0], [0.18, 0.08, 0.1], [0, 0, -0.4]).bola('#ffd36b', [0.5, cy + 0.3, 0], [0.18, 0.08, 0.1], [0, 0, 0.4]);
    focinho(k, '#ffe7a8', cy, '#8a5a2b'); },

  /* --- bichinhos que mexem (Neon) --- */
  dino(k) { const c = { corpo: '#57c99a', barriga: '#fff1a8' }; const cy = bicho(k, c, { semEtiqueta: true });
    for (let i = 0; i < 6; i++) { const a = -0.3 + i * 0.32; k.cone('#ff9f43', [0, cy + 0.55 - i * 0.25, -0.4 - Math.sin(a) * 0.1], [0.12, 0.22, 0.12], [-0.6 - i * 0.25, 0, 0]); }
    k.bola(c.corpo, [0, -0.6, -0.6], [0.22, 0.2, 0.42], [0.4, 0, 0]);
    [[-0.2, -0.2, 0.55], [0.25, -0.5, 0.5], [0.3, cy + 0.25, 0.5]].forEach((p) => k.bola('#3a9c80', p, [0.08, 0.08, 0.04]));
    sorriso(k, cy - 0.15, 0.6, '#1f4a3c', 0.12); },
  polvo(k) { k.bola('#a77de0', [0, 0.2, 0], [0.72, 0.78, 0.7]).bola('#c9aaf2', [0, 0.45, 0.4], [0.3, 0.2, 0.2]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; k.bola('#a77de0', [Math.cos(a) * 0.55, -0.55, Math.sin(a) * 0.55], [0.18, 0.32, 0.18], [Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5]); }
    k.olho([-0.25, 0.25, 0.64], 0.12).olho([0.25, 0.25, 0.64], 0.12); bochechas(k, 0.08, 0.62, 0.42); sorriso(k, 0.0, 0.68, MARROM, 0.07); },
  pintinho(k) { k.bola('#ffd93b', [0, -0.15, 0], [0.8, 0.78, 0.76]).bola('#fff3a6', [0, -0.3, 0.45], [0.42, 0.38, 0.3]);
    k.cone('#ff9a1f', [0, 0.02, 0.8], [0.12, 0.2, 0.1], [Math.PI / 2, 0, 0]);
    k.bola('#ffc61a', [-0.05, 0.68, 0], [0.08, 0.18, 0.06], [0, 0, 0.3]).bola('#ffc61a', [0.1, 0.66, 0], [0.07, 0.16, 0.06], [0, 0, -0.4]);
    k.bola('#ffc61a', [-0.78, -0.15, 0.05], [0.12, 0.32, 0.2], [0, 0, 0.5]).bola('#ffc61a', [0.78, -0.15, 0.05], [0.12, 0.32, 0.2], [0, 0, -0.5]);
    k.bola('#ff9a1f', [-0.25, -0.9, 0.3], [0.16, 0.06, 0.2]).bola('#ff9a1f', [0.25, -0.9, 0.3], [0.16, 0.06, 0.2]);
    k.olho([-0.25, 0.2, 0.68], 0.09).olho([0.25, 0.2, 0.68], 0.09); bochechas(k, 0.05, 0.7, 0.42); },
  macaco(k) { const c = { corpo: '#8a5a3b', barriga: '#e8c49a' }; const cy = bicho(k, c, { semEtiqueta: true });
    k.bola('#e8c49a', [0, cy - 0.02, 0.3], [0.42, 0.4, 0.35]);
    k.bola(c.corpo, [-0.66, cy + 0.05, 0], 0.2).bola(c.corpo, [0.66, cy + 0.05, 0], 0.2).bola('#e8c49a', [-0.68, cy + 0.05, 0.08], 0.12).bola('#e8c49a', [0.68, cy + 0.05, 0.08], 0.12);
    focinho(k, '#f2d8b6', cy, MARROM); },
  raposa(k) { const c = { corpo: '#ff8a3d', barriga: '#ffffff', pe: '#3a2418' }; const cy = bicho(k, c, { semEtiqueta: true });
    k.cone(c.corpo, [-0.36, cy + 0.62, 0], [0.18, 0.36, 0.12], [0, 0, 0.3]).cone(c.corpo, [0.36, cy + 0.62, 0], [0.18, 0.36, 0.12], [0, 0, -0.3]);
    k.cone(PRETO, [-0.4, cy + 0.74, 0.02], [0.08, 0.14, 0.08], [0, 0, 0.3]).cone(PRETO, [0.4, cy + 0.74, 0.02], [0.08, 0.14, 0.08], [0, 0, -0.3]);
    k.bola('#ffffff', [0, cy - 0.15, 0.4], [0.32, 0.22, 0.28]);
    k.bola(c.corpo, [0.55, -0.55, -0.45], [0.25, 0.25, 0.55], [0.5, 0.6, 0]).bola('#ffffff', [0.72, -0.4, -0.78], [0.15, 0.15, 0.2], [0.5, 0.6, 0]);
    k.bolinha(PRETO, [0, cy - 0.08, 0.68], 0.06); },
  hamster(k) { const c = { corpo: '#e9b97c', barriga: '#fff3df' }; const cy = bicho(k, c, { cab: 0.66, semEtiqueta: true });
    k.bola(c.corpo, [-0.4, cy + 0.5, 0], 0.15).bola(c.corpo, [0.4, cy + 0.5, 0], 0.15).bola('#ff9fb8', [-0.4, cy + 0.5, 0.06], 0.08).bola('#ff9fb8', [0.4, cy + 0.5, 0.06], 0.08);
    k.bola('#fff3df', [-0.32, cy - 0.15, 0.42], 0.22).bola('#fff3df', [0.32, cy - 0.15, 0.42], 0.22);
    k.bolinha('#ff6f9f', [0, cy - 0.05, 0.68], 0.05); },
  coruja(k) { k.bola('#8a6044', [0, -0.12, 0], [0.8, 0.85, 0.7]).bola('#e9d2b0', [0, -0.3, 0.42], [0.5, 0.5, 0.3]);
    k.bola('#ffffff', [-0.28, 0.25, 0.48], 0.22).bola('#ffffff', [0.28, 0.25, 0.48], 0.22);
    k.olho([-0.28, 0.25, 0.64], 0.12).olho([0.28, 0.25, 0.64], 0.12);
    k.cone('#ffb02e', [0, 0.06, 0.66], [0.08, 0.16, 0.06], [-Math.PI / 2 + Math.PI, 0, 0]);
    k.cone('#8a6044', [-0.42, 0.72, 0], [0.14, 0.28, 0.1], [0, 0, 0.4]).cone('#8a6044', [0.42, 0.72, 0], [0.14, 0.28, 0.1], [0, 0, -0.4]);
    k.bola('#6e4a33', [-0.74, -0.15, 0], [0.16, 0.5, 0.36], [0, 0, 0.3]).bola('#6e4a33', [0.74, -0.15, 0], [0.16, 0.5, 0.36], [0, 0, -0.3]);
    for (let i = 0; i < 6; i++) k.bola('#c9a47e', [-0.25 + (i % 3) * 0.25, -0.25 - Math.floor(i / 3) * 0.2, 0.68], [0.08, 0.05, 0.03]); },
  tartaruga(k) { k.bola('#4fa36b', [0, 0, -0.05], [0.85, 0.55, 0.8]).bola('#e8d58f', [0, -0.42, 0], [0.82, 0.18, 0.78]);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; k.bola('#3b7f52', [Math.cos(a) * 0.45, 0.32, Math.sin(a) * 0.4], [0.2, 0.08, 0.2]); }
    k.bola('#3b7f52', [0, 0.47, 0], [0.24, 0.08, 0.24]);
    k.bola('#8fd19e', [0, 0.05, 0.85], 0.32);
    [[-0.6, -0.4, 0.45], [0.6, -0.4, 0.45], [-0.6, -0.4, -0.45], [0.6, -0.4, -0.45]].forEach((p) => k.bola('#8fd19e', p, [0.2, 0.14, 0.2]));
    k.olho([-0.13, 0.15, 1.1], 0.07).olho([0.13, 0.15, 1.1], 0.07); sorriso(k, -0.05, 1.12, '#1f4a3c', 0.06); },

  /* --- insetos (Estrelas) --- */
  joaninha(k) { k.bola('#e63946', [0, 0, -0.08], [0.85, 0.6, 0.85]);
    const casca = (x, z) => 0.6 * Math.sqrt(Math.max(0, 1 - (x / 0.85) ** 2 - ((z + 0.08) / 0.85) ** 2));   // altura da casca
    for (let i = 0; i < 9; i++) { const z = -0.85 + i * 0.19; k.bolinha(PRETO, [0, casca(0, z) - 0.01, z], [0.03, 0.03, 0.12]); }
    [[-0.4, 0.15], [0.4, 0.15], [-0.45, -0.4], [0.45, -0.4], [-0.2, -0.2], [0.2, -0.2]].forEach(([x, z]) => k.bola(PRETO, [x, casca(x, z) - 0.03, z], [0.15, 0.06, 0.15]));
    k.bola(PRETO, [0, 0, 0.72], 0.4); pernas(k, PRETO, -0.35); antenas(k, PRETO, 0.25, 0.95);
    k.olho([-0.17, 0.12, 1.06], 0.09).olho([0.17, 0.12, 1.06], 0.09); },
  abelha(k) { k.bola('#ffcf2e', [0, 0, -0.1], [0.62, 0.62, 0.85]);
    [-0.4, 0, 0.35].forEach((z) => k.cil(PRETO, [0, 0, z - 0.1], [0.63, 0.12, 0.63], [Math.PI / 2, 0, 0]));
    k.bola('#ffcf2e', [0, 0.05, 0.75], 0.42); k.cone(PRETO, [0, -0.05, -0.98], [0.1, 0.22, 0.1], [-Math.PI / 2, 0, 0]);
    pernas(k, PRETO, -0.35); antenas(k, PRETO, 0.35, 1.0);
    k.olho([-0.17, 0.15, 1.1], 0.09).olho([0.17, 0.15, 1.1], 0.09); bochechas(k, 0.0, 1.08, 0.26);
    k.asa('#e8f7ff', [0.15, 0.5, 0], [0.55, 0.05, 0.35], 1, 0.3).asa('#e8f7ff', [-0.15, 0.5, 0], [0.55, 0.05, 0.35], -1, 0.3); },
  borboleta(k) { k.capsula('#4a2c6e', [0, 0, 0], [0.24, 0.9, 0.24], [Math.PI / 2, 0, 0]).bola('#4a2c6e', [0, 0.05, 0.78], 0.3);
    antenas(k, '#4a2c6e', 0.25, 0.95); k.olho([-0.13, 0.12, 1.02], 0.08).olho([0.13, 0.12, 1.02], 0.08);
    k.asa('#ff7ab8', [0.12, 0.08, 0.2], [0.85, 0.04, 0.7], 1, 0).asa('#ff7ab8', [-0.12, 0.08, 0.2], [0.85, 0.04, 0.7], -1, 0);
    k.asa('#ffd166', [0.12, 0.05, -0.35], [0.6, 0.04, 0.5], 1, 0).asa('#ffd166', [-0.12, 0.05, -0.35], [0.6, 0.04, 0.5], -1, 0); },
  besouro(k) { k.bola('#2f8f8a', [0, 0, -0.1], [0.75, 0.55, 0.9]).caixa('#174f4c', [0, 0.18, -0.1], [0.03, 0.45, 1.7]);
    k.bola('#3fd1c2', [-0.3, 0.38, -0.2], [0.18, 0.08, 0.3]).bola('#3fd1c2', [0.3, 0.38, -0.2], [0.18, 0.08, 0.3]);
    k.bola('#174f4c', [0, 0, 0.78], 0.36); k.cone('#174f4c', [0, 0.45, 0.9], [0.08, 0.5, 0.08], [0.6, 0, 0]);
    pernas(k, '#174f4c', -0.3); k.olho([-0.16, 0.1, 1.08], 0.08).olho([0.16, 0.1, 1.08], 0.08); },
  lagarta(k) { const cores = ['#7bd65a', '#a6e36b', '#7bd65a', '#a6e36b', '#7bd65a'];
    cores.forEach((c, i) => { k.bola(c, [0, -0.3 + Math.sin(i * 1.1) * 0.12, -0.85 + i * 0.36], 0.32); k.bola('#ffd166', [0, -0.05 + Math.sin(i * 1.1) * 0.12, -0.85 + i * 0.36], [0.08, 0.06, 0.08]); });
    k.bola('#7bd65a', [0, 0.05, 0.85], 0.42); antenas(k, '#3a7d2a', 0.3, 1.0);
    for (let i = 0; i < 5; i++) { k.bola('#3a7d2a', [-0.24, -0.62, -0.85 + i * 0.36], 0.07).bola('#3a7d2a', [0.24, -0.62, -0.85 + i * 0.36], 0.07); }
    k.olho([-0.16, 0.18, 1.2], 0.09).olho([0.16, 0.18, 1.2], 0.09); bochechas(k, 0.0, 1.2, 0.26); sorriso(k, -0.08, 1.24, '#2e5e1e', 0.06); },
  libelula(k) { k.capsula('#3aa0ff', [0, 0, -0.3], [0.16, 1.2, 0.16], [Math.PI / 2, 0, 0]).bola('#3aa0ff', [0, 0, 0.55], [0.26, 0.24, 0.3]).bola('#1f6fd1', [0, 0.05, 0.9], 0.3);
    k.olho([-0.17, 0.15, 1.08], 0.12).olho([0.17, 0.15, 1.08], 0.12); pernas(k, '#1f4f9c', 0.5);
    k.asa('#dff5ff', [0.1, 0.12, 0.6], [0.95, 0.03, 0.22], 1, 0.15).asa('#dff5ff', [-0.1, 0.12, 0.6], [0.95, 0.03, 0.22], -1, 0.15);
    k.asa('#dff5ff', [0.1, 0.1, 0.35], [0.85, 0.03, 0.2], 1, -0.15).asa('#dff5ff', [-0.1, 0.1, 0.35], [0.85, 0.03, 0.2], -1, -0.15); },
  formiga(k) { k.bola('#c0392b', [0, -0.05, -0.55], [0.42, 0.38, 0.5]).bola('#c0392b', [0, -0.05, 0.05], 0.26).bola('#c0392b', [0, 0.05, 0.6], 0.38);
    pernas(k, '#5a1a12', 0.05); antenas(k, '#5a1a12', 0.3, 0.85);
    k.olho([-0.16, 0.15, 0.9], 0.09).olho([0.16, 0.15, 0.9], 0.09); sorriso(k, -0.05, 0.94, PRETO, 0.06); },
  vagalume(k) { k.bola('#3b3355', [0, 0.05, 0.2], [0.5, 0.45, 0.6]).bola('#fff27a', [0, -0.05, -0.55], [0.48, 0.42, 0.5]);
    k.bola('#3b3355', [0, 0.1, 0.78], 0.32); antenas(k, '#3b3355', 0.3, 0.95); pernas(k, '#3b3355', 0.15);
    k.olho([-0.14, 0.18, 1.05], 0.08).olho([0.14, 0.18, 1.05], 0.08);
    k.asa('#cfe0ff', [0.12, 0.42, 0.2], [0.55, 0.03, 0.3], 1, 0.4).asa('#cfe0ff', [-0.12, 0.42, 0.2], [0.55, 0.03, 0.3], -1, 0.4); },

  /* --- lanches (Lanchonete) --- */
  'x-burguer': (k) => burguer(k, ['queijo']),
  'x-salada': (k) => burguer(k, ['alface', 'tomate', 'queijo']),
  'x-bacon': (k) => burguer(k, ['bacon', 'queijo']),
  duplo: (k) => burguer(k, ['queijo', 'carne', 'queijo']),
  'x-frango': (k) => burguer(k, ['alface', 'queijo'], '#e0a24a'),
  vegano: (k) => burguer(k, ['alface', 'tomate'], '#5fa84a'),
  'x-tudo': (k) => burguer(k, ['alface', 'tomate', 'ovo', 'bacon', 'queijo']),
  'cachorro-quente'(k) {
    k.capsula('#e8b46a', [0, -0.2, 0], [0.62, 1.1, 0.5], [0, 0, Math.PI / 2]).capsula('#c0492b', [0, 0.05, 0], [0.32, 1.45, 0.32], [0, 0, Math.PI / 2]);
    for (let i = 0; i < 7; i++) k.bola('#ffcf2e', [-0.65 + i * 0.22, 0.24 + Math.sin(i * 1.6) * 0.03, 0], [0.12, 0.05, 0.08]);
    k.olho([-0.2, 0.0, 0.42], 0.08).olho([0.2, 0.0, 0.42], 0.08); sorriso(k, -0.17, 0.44, MARROM, 0.07); },
  batata(k) {
    k.cil('#e63946', [0, -0.25, 0], [0.62, 1.0, 0.45]).cil('#ffffff', [0, -0.15, 0.08], [0.6, 0.18, 0.4]);
    for (let i = 0; i < 11; i++) { const x = -0.45 + (i % 6) * 0.18, z = -0.15 + Math.floor(i / 6) * 0.3; k.caixa('#ffd34d', [x, 0.42 + (i % 3) * 0.08, z], [0.1, 0.75, 0.1], [0, 0, (i % 4 - 1.5) * 0.12]); }
    k.olho([-0.2, -0.2, 0.46], 0.09).olho([0.2, -0.2, 0.46], 0.09); bochechas(k, -0.35, 0.46, 0.33); sorriso(k, -0.4, 0.47, '#ffffff', 0.07); },
  'milk-shake'(k) {
    k.cil('#ffb6d2', [0, -0.3, 0], [0.5, 1.0, 0.5]).cil('#ffffff', [0, 0.25, 0], [0.56, 0.12, 0.56]);
    k.bola('#fff4f8', [0, 0.38, 0], [0.5, 0.3, 0.5]).bola('#fff4f8', [0, 0.6, 0], [0.32, 0.22, 0.32]).bola('#e63946', [0, 0.82, 0], 0.12);
    k.cil('#7ef9ff', [0.18, 0.75, -0.1], [0.05, 0.9, 0.05], [0, 0, -0.35]);
    k.olho([-0.18, -0.15, 0.5], 0.08).olho([0.18, -0.15, 0.5], 0.08); sorriso(k, -0.32, 0.51, MARROM, 0.06); }
};
function pernas(k, cor, z0) {
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const z = z0 + (i - 1) * 0.35;
    k.vara(cor, [s * 0.35, -0.2, z], [s * 0.75, -0.45, z + (i - 1) * 0.12], 0.035).vara(cor, [s * 0.75, -0.45, z + (i - 1) * 0.12], [s * 0.85, -0.75, z + (i - 1) * 0.18], 0.03);
  }
}
function antenas(k, cor, x, z) {
  for (const s of [-1, 1]) { k.vara(cor, [s * 0.1, 0.35, z - 0.15], [s * x, 0.85, z + 0.05], 0.03); k.bola(cor, [s * x, 0.87, z + 0.05], 0.07); }
}
function burguer(k, recheio, carne) {
  let y = -0.62;
  k.cil('#e8a556', [0, y, 0], [0.82, 0.24, 0.82]); y += 0.16;
  k.cil(carne || '#6b3a22', [0, y, 0], [0.86, 0.2, 0.86]); y += 0.12;
  recheio.forEach((r) => {
    if (r === 'queijo') { k.caixa('#ffc928', [0, y, 0], [1.25, 0.05, 1.25], [0, Math.PI / 4, 0]); y += 0.06; }
    else if (r === 'alface') { for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; k.bola('#7ed957', [Math.cos(a) * 0.82, y, Math.sin(a) * 0.82], [0.2, 0.06, 0.16], [0, -a, 0]); } k.cil('#7ed957', [0, y, 0], [0.85, 0.05, 0.85]); y += 0.07; }
    else if (r === 'tomate') { k.cil('#e63946', [-0.25, y, 0.1], [0.42, 0.07, 0.42]).cil('#e63946', [0.3, y, -0.1], [0.42, 0.07, 0.42]); y += 0.08; }
    else if (r === 'bacon') { k.caixa('#c0503a', [0, y, 0.2], [1.6, 0.04, 0.22], [0, 0.3, 0]).caixa('#c0503a', [0, y + 0.02, -0.2], [1.6, 0.04, 0.22], [0, -0.3, 0]); y += 0.06; }
    else if (r === 'ovo') { k.cil('#ffffff', [0, y, 0], [0.8, 0.05, 0.75]).bola('#ffb300', [0.1, y + 0.03, 0.1], [0.25, 0.08, 0.25]); y += 0.07; }
    else if (r === 'carne') { k.cil(carne || '#6b3a22', [0, y + 0.06, 0], [0.86, 0.2, 0.86]); y += 0.18; }
  });
  k.bola('#f0a94e', [0, y + 0.02, 0], [0.86, 0.55, 0.86]);   // pão de cima, com gergelim
  for (let i = 0; i < 14; i++) { const a = i * 2.4, rr = 0.25 + (i % 4) * 0.13; k.bolinha('#fff4d6', [Math.cos(a) * rr, y + 0.02 + Math.sqrt(Math.max(0, 1 - (rr / 0.86) ** 2)) * 0.53, Math.sin(a) * rr], [0.05, 0.025, 0.03], [0, a, 0]); }
  k.olho([-0.24, y + 0.22, 0.75], 0.085).olho([0.24, y + 0.22, 0.75], 0.085); bochechas(k, y + 0.08, 0.8, 0.42); sorriso(k, y + 0.06, 0.83, '#5a2a12', 0.07);
}

/* ---------- gigantes (cabine grande): pelúcias enormes, desenho próprio ---------- */
Object.assign(TIPOS, {
  ursao(k) { const c = { corpo: '#f7e8ee', barriga: '#ffffff', pe: '#f3c6d6' }; const cy = bicho(k, c);
    k.bola(c.corpo, [-0.42, cy + 0.48, 0], 0.2).bola(c.corpo, [0.42, cy + 0.48, 0], 0.2).bola('#ffb3c7', [-0.42, cy + 0.48, 0.1], [0.11, 0.11, 0.08]).bola('#ffb3c7', [0.42, cy + 0.48, 0.1], [0.11, 0.11, 0.08]);
    focinho(k, '#ffffff', cy, '#ff8fab');
    k.bola('#e63946', [-0.11, -0.22, 0.64], [0.15, 0.15, 0.1]).bola('#e63946', [0.11, -0.22, 0.64], [0.15, 0.15, 0.1]).cone('#e63946', [0, -0.4, 0.64], [0.21, 0.24, 0.1], [Math.PI, 0, 0]);
    k.bola('#ff7a8a', [-0.1, -0.18, 0.72], [0.04, 0.03, 0.02]); },
  coelhona(k) { const c = { corpo: '#c9b6f2', barriga: '#f4eeff', pe: '#b39ce8' }; const cy = bicho(k, c);
    for (const s of [-1, 1]) { k.bola(c.corpo, [s * 0.52, cy - 0.05, -0.05], [0.15, 0.48, 0.11], [0, 0, s * 0.25]).bola('#ffc4dc', [s * 0.54, cy - 0.05, 0.03], [0.08, 0.38, 0.05], [0, 0, s * 0.25]); }
    k.bolinha('#ff6f9f', [0, cy - 0.05, 0.62], [0.06, 0.05, 0.05]); sorriso(k, cy - 0.15, 0.6, MARROM, 0.05); },
  dinossauro(k) { const c = { corpo: '#ff9a3c', barriga: '#fff1c4' }; const cy = bicho(k, c);
    for (let i = 0; i < 6; i++) k.cone('#fff1c4', [0, cy + 0.55 - i * 0.25, -0.4], [0.12, 0.22, 0.12], [-0.6 - i * 0.25, 0, 0]);
    k.bola(c.corpo, [0, -0.6, -0.6], [0.22, 0.2, 0.42], [0.4, 0, 0]);
    sorriso(k, cy - 0.15, 0.6, '#7a3a12', 0.12); },
  axolote(k) { const c = { corpo: '#ffb3c7', barriga: '#ffd9e3' }; const cy = bicho(k, c, { cab: 0.66 });
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) k.bola('#ff6f9f', [s * (0.62 - i * 0.04), cy + 0.05 + i * 0.2, -0.05], [0.08, 0.24, 0.07], [0, 0, s * (1.2 - i * 0.45)]);
    k.bola(c.corpo, [0, -0.62, -0.62], [0.12, 0.3, 0.42], [0.5, 0, 0]);
    sorriso(k, cy - 0.12, 0.64, '#b34d6e', 0.16); },
  baleia(k) {
    k.bola('#5aa9e6', [0, -0.1, 0], [0.85, 0.62, 0.8]).bola('#e8f4ff', [0, -0.42, 0.25], [0.66, 0.28, 0.52]);
    for (const s of [-1, 1]) { k.bola('#5aa9e6', [s * 0.28, 0.18, -0.85], [0.3, 0.08, 0.18], [0, 0, s * 0.4]); k.bola('#4a90d0', [s * 0.82, -0.32, 0.2], [0.24, 0.07, 0.15], [0, 0.3 * s, -s * 0.5]); }
    k.cil('#a6e3ff', [0, 0.62, 0.1], [0.05, 0.25, 0.05]); [[-0.12, 0.82], [0.12, 0.82], [0, 0.9]].forEach(([x, y]) => k.bolinha('#a6e3ff', [x, y, 0.1], 0.08));
    k.olho([-0.35, 0.02, 0.66], 0.085).olho([0.35, 0.02, 0.66], 0.085); bochechas(k, -0.12, 0.7, 0.45); sorriso(k, -0.15, 0.78, '#1f4f7a', 0.1); },
  gatao(k) { const c = { corpo: '#9aa3b0', barriga: '#e4e8ee' }; const cy = bicho(k, c, { cab: 0.66 });
    k.cone(c.corpo, [-0.37, cy + 0.6, 0], [0.18, 0.3, 0.12], [0, 0, 0.3]).cone(c.corpo, [0.37, cy + 0.6, 0], [0.18, 0.3, 0.12], [0, 0, -0.3]);
    k.cone('#ffcfdd', [-0.36, cy + 0.58, 0.06], [0.1, 0.18, 0.05], [0, 0, 0.3]).cone('#ffcfdd', [0.36, cy + 0.58, 0.06], [0.1, 0.18, 0.05], [0, 0, -0.3]);
    [-0.16, 0, 0.16].forEach((x) => k.caixa('#6e7684', [x, cy + 0.54, 0.38], [0.05, 0.16, 0.05]));
    for (const s of [-1, 1]) for (const a of [-0.12, 0.12]) k.cil('#4a4f58', [s * 0.44, cy - 0.12 + a * 0.4, 0.52], [0.012, 0.32, 0.012], [0, 0, Math.PI / 2 + a * s]);
    k.bolinha('#ff8fab', [0, cy - 0.06, 0.66], [0.06, 0.04, 0.04]); sorriso(k, cy - 0.15, 0.64, MARROM, 0.05); },
  cachorrao(k) { const c = { corpo: '#c48a52', barriga: '#f2dcc0' }; const cy = bicho(k, c);
    k.bola('#7a4f2b', [-0.6, cy - 0.05, 0], [0.17, 0.42, 0.17], [0, 0, 0.2]).bola('#7a4f2b', [0.6, cy - 0.05, 0], [0.17, 0.42, 0.17], [0, 0, -0.2]);
    focinho(k, '#f2dcc0', cy, '#2b1d16'); k.bola('#ff8fab', [0, cy - 0.26, 0.6], [0.07, 0.09, 0.03]); }
});

/* ---------- prêmios das festas (festas.js): Natal, Carnaval, Páscoa, Festa Junina, Dia das Crianças, Dia das Bruxas ----------
   Todos de pelúcia, com carinha, desenho próprio (nenhum personagem de marca). */
const OURO = '#ffcc33';
// olho em fundo escuro: uma bolinha clara atrás, para o olho aparecer
function olhoClaro(k, pos, r, cor) { k.bola(cor || '#ffffff', [pos[0], pos[1], pos[2] - r * 0.9], r * 1.45); return k.olho(pos, r); }
// fitinhas em volta de um ovo/bola (raio rx, meia altura ry, centro cy): um anel na altura y
function anel(k, cor, cy, rx, ry, y, alto) { const r = rx * Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2)); k.cil(cor, [0, y, 0], [r + 0.012, alto || 0.07, r + 0.012]); }
// um pedacinho achatado colado na superfície de uma bola (direção d), para manchas e gomos
function remendo(k, cor, d, raio, tam) {
  const v = new THREE.Vector3(...d).normalize(), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), v), e = new THREE.Euler().setFromQuaternion(q);
  k.bola(cor, [v.x * raio, v.y * raio, v.z * raio], [tam, tam, tam * 0.3], [e.x, e.y, e.z]);
}
Object.assign(TIPOS, {
  /* --- Natal --- */
  'papai-noel'(k) {
    k.bola('#d62839', [0, -0.35, 0], [0.72, 0.62, 0.62]).cil(PRETO, [0, -0.3, 0], [0.73, 0.13, 0.63]).caixa(OURO, [0, -0.3, 0.63], [0.22, 0.17, 0.04]);
    k.bola('#d62839', [-0.62, -0.2, 0.2], [0.2, 0.32, 0.2], [0, 0, 0.6]).bola('#d62839', [0.62, -0.2, 0.2], [0.2, 0.32, 0.2], [0, 0, -0.6]);
    k.bola(BRANCO, [-0.76, -0.42, 0.28], 0.13).bola(BRANCO, [0.76, -0.42, 0.28], 0.13);
    k.bola(PRETO, [-0.3, -0.86, 0.3], [0.22, 0.15, 0.28]).bola(PRETO, [0.3, -0.86, 0.3], [0.22, 0.15, 0.28]);
    k.bola('#f6cfb0', [0, 0.38, 0.05], 0.46);
    k.bola(BRANCO, [0, 0.14, 0.3], [0.46, 0.36, 0.3]).bola(BRANCO, [-0.13, 0.3, 0.46], [0.16, 0.08, 0.08], [0, 0, 0.3]).bola(BRANCO, [0.13, 0.3, 0.46], [0.16, 0.08, 0.08], [0, 0, -0.3]);
    k.bolinha('#ff8f8f', [0, 0.38, 0.5], 0.08);
    k.olho([-0.16, 0.5, 0.41], 0.065).olho([0.16, 0.5, 0.41], 0.065); bochechas(k, 0.36, 0.42, 0.27);
    k.cil(BRANCO, [0, 0.7, 0], [0.48, 0.14, 0.48]).cone('#d62839', [0, 0.98, -0.06], [0.42, 0.5, 0.42], [-0.35, 0, 0]).bola(BRANCO, [0, 1.15, -0.24], 0.12); },
  'boneco-neve'(k) {
    k.bola(BRANCO, [0, -0.45, 0], 0.58).bola(BRANCO, [0, 0.25, 0], 0.44);
    k.toro('#e63946', [0, -0.04, 0], [0.4, 0.4, 0.55], [Math.PI / 2, 0, 0]).caixa('#e63946', [0.24, -0.26, 0.4], [0.14, 0.36, 0.06], [0, 0, 0.2]);
    k.cone('#ff8a1f', [0, 0.24, 0.55], [0.07, 0.3, 0.07], [Math.PI / 2, 0, 0]);
    k.olho([-0.15, 0.37, 0.39], 0.06).olho([0.15, 0.37, 0.39], 0.06); sorriso(k, 0.08, 0.42, PRETO, 0.08); bochechas(k, 0.2, 0.39, 0.25);
    [-0.28, -0.5].forEach((y) => k.bolinha(PRETO, [0, y, 0.56], 0.06));
    k.cil(PRETO, [0, 0.66, 0], [0.44, 0.06, 0.44]).cil(PRETO, [0, 0.86, 0], [0.29, 0.38, 0.29]).cil('#e63946', [0, 0.73, 0], [0.3, 0.07, 0.3]);
    k.vara('#7a4a2b', [-0.38, 0.12, 0], [-0.86, 0.45, 0], 0.04).vara('#7a4a2b', [0.38, 0.12, 0], [0.86, 0.45, 0], 0.04); },
  rena(k) { const c = { corpo: '#9a6235', barriga: '#e8c49a', pe: '#4a2c1a' }; const cy = bicho(k, c);
    for (const s of [-1, 1]) {
      k.vara('#6b4a2b', [s * 0.22, cy + 0.48, 0], [s * 0.42, cy + 0.78, -0.05], 0.045).vara('#6b4a2b', [s * 0.33, cy + 0.64, -0.02], [s * 0.18, cy + 0.82, 0], 0.035).vara('#6b4a2b', [s * 0.4, cy + 0.74, -0.04], [s * 0.6, cy + 0.84, -0.04], 0.035);
      k.bola(c.corpo, [s * 0.56, cy + 0.28, 0], [0.18, 0.08, 0.1], [0, 0, -s * 0.4]);
    }
    focinho(k, '#e8c49a', cy, '#e63946'); k.bola('#e63946', [0, cy - 0.06, 0.7], 0.1); },
  presente(k) {
    k.caixa('#e63946', [0, -0.2, 0], [1.15, 1.0, 1.15]).caixa(OURO, [0, -0.2, 0], [0.2, 1.02, 1.17]).caixa(OURO, [0, -0.2, 0], [1.17, 1.02, 0.2]);
    k.toro(OURO, [-0.2, 0.42, 0], [0.22, 0.22, 0.3], [0, 0, 0.6]).toro(OURO, [0.2, 0.42, 0], [0.22, 0.22, 0.3], [0, 0, -0.6]).bola(OURO, [0, 0.33, 0], 0.1);
    k.olho([-0.3, -0.05, 0.6], 0.09).olho([0.3, -0.05, 0.6], 0.09); bochechas(k, -0.2, 0.59, 0.36); sorriso(k, -0.32, 0.6, MARROM, 0.08); },
  'arvore-natal'(k) {
    k.cil('#7a4a2b', [0, -0.82, 0], [0.18, 0.3, 0.18]);
    [[-0.45, 0.55, 0.75], [0, 0.55, 0.6], [0.45, 0.5, 0.42]].forEach(([c, h, R], i) => {
      k.cone('#2e9e4f', [0, c, 0], [R, h, R]);
      for (let j = 0; j < 5 - i; j++) { const a = j / (5 - i) * Math.PI * 2 + i, y = c - h * 0.3, r = R * 0.8 + 0.02; k.bolinha(['#e63946', OURO, '#3aa0ff', '#ff7ab8'][(i + j) % 4], [Math.cos(a) * r, y, Math.sin(a) * r], 0.08); }
    });
    k.bola(OURO, [0, 0.78, 0], [0.16, 0.16, 0.07]);
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; k.cone(OURO, [Math.cos(a) * -0.14, 0.78 - Math.sin(a) * 0.14, 0], [0.07, 0.14, 0.05], [0, 0, a + Math.PI / 2]); }
    k.olho([-0.12, 0.02, 0.33], 0.07).olho([0.12, 0.02, 0.33], 0.07); sorriso(k, -0.12, 0.38, MARROM, 0.06); },
  biscoito(k) { const c = '#b5703a';
    k.bola(c, [0, 0.5, 0], [0.42, 0.42, 0.22]).bola(c, [0, -0.2, 0], [0.45, 0.5, 0.22]);
    k.bola(c, [-0.56, 0.02, 0], [0.3, 0.16, 0.18], [0, 0, 0.3]).bola(c, [0.56, 0.02, 0], [0.3, 0.16, 0.18], [0, 0, -0.3]);
    k.bola(c, [-0.25, -0.72, 0], [0.18, 0.3, 0.18]).bola(c, [0.25, -0.72, 0], [0.18, 0.3, 0.18]);
    for (const s of [-1, 1]) { k.caixa(BRANCO, [s * 0.74, 0.08, 0.14], [0.04, 0.18, 0.03], [0, 0, -s * 0.3]); k.caixa(BRANCO, [s * 0.25, -0.92, 0.15], [0.2, 0.04, 0.03]); }
    k.bolinha('#e63946', [0, -0.05, 0.21], 0.07).bolinha('#39b54a', [0, -0.3, 0.2], 0.07);
    k.olho([-0.13, 0.56, 0.2], 0.07).olho([0.13, 0.56, 0.2], 0.07); sorriso(k, 0.4, 0.21, BRANCO, 0.1); bochechas(k, 0.45, 0.19, 0.24); },

  /* --- Carnaval --- */
  mascara(k) {
    k.bola('#7b2cbf', [0, 0.1, 0], [0.85, 0.45, 0.3]);
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; k.bolinha(OURO, [Math.cos(a) * 0.8, 0.1 + Math.sin(a) * 0.4, 0.12], 0.045); }
    for (let i = 0; i < 12; i++) k.bolinha(['#ff4fd8', '#39d0ff', '#ffd400'][i % 3], [-0.6 + (i * 0.37) % 1.2, -0.12 + (i * 0.23) % 0.45, 0.24], 0.03);
    for (const s of [-1, 1]) { k.bola(PRETO, [s * 0.33, 0.15, 0.2], [0.2, 0.13, 0.1]); k.olho([s * 0.33, 0.15, 0.25], 0.08); }
    bochechas(k, -0.05, 0.25, 0.3);
    k.cone('#ff4fd8', [0.45, 0.68, -0.05], [0.12, 0.6, 0.05], [0, 0, -0.3]).cone('#ffd400', [0.62, 0.6, -0.05], [0.1, 0.55, 0.05], [0, 0, -0.65]).cone('#39d0ff', [0.28, 0.72, -0.05], [0.1, 0.55, 0.05], [0, 0, -0.08]);
    k.cil(OURO, [-0.72, -0.45, 0], [0.04, 0.9, 0.04], [0, 0, 0.4]); },
  pandeiro(k) {
    k.cil('#c98b4a', [0, 0, 0], [0.85, 0.28, 0.85], [Math.PI / 2, 0, 0]).cil('#f4e6c8', [0, 0, 0.01], [0.78, 0.3, 0.78], [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2; k.bola('#d9dde4', [Math.cos(a) * 0.86, Math.sin(a) * 0.86, 0], [0.13, 0.13, 0.06]); }
    k.caixa('#ff4fd8', [0.2, -0.95, 0.05], [0.08, 0.4, 0.02], [0, 0, 0.2]).caixa('#ffd400', [0.05, -0.97, 0.05], [0.08, 0.4, 0.02], [0, 0, -0.1]);
    k.olho([-0.25, 0.15, 0.16], 0.09).olho([0.25, 0.15, 0.16], 0.09); bochechas(k, 0.0, 0.16, 0.38); sorriso(k, -0.12, 0.17, MARROM, 0.1); },
  palhaco(k) {
    k.bola('#ff4fd8', [0, -0.35, 0], [0.65, 0.6, 0.58]);
    [[-0.3, -0.2], [0.25, -0.45], [0.05, -0.15], [-0.15, -0.6], [0.35, -0.15]].forEach(([x, y]) => remendo(k, '#ffd400', [x, y + 0.35, 0.6], 0.6, 0.1));
    k.toro(BRANCO, [0, 0.02, 0], [0.48, 0.48, 0.7], [Math.PI / 2, 0, 0]);
    k.bola('#fbe3cf', [0, 0.42, 0.03], 0.44).bola('#e63946', [0, 0.4, 0.46], 0.1);
    for (const s of [-1, 1]) k.bola('#ff7a1f', [s * 0.42, 0.5, -0.05], 0.2).bola('#ff7a1f', [s * 0.3, 0.72, -0.12], 0.16).bola('#ff4fd8', [s * 0.62, -0.2, 0.25], [0.2, 0.3, 0.2], [0, 0, s * -0.6]).bola('#e63946', [s * 0.32, -0.88, 0.36], [0.22, 0.13, 0.32]);
    k.cone('#39d0ff', [0, 0.95, -0.05], [0.22, 0.4, 0.22]).bola('#ffd400', [0, 1.16, -0.05], 0.07);
    k.olho([-0.15, 0.53, 0.39], 0.065).olho([0.15, 0.53, 0.39], 0.065); sorriso(k, 0.24, 0.43, '#e63946', 0.13); bochechas(k, 0.36, 0.38, 0.26); },
  coroa(k) {
    k.bola('#c0392b', [0, -0.05, 0], [0.68, 0.55, 0.68]).cil(OURO, [0, -0.32, 0], [0.75, 0.62, 0.75]);
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + Math.PI / 2; k.cone(OURO, [Math.cos(a) * 0.68, 0.18, Math.sin(a) * 0.68], [0.15, 0.4, 0.12]).bolinha(BRANCO, [Math.cos(a) * 0.68, 0.42, Math.sin(a) * 0.68], 0.06); }
    for (let i = 1; i < 6; i++) { const a = Math.PI / 2 + i / 6 * Math.PI * 2; k.bolinha(['#39d0ff', '#39b54a', '#ff4fd8'][i % 3], [Math.cos(a) * 0.76, -0.3, Math.sin(a) * 0.76], 0.08); }
    k.bola('#ffd400', [0, 0.52, 0], 0.1);
    k.olho([-0.25, -0.22, 0.75], 0.09).olho([0.25, -0.22, 0.75], 0.09); bochechas(k, -0.38, 0.74, 0.4); sorriso(k, -0.45, 0.76, '#7a4a12', 0.08); },
  arara(k) {
    k.bola('#e63946', [0, -0.25, 0], [0.55, 0.65, 0.5]).bola('#e63946', [0, 0.45, 0.08], 0.42);
    for (const s of [-1, 1]) {
      k.bola('#ffffff', [s * 0.21, 0.47, 0.3], [0.16, 0.18, 0.1]); k.olho([s * 0.21, 0.5, 0.39], 0.065);
      k.bola('#ffd400', [s * 0.5, -0.12, 0], [0.16, 0.42, 0.3], [0, 0, s * 0.2]).bola('#1e6fd9', [s * 0.55, -0.42, -0.05], [0.14, 0.35, 0.26], [0, 0, s * 0.15]);
      k.bola('#7a7a7a', [s * 0.2, -0.88, 0.2], [0.13, 0.07, 0.18]);
    }
    k.bola('#f1efe9', [0, 0.33, 0.47], [0.14, 0.16, 0.18]).bola('#2b2b2b', [0, 0.2, 0.42], [0.1, 0.08, 0.1]);
    k.bola('#1e6fd9', [0, -0.72, -0.42], [0.12, 0.42, 0.08], [0.7, 0, 0]).bola('#e63946', [0.14, -0.7, -0.38], [0.1, 0.36, 0.07], [0.7, 0, -0.2]).bola('#ffd400', [-0.14, -0.7, -0.38], [0.1, 0.36, 0.07], [0.7, 0, 0.2]); },
  chocalho(k) {
    k.bola('#39b54a', [0, 0.25, 0], [0.62, 0.6, 0.62]); anel(k, '#ffd400', 0.25, 0.62, 0.6, 0.62, 0.08); anel(k, '#e63946', 0.25, 0.62, 0.6, -0.12, 0.07);
    k.cil('#c98b4a', [0, -0.58, 0], [0.12, 0.7, 0.12]).bola('#c98b4a', [0, -0.95, 0], 0.14);
    k.olho([-0.2, 0.36, 0.56], 0.08).olho([0.2, 0.36, 0.56], 0.08); bochechas(k, 0.24, 0.57, 0.34); sorriso(k, 0.15, 0.6, MARROM, 0.07); },

  /* --- Páscoa --- */
  'coelho-pascoa'(k) { const c = { corpo: '#fbf8f2', barriga: '#ffffff', pe: '#f3e6ee' }; const cy = bicho(k, c);
    k.bola(c.corpo, [-0.2, cy + 0.85, -0.05], [0.13, 0.42, 0.1], [0, 0, 0.15]).bola(c.corpo, [0.2, cy + 0.85, -0.05], [0.13, 0.42, 0.1], [0, 0, -0.15]);
    k.bola('#ffb3d1', [-0.2, cy + 0.85, 0.03], [0.07, 0.32, 0.04], [0, 0, 0.15]).bola('#ffb3d1', [0.2, cy + 0.85, 0.03], [0.07, 0.32, 0.04], [0, 0, -0.15]);
    k.bolinha('#ff6f9f', [0, cy - 0.05, 0.62], [0.06, 0.05, 0.05]); sorriso(k, cy - 0.15, 0.6, MARROM, 0.05);
    k.cone('#7ec8ff', [-0.12, cy - 0.5, 0.36], [0.1, 0.14, 0.06], [0, 0, -Math.PI / 2]).cone('#7ec8ff', [0.12, cy - 0.5, 0.36], [0.1, 0.14, 0.06], [0, 0, Math.PI / 2]).bolinha('#5aa9e6', [0, cy - 0.5, 0.38], 0.05);
    k.bola('#ffd166', [0, -0.35, 0.6], [0.2, 0.26, 0.18]).cil('#ff7ab8', [0, -0.35, 0.6], [0.205, 0.06, 0.185]); },
  'ovo-pascoa'(k) {
    k.bola('#a6e3ff', [0, -0.05, 0], [0.72, 0.92, 0.72]);
    [[-0.55, '#ff7ab8'], [-0.3, '#ffd166'], [0.33, '#9be37d'], [0.58, '#c6a4ff']].forEach(([y, c]) => anel(k, c, -0.05, 0.72, 0.92, y, 0.08));
    k.olho([-0.22, 0.1, 0.68], 0.085).olho([0.22, 0.1, 0.68], 0.085); bochechas(k, -0.02, 0.68, 0.36); sorriso(k, -0.08, 0.71, MARROM, 0.07); },
  'ovo-chocolate'(k) {
    k.bola('#6b3a22', [0, -0.05, 0], [0.7, 0.9, 0.7]); anel(k, '#ff7ab8', -0.05, 0.7, 0.9, -0.3, 0.12);
    k.toro('#ff7ab8', [-0.18, 0.88, 0], [0.18, 0.18, 0.25], [0, 0, 0.6]).toro('#ff7ab8', [0.18, 0.88, 0], [0.18, 0.18, 0.25], [0, 0, -0.6]).bola('#ff7ab8', [0, 0.84, 0], 0.08);
    olhoClaro(k, [-0.22, 0.18, 0.66], 0.08); olhoClaro(k, [0.22, 0.18, 0.66], 0.08); bochechas(k, 0.05, 0.67, 0.36); sorriso(k, 0.0, 0.7, '#ffd9a8', 0.07); },
  'pintinho-casca'(k) {
    k.bola(BRANCO, [0, -0.5, 0], [0.7, 0.5, 0.7]);
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; k.cone(BRANCO, [Math.cos(a) * 0.6, -0.05, Math.sin(a) * 0.6], [0.14, 0.25, 0.1], [0, -a, 0]); }
    k.bola('#ffd93b', [0, 0.25, 0], 0.5).cone('#ff9a1f', [0, 0.2, 0.52], [0.08, 0.16, 0.07], [Math.PI / 2, 0, 0]);
    k.bola('#ffc61a', [-0.04, 0.78, 0], [0.07, 0.14, 0.05], [0, 0, 0.3]).bola('#ffc61a', [0.07, 0.76, 0], [0.06, 0.12, 0.05], [0, 0, -0.4]);
    k.bola('#ffc61a', [-0.47, 0.12, 0.05], [0.1, 0.2, 0.15], [0, 0, 0.5]).bola('#ffc61a', [0.47, 0.12, 0.05], [0.1, 0.2, 0.15], [0, 0, -0.5]);
    k.olho([-0.17, 0.35, 0.44], 0.075).olho([0.17, 0.35, 0.44], 0.075); bochechas(k, 0.2, 0.45, 0.28); },
  cenoura(k) {
    k.cone('#ff8a1f', [0, -0.15, 0], [0.5, 1.5, 0.5], [Math.PI, 0, 0]);
    [-0.45, -0.1, 0.35].forEach((y, i) => { const r = 0.5 * (y + 0.9) / 1.5; k.caixa('#e06a10', [i % 2 ? 0.15 : -0.15, y, Math.sqrt(Math.max(0, r * r - 0.0225))], [0.16, 0.025, 0.02]); });
    [-0.35, 0, 0.35].forEach((a) => k.bola('#4fb848', [Math.sin(a) * 0.15, 0.85, 0], [0.11, 0.3, 0.09], [0, 0, -a]));
    k.olho([-0.13, 0.28, 0.36], 0.07).olho([0.13, 0.28, 0.36], 0.07); bochechas(k, 0.18, 0.33, 0.24); sorriso(k, 0.12, 0.33, MARROM, 0.06); },
  cesta(k) {
    k.cil('#c98b4a', [0, -0.45, 0], [0.8, 0.7, 0.8]); [-0.7, -0.45].forEach((y) => k.cil('#a8692f', [0, y, 0], [0.81, 0.06, 0.81]));
    k.toro('#a8692f', [0, -0.1, 0], [0.8, 0.8, 0.45], [Math.PI / 2, 0, 0]).arco('#a8692f', [0, -0.1, 0], [0.75, 0.85, 0.45]);
    [[-0.35, -0.02, 0.1, '#ff7ab8'], [0, 0.04, -0.2, '#ffd166'], [0.36, -0.02, 0.12, '#7ec8ff'], [0.05, -0.04, 0.3, '#9be37d']].forEach(([x, y, z, c]) => k.bola(c, [x, y, z], [0.2, 0.26, 0.2]));
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; k.bola('#7bc043', [Math.cos(a) * 0.68, -0.08, Math.sin(a) * 0.68], [0.1, 0.05, 0.1]); }
    k.olho([-0.25, -0.32, 0.8], 0.085).olho([0.25, -0.32, 0.8], 0.085); bochechas(k, -0.45, 0.8, 0.4); sorriso(k, -0.5, 0.81, '#5a2a12', 0.07); },

  /* --- Festa Junina --- */
  milho(k) {
    k.capsula('#ffd84d', [0, 0.15, 0], [0.76, 0.75, 0.76]);
    for (let y = -0.35; y <= 0.7; y += 0.13) for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2 + (Math.round(y * 10) % 2) * 0.26, s = Math.sin(a);
      if (s > 0.75 && y > -0.05 && y < 0.5) continue;   // a carinha
      const r = 0.37 * Math.sqrt(Math.max(0.05, 1 - Math.max(0, Math.abs(y - 0.15) - 0.38) ** 2 / 0.14));
      k.bolinha('#f5b800', [Math.cos(a) * r, y, s * r], [0.06, 0.05, 0.06]);
    }
    [0.3, 2.4, 4.4].forEach((a) => k.bola('#7bc043', [Math.cos(a) * 0.32, -0.5, Math.sin(a) * 0.32], [0.2, 0.5, 0.1], [Math.sin(a) * 0.35, -a, -Math.cos(a) * 0.35]));
    k.olho([-0.14, 0.3, 0.37], 0.075).olho([0.14, 0.3, 0.37], 0.075); bochechas(k, 0.18, 0.37, 0.24); sorriso(k, 0.1, 0.39, MARROM, 0.06); },
  'chapeu-palha'(k) {
    k.cil('#e8c06a', [0, -0.35, 0], [1.0, 0.08, 1.0]).cil('#e8c06a', [0, 0.0, 0], [0.55, 0.62, 0.55]).cil('#e63946', [0, -0.22, 0], [0.56, 0.12, 0.56]);
    for (let i = 0; i < 24; i++) { const a = i * 2.39, r = 0.62 + (i % 4) * 0.09; k.caixa('#c99a40', [Math.cos(a) * r, -0.3, Math.sin(a) * r], [0.12, 0.012, 0.02], [0, -a, 0]); }
    k.caixa('#3a7bd5', [0.3, 0.15, 0.44], [0.18, 0.16, 0.03], [0, 0.6, 0]).caixa('#ffd400', [-0.62, -0.3, 0.5], [0.22, 0.02, 0.18], [0, 0.4, 0]);
    k.olho([-0.18, 0.1, 0.55], 0.08).olho([0.18, 0.1, 0.55], 0.08); bochechas(k, 0.0, 0.55, 0.3); sorriso(k, -0.06, 0.56, MARROM, 0.07); },
  fogueira(k) {
    k.capsula('#7a4a2b', [0, -0.78, 0], [0.3, 0.9, 0.3], [0, 0, Math.PI / 2]).capsula('#7a4a2b', [0, -0.78, 0], [0.3, 0.9, 0.3], [Math.PI / 2, 0, 0]).capsula('#6b3f22', [0, -0.68, 0], [0.28, 0.85, 0.28], [0, Math.PI / 4, Math.PI / 2]);
    k.bola('#ff8a1f', [0, -0.15, 0], [0.6, 0.7, 0.55]).cone('#ff8a1f', [0, 0.5, 0], [0.42, 0.7, 0.38]);
    k.cone('#ff5a1f', [-0.38, 0.18, 0], [0.2, 0.5, 0.18], [0, 0, 0.3]).cone('#ff5a1f', [0.38, 0.18, 0], [0.2, 0.5, 0.18], [0, 0, -0.3]);
    k.bola('#ffd84d', [0, -0.2, 0.24], [0.38, 0.46, 0.3]).cone('#ffd84d', [0, 0.25, 0.26], [0.24, 0.45, 0.14]);
    k.olho([-0.15, -0.08, 0.5], 0.08).olho([0.15, -0.08, 0.5], 0.08); bochechas(k, -0.22, 0.5, 0.26); sorriso(k, -0.28, 0.53, '#a8521a', 0.07); },
  pipoca(k) {
    k.cil(BRANCO, [0, -0.35, 0], [0.55, 1.0, 0.55]);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8; k.caixa('#e63946', [Math.cos(a) * 0.555, -0.35, Math.sin(a) * 0.555], [0.14, 1.0, 0.02], [0, Math.PI / 2 - a, 0]); }
    for (let i = 0; i < 16; i++) { const a = i * 2.39, r = (i % 4) * 0.13; k.bola(i % 3 ? '#fff6d6' : '#ffe9a8', [Math.cos(a) * r, 0.25 + (i % 5) * 0.08 + (0.4 - r) * 0.5, Math.sin(a) * r], 0.18 + (i % 3) * 0.03); }
    k.olho([-0.17, -0.22, 0.56], 0.08).olho([0.17, -0.22, 0.56], 0.08); bochechas(k, -0.36, 0.56, 0.3); sorriso(k, -0.42, 0.57, MARROM, 0.07); },
  sanfona(k) {
    k.caixa('#c0392b', [-0.58, 0, 0], [0.4, 0.85, 0.55]).caixa('#c0392b', [0.58, 0, 0], [0.4, 0.85, 0.55]);
    for (let i = 0; i < 5; i++) k.caixa(i % 2 ? '#1b1512' : '#f4e6c8', [-0.3 + i * 0.15, 0, 0], [0.14, 0.8 - (i % 2) * 0.06, 0.5 - (i % 2) * 0.05]);
    for (let i = 0; i < 6; i++) k.caixa(i % 2 ? '#1b1512' : BRANCO, [0.6, 0.3 - i * 0.12, 0.28], [0.26, 0.09, 0.02]);
    for (const [x, y] of [[-0.72, -0.32], [-0.44, -0.32], [0.58, 0.38], [-0.58, 0.36]]) k.bolinha(OURO, [x, y, 0.28], 0.04);
    k.olho([-0.68, 0.12, 0.28], 0.07).olho([-0.48, 0.12, 0.28], 0.07); k.arco(MARROM, [-0.58, 0.0, 0.285], [0.06, 0.06, 0.25], [0, 0, Math.PI]); },
  'maca-do-amor'(k) {
    k.bola('#d7263d', [0, -0.15, 0], [0.72, 0.68, 0.72]).bola('#a8122a', [0, 0.42, 0], [0.25, 0.08, 0.25]);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; k.bola('#e8394f', [Math.cos(a) * 0.6, -0.55, Math.sin(a) * 0.6], [0.12, 0.2, 0.12]); }
    k.cil('#e8c99a', [0, 0.72, 0], [0.06, 0.7, 0.06]);
    k.olho([-0.24, 0.0, 0.65], 0.085).olho([0.24, 0.0, 0.65], 0.085); bochechas(k, -0.12, 0.67, 0.36); sorriso(k, -0.18, 0.7, '#5a0a12', 0.07); },

  /* --- Dia das Crianças --- */
  piao(k) {
    k.bola('#ffd400', [0, 0.15, 0], [0.75, 0.45, 0.75]).cone('#e63946', [0, -0.45, 0], [0.6, 0.8, 0.6], [Math.PI, 0, 0]);
    k.cil('#9aa0a8', [0, -0.92, 0], [0.04, 0.15, 0.04]).cil('#3a7bd5', [0, 0.0, 0], [0.71, 0.08, 0.71]).cil('#e63946', [0, 0.62, 0], [0.12, 0.2, 0.12]);
    k.olho([-0.22, 0.3, 0.67], 0.08).olho([0.22, 0.3, 0.67], 0.08); bochechas(k, 0.2, 0.68, 0.36); sorriso(k, 0.16, 0.72, MARROM, 0.07); },
  bola(k) {
    k.bola(BRANCO, [0, 0, 0], 0.85);
    const cores = ['#e63946', '#3a7bd5', '#ffd400', '#39b54a'];
    for (let i = 0; i < 14; i++) { const y = 1 - (i + 0.5) / 14 * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996, d = [Math.cos(a) * r, y, Math.sin(a) * r]; if (d[2] > 0.55 && Math.abs(d[1]) < 0.55) continue; remendo(k, cores[i % 4], d, 0.83, 0.3); }
    k.olho([-0.25, 0.15, 0.8], 0.1).olho([0.25, 0.15, 0.8], 0.1); bochechas(k, -0.02, 0.81, 0.4); sorriso(k, -0.1, 0.84, MARROM, 0.08); },
  ioio(k) {
    k.cil('#3a7bd5', [0, 0, 0.22], [0.85, 0.3, 0.85], [Math.PI / 2, 0, 0]).cil('#3a7bd5', [0, 0, -0.22], [0.85, 0.3, 0.85], [Math.PI / 2, 0, 0]).cil('#9aa0a8', [0, 0, 0], [0.25, 0.2, 0.25], [Math.PI / 2, 0, 0]);
    k.toro('#ffd400', [0, 0, 0.37], [0.72, 0.72, 0.3]);
    k.vara(BRANCO, [0, 0.2, 0], [0.12, 1.0, 0], 0.02).toro(BRANCO, [0.12, 1.02, 0], [0.06, 0.06, 0.2]);
    k.olho([-0.25, 0.12, 0.38], 0.1).olho([0.25, 0.12, 0.38], 0.1); bochechas(k, -0.05, 0.38, 0.4); sorriso(k, -0.15, 0.38, MARROM, 0.09); },
  carrinho(k) {
    k.caixa('#e63946', [0, -0.3, 0], [1.0, 0.4, 1.5]).caixa('#e63946', [0, 0.05, -0.1], [0.8, 0.35, 0.75]).caixa('#a6e3ff', [0, 0.07, 0.276], [0.7, 0.26, 0.02]);
    k.caixa(BRANCO, [0, -0.09, 0.5], [0.15, 0.02, 0.5]);
    for (const x of [-0.5, 0.5]) for (const z of [-0.48, 0.48]) k.cil(PRETO, [x, -0.5, z], [0.22, 0.14, 0.22], [0, 0, Math.PI / 2]).cil('#c9ced6', [x * 1.08, -0.5, z], [0.1, 0.04, 0.1], [0, 0, Math.PI / 2]);
    k.bolinha('#fff3a6', [-0.3, -0.27, 0.75], 0.08).bolinha('#fff3a6', [0.3, -0.27, 0.75], 0.08);
    k.olho([-0.18, 0.08, 0.3], 0.09).olho([0.18, 0.08, 0.3], 0.09); sorriso(k, -0.45, 0.76, PRETO, 0.12); },
  pirulito(k) {
    k.cil('#ff7ab8', [0, 0.3, 0], [0.65, 0.2, 0.65], [Math.PI / 2, 0, 0]);
    [[0.5, BRANCO], [0.32, '#ffd400'], [0.15, '#39d0ff']].forEach(([r, c]) => k.toro(c, [0, 0.3, 0.1], [r, r, 0.15]));
    k.cil(BRANCO, [0, -0.55, 0], [0.06, 0.9, 0.06]);
    k.cone('#3a7bd5', [-0.12, -0.3, 0], [0.1, 0.18, 0.06], [0, 0, -Math.PI / 2]).cone('#3a7bd5', [0.12, -0.3, 0], [0.1, 0.18, 0.06], [0, 0, Math.PI / 2]).bolinha('#2a5fb0', [0, -0.3, 0.02], 0.05);
    k.olho([-0.2, 0.4, 0.15], 0.09).olho([0.2, 0.4, 0.15], 0.09); sorriso(k, 0.2, 0.15, MARROM, 0.08); },
  robo(k) {
    k.caixa('#9aa7b8', [0, -0.35, 0], [0.8, 0.75, 0.6]).caixa('#3a7bd5', [0, -0.35, 0.31], [0.4, 0.3, 0.02]);
    k.bolinha('#e63946', [-0.1, -0.35, 0.33], 0.05).bolinha('#39b54a', [0.1, -0.35, 0.33], 0.05);
    k.caixa('#c9d2de', [0, 0.35, 0], [0.7, 0.55, 0.55]).cil('#9aa0a8', [0, 0.72, 0], [0.03, 0.2, 0.03]).bola('#e63946', [0, 0.85, 0], 0.09);
    for (const s of [-1, 1]) { k.cil('#9aa0a8', [s * 0.38, 0.35, 0], [0.1, 0.08, 0.1], [0, 0, Math.PI / 2]); k.capsula('#9aa0a8', [s * 0.55, -0.35, 0], [0.25, 0.45, 0.25]); k.caixa('#7a8494', [s * 0.2, -0.85, 0], [0.22, 0.25, 0.3]); olhoClaro(k, [s * 0.16, 0.4, 0.29], 0.09, '#bfe8ff'); }
    k.caixa('#3a3f4a', [0, 0.2, 0.28], [0.3, 0.06, 0.02]); },

  /* --- Dia das Bruxas (fofinho, nada de susto) --- */
  abobora(k) {
    k.bola('#ff8a1f', [0, -0.1, 0], [0.85, 0.62, 0.8]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; k.bola(i % 2 ? '#f07a12' : '#ff9a33', [Math.cos(a) * 0.42, -0.1, Math.sin(a) * 0.38], [0.45, 0.6, 0.45]); }
    k.cil('#5a7a2b', [0.03, 0.55, 0], [0.1, 0.28, 0.1], [0, 0, 0.2]).bola('#6cc04a', [0.22, 0.56, 0], [0.18, 0.05, 0.12], [0, 0, -0.3]);
    k.olho([-0.25, 0.05, 0.76], 0.1).olho([0.25, 0.05, 0.76], 0.1); bochechas(k, -0.12, 0.76, 0.4); sorriso(k, -0.22, 0.79, '#5a2a12', 0.14); },
  fantasma(k) {
    k.bola(BRANCO, [0, 0.25, 0], [0.62, 0.62, 0.58]).bola(BRANCO, [0, -0.3, 0], [0.66, 0.6, 0.6]);
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; k.bola(BRANCO, [Math.cos(a) * 0.48, -0.78, Math.sin(a) * 0.45], 0.2); }
    k.bola(BRANCO, [-0.62, -0.05, 0.1], [0.22, 0.12, 0.12], [0, 0, 0.5]).bola(BRANCO, [0.62, -0.05, 0.1], [0.22, 0.12, 0.12], [0, 0, -0.5]);
    k.olho([-0.2, 0.35, 0.53], 0.1).olho([0.2, 0.35, 0.53], 0.1); k.bola(PRETO, [0, 0.12, 0.57], [0.08, 0.1, 0.04]); bochechas(k, 0.18, 0.54, 0.34); },
  morcego(k) {
    k.bola('#4a2c6e', [0, -0.1, 0], [0.62, 0.7, 0.6]).bola('#7b5aa6', [0, -0.25, 0.32], [0.38, 0.42, 0.3]);
    for (const s of [-1, 1]) { k.cone('#4a2c6e', [s * 0.32, 0.65, 0], [0.17, 0.35, 0.12], [0, 0, -s * 0.25]).cone('#ff9fb8', [s * 0.31, 0.62, 0.05], [0.09, 0.2, 0.04], [0, 0, -s * 0.25]); k.bola('#3b2357', [s * 0.2, -0.8, 0.15], [0.12, 0.08, 0.15]); }
    k.olho([-0.2, 0.18, 0.52], 0.09).olho([0.2, 0.18, 0.52], 0.09); bochechas(k, 0.05, 0.55, 0.32); sorriso(k, 0.03, 0.58, '#ff9fb8', 0.07);
    k.cone(BRANCO, [-0.07, -0.04, 0.56], [0.035, 0.08, 0.03], [Math.PI, 0, 0]).cone(BRANCO, [0.07, -0.04, 0.56], [0.035, 0.08, 0.03], [Math.PI, 0, 0]);
    k.asa('#3b2357', [0.45, 0.1, -0.05], [0.7, 0.04, 0.42], 1, 0).asa('#3b2357', [-0.45, 0.1, -0.05], [0.7, 0.04, 0.42], -1, 0); },
  'gato-preto'(k) { const c = { corpo: '#2a2530', barriga: '#3b3542', pe: '#2a2530' }; const cy = bicho(k, c);
    k.cone(c.corpo, [-0.35, cy + 0.58, 0], [0.18, 0.32, 0.12], [0, 0, 0.3]).cone(c.corpo, [0.35, cy + 0.58, 0], [0.18, 0.32, 0.12], [0, 0, -0.3]);
    k.cone('#ff9fb8', [-0.34, cy + 0.56, 0.06], [0.1, 0.2, 0.05], [0, 0, 0.3]).cone('#ff9fb8', [0.34, cy + 0.56, 0.06], [0.1, 0.2, 0.05], [0, 0, -0.3]);
    k.bola('#ffd84d', [-0.22, cy + 0.1, 0.5], 0.12).bola('#ffd84d', [0.22, cy + 0.1, 0.5], 0.12);
    for (const s of [-1, 1]) for (const a of [-0.12, 0.12]) k.cil('#f4efe6', [s * 0.42, cy - 0.12 + a * 0.4, 0.5], [0.012, 0.32, 0.012], [0, 0, Math.PI / 2 + a * s]);
    k.bolinha('#ff8fab', [0, cy - 0.06, 0.62], [0.06, 0.04, 0.04]); sorriso(k, cy - 0.15, 0.6, '#ff9fb8', 0.05);
    k.toro('#9b5cff', [0, -0.05, 0.03], [0.42, 0.42, 0.45], [Math.PI / 2, 0, 0]).bolinha(OURO, [0, -0.12, 0.47], 0.07);
    k.capsula(c.corpo, [0.45, -0.2, -0.55], [0.14, 0.6, 0.14], [-0.6, 0, -0.5]); },
  'chapeu-bruxa'(k) {
    k.cil('#4a2c6e', [0, -0.6, 0], [1.0, 0.07, 1.0]).cone('#4a2c6e', [0, 0.05, -0.05], [0.55, 1.3, 0.55], [-0.12, 0, 0]).cone('#4a2c6e', [0.18, 0.78, -0.2], [0.18, 0.4, 0.18], [0, 0, -0.9]);
    k.cil('#ff8a1f', [0, -0.47, 0], [0.5, 0.15, 0.5]).caixa(OURO, [0, -0.47, 0.49], [0.2, 0.17, 0.03]);
    [[-0.2, 0.25], [0.15, 0.45], [0.25, 0.05]].forEach(([x, y]) => k.bolinha(OURO, [x, y, 0.55 * (0.5 - (y - 0.05) / 1.3) * 0.95], 0.05));
    k.olho([-0.12, -0.12, 0.35], 0.075).olho([0.12, -0.12, 0.35], 0.075); bochechas(k, -0.24, 0.39, 0.22); sorriso(k, -0.27, 0.41, '#ffb3d1', 0.06); },
  aranha(k) {
    k.bola('#2b2140', [0, -0.15, -0.15], [0.6, 0.5, 0.6]).bola('#3b2d57', [0, 0.05, 0.42], 0.38);
    [[-0.25, 0.1, -0.3], [0.2, 0.15, -0.1], [0, 0.3, -0.35]].forEach(([x, y, z]) => k.bolinha('#9b5cff', [x, y, z], [0.1, 0.06, 0.1]));
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const z = 0.25 - i * 0.25; k.vara('#2b2140', [s * 0.3, -0.12, z], [s * 0.75, 0.12, z + (i - 1.5) * 0.08], 0.04).vara('#2b2140', [s * 0.75, 0.12, z + (i - 1.5) * 0.08], [s * 0.92, -0.72, z + (i - 1.5) * 0.15], 0.035); }
    k.olho([-0.14, 0.14, 0.75], 0.1).olho([0.14, 0.14, 0.75], 0.1); bochechas(k, -0.02, 0.76, 0.26); sorriso(k, -0.06, 0.79, '#ff9fb8', 0.06); }
});

/* ---------- bichos de verdade (Zoológico): com articulações para andar, olhar e abanar o rabo ----------
   Cada um devolve as partes: tronco (parado), cabeça (gira no pescoço), patas (balançam ao andar) e rabo. O bicho olha
   para +z e cabe numa bola de raio ~1 (a física). Cores e proporções de bicho de verdade, olhos pequenos, sem bochecha. */
function parte(pivo, eixo, fase) { return { kit: new Kit(), pivo, eixo: eixo || 'x', fase: fase || 0 }; }
function quadrupede(o) {
  const r = { tronco: new Kit(), cabeca: parte(o.pescoco || [0, 0.34, 0.5]), patas: [], cauda: o.cauda ? parte(o.cauda.pivo, 'y') : null, tipoCauda: o.cauda && o.cauda.tipo };
  const t = r.tronco, c = r.cabeca.kit, L = o.comp || 0.6, R = o.grosso || 0.32;
  t.bola(o.cor, [0, 0, -0.04], [R, R * 0.95, L]).bola(o.peito || o.cor, [0, -0.02, L * 0.55], [R * 0.92, R, R * 0.95]).bola(o.barriga || o.cor, [0, -R * 0.45, 0], [R * 0.8, R * 0.5, L * 0.8]);
  if (o.pescocoLongo !== false) t.bola(o.cor, [0, 0.2, L * 0.82], [R * 0.6, R * 0.9, R * 0.6], [-0.55, 0, 0]);
  (o.manchas || []).forEach((m) => t.bola(m[3] || o.escuro, [m[0], m[1], m[2]], [0.12, 0.1, 0.14]));
  (o.listras || []).forEach((z) => t.caixa(o.escuro, [0, R * 0.55, z], [R * 1.75, 0.06, 0.05]).caixa(o.escuro, [0, R * 0.55, z], [0.05, 0.06, 0.05]));
  // cabeça (em volta do pescoço)
  const hr = (o.cab || 0.24) * 1.12;   // filhote: cabeça um pouco maior
  c.bola(o.corCab || o.cor, [0, 0.1, 0.08], [hr, hr * 0.95, hr * 1.02]);
  c.bola(o.focinhoCor || o.peito || o.cor, [0, 0.02, 0.08 + hr * 0.9], [hr * 0.5, hr * 0.42, o.focinho || hr * 0.6]);
  c.bolinha(o.nariz || '#1b1512', [0, 0.06, 0.08 + hr * 0.9 + (o.focinho || hr * 0.6) * 0.9], [0.045, 0.035, 0.03]);
  c.olho([-hr * 0.42, 0.16, 0.08 + hr * 0.75], o.olho || 0.04).olho([hr * 0.42, 0.16, 0.08 + hr * 0.75], o.olho || 0.04);
  if (o.sobrancelha) for (const sx of [-1, 1]) c.bola(o.sobrancelha, [sx * hr * 0.42, 0.16 + 0.07, 0.08 + hr * 0.78], [0.035, 0.022, 0.02]);
  const ore = o.orelha || 'caida';
  for (const sx of [-1, 1]) {
    if (ore === 'caida') c.bola(o.corOrelha || o.escuro || o.cor, [sx * hr * 0.85, 0.08, 0.02], [0.06, hr * 0.6, hr * 0.38], [0, 0, sx * 0.25]);
    else if (ore === 'pontuda') { c.cone(o.corCab || o.cor, [sx * hr * 0.55, 0.1 + hr * 0.95, 0.02], [0.08, 0.16, 0.05], [0, 0, -sx * 0.25]); c.cone('#e8b4a4', [sx * hr * 0.55, 0.08 + hr * 0.95, 0.04], [0.045, 0.1, 0.02], [0, 0, -sx * 0.25]); }
    else if (ore === 'longa') { c.bola(o.corCab || o.cor, [sx * 0.08, 0.1 + hr + 0.22, -0.04], [0.06, 0.26, 0.04], [-0.2, 0, -sx * 0.18]); c.bola('#e8b4a4', [sx * 0.08, 0.1 + hr + 0.22, -0.01], [0.035, 0.2, 0.02], [-0.2, 0, -sx * 0.18]); }
    else if (ore === 'redonda') c.bola(o.corOrelha || o.corCab || o.cor, [sx * hr * 0.62, 0.1 + hr * 0.85, 0], [0.08, 0.08, 0.04]);
    else if (ore === 'pequena') c.bola(o.corOrelha || '#d9a68a', [sx * hr * 0.6, 0.1 + hr * 0.75, -0.02], [0.07, 0.05, 0.04], [0, 0, sx * 0.4]);
  }
  if (o.bigode) for (const sx of [-1, 1]) for (const a of [-0.08, 0.08]) c.cil('#f4efe6', [sx * 0.14, 0.02 + a * 0.3, 0.08 + hr * 1.25], [0.006, 0.2, 0.006], [0, 0, Math.PI / 2 + a * sx]);
  if (o.extraCab) o.extraCab(c, hr);
  // patas: cima e embaixo, frente e trás
  const pl = (o.perna || 0.42) * 0.82, px = o.largPerna || R * 0.62, zf = L * 0.62, zt = -L * 0.66, pg = (o.grossPerna || 0.07) * 1.25;   // pernas de filhote
  [[-px, zf, 0], [px, zf, Math.PI], [-px, zt, Math.PI], [px, zt, 0]].forEach(([x, z, fase], i) => {
    const pa = parte([x, -R * 0.35, z], 'x', fase), k = pa.kit, tras = i > 1;
    k.capsula(o.corPerna || o.cor, [0, -pl / 2, 0], [pg * 2 * (tras && o.coxa ? 1.4 : 1), pl, pg * 2 * (tras && o.coxa ? 1.6 : 1)]);
    if (o.meia) k.capsula(o.meia, [0, -pl * 0.78, 0.005], [pg * 2.08, pl * 0.42, pg * 2.08]);
    k.bola(o.pata || o.corPerna || o.cor, [0, -pl, pg * 0.6], [pg * 1.1, pg * 0.7, pg * 1.5]);
    r.patas.push(pa);
  });
  if (o.cauda) o.cauda.fazer(r.cauda.kit);
  return r;
}
function salsicha(cor, escuro, mancha, peito, meia) {
  return quadrupede({ cor, peito: peito || cor, barriga: peito || cor, escuro, corOrelha: escuro, corCab: cor, focinhoCor: peito || cor, orelha: 'caida', comp: 0.68, grosso: 0.25, cab: 0.23, focinho: 0.2,
    perna: 0.2, grossPerna: 0.07, olho: 0.045, sobrancelha: meia, meia, manchas: mancha || [], pescoco: [0, 0.28, 0.58],
    extraCab: (c, hr) => { c.bola(escuro, [-hr * 0.85, 0.02, 0.0], [0.07, hr * 0.85, hr * 0.5], [0, 0, 0.18]); c.bola(escuro, [hr * 0.85, 0.02, 0.0], [0.07, hr * 0.85, hr * 0.5], [0, 0, -0.18]); },   // orelhona comprida
    cauda: { pivo: [0, 0.08, -0.7], tipo: 'abana', fazer: (k) => k.capsula(cor, [0, 0.1, -0.2], [0.06, 0.4, 0.06], [-1.15, 0, 0]) } });
}
const REAIS = {
  salsicha: () => salsicha('#1d1715', '#141010', [], '#b8743a', '#b8743a'),   // preto e caramelo, como o do vídeo
  'salsicha-caramelo': () => salsicha('#b5652e', '#8f4a1f', [], '#c47a3e'),
  'salsicha-malhado': () => salsicha('#9a9590', '#5a5550', [[0.15, 0.15, -0.25, '#3a3532'], [-0.12, 0.18, 0.05, '#3a3532'], [0.08, 0.2, 0.3, '#c9c4bd'], [-0.16, 0.05, -0.45, '#3a3532'], [0.18, 0.02, 0.15, '#c9c4bd']], '#b8743a', '#b8743a'),
  labrador: () => quadrupede({ cor: '#d6a464', peito: '#e6bf86', barriga: '#ecd0a2', escuro: '#b98546', corOrelha: '#b98546', orelha: 'caida', comp: 0.6, cab: 0.25, focinho: 0.17, perna: 0.34, grossPerna: 0.075,
    cauda: { pivo: [0, 0.12, -0.62], tipo: 'abana', fazer: (k) => k.capsula('#d6a464', [0, 0.12, -0.22], [0.08, 0.42, 0.08], [-1.0, 0, 0]) } }),
  'gato-rajado': () => quadrupede({ cor: '#8d8b88', peito: '#b9b6b0', barriga: '#d9d5cd', escuro: '#55524f', corCab: '#8d8b88', focinhoCor: '#d9d5cd', nariz: '#c98a8a', orelha: 'pontuda', comp: 0.58, grosso: 0.27, cab: 0.21, focinho: 0.08, perna: 0.34, grossPerna: 0.065, bigode: true,
    listras: [-0.35, -0.18, 0, 0.18],
    extraCab: (c, hr) => { [-0.06, 0, 0.06].forEach((x) => c.caixa('#55524f', [x, 0.1 + hr * 0.9, 0.12], [0.025, 0.02, 0.1])); },
    cauda: { pivo: [0, 0.1, -0.58], tipo: 'balanca', fazer: (k) => { for (let i = 0; i < 12; i++) { const a = i / 11; k.bola(i > 9 ? '#55524f' : '#8d8b88', [0, Math.sin(a * 1.4) * 0.42, -0.05 - a * 0.32 + Math.max(0, a - 0.7) * 0.5], 0.06 - a * 0.012); } } } }),
  'coelho-marrom': () => quadrupede({ cor: '#8f6e4f', peito: '#a6845f', barriga: '#d8c4ab', corCab: '#8f6e4f', focinhoCor: '#a6845f', nariz: '#c98a8a', orelha: 'longa', comp: 0.42, grosso: 0.34, cab: 0.21, focinho: 0.09, perna: 0.26, coxa: true, grossPerna: 0.07, pescocoLongo: false, pescoco: [0, 0.3, 0.38],
    cauda: { pivo: [0, 0.1, -0.44], tipo: 'pompom', fazer: (k) => k.bola('#f4f0ea', [0, 0.04, -0.04], 0.1) } }),
  'porquinho-da-india': () => quadrupede({ cor: '#f1e8dc', peito: '#f1e8dc', barriga: '#f1e8dc', escuro: '#d88a3c', corCab: '#d88a3c', focinhoCor: '#f1e8dc', nariz: '#b5776f', orelha: 'pequena', comp: 0.55, grosso: 0.36, cab: 0.23, focinho: 0.1, perna: 0.12, grossPerna: 0.05, pescocoLongo: false, pescoco: [0, 0.12, 0.52],
    manchas: [[0.18, 0.22, -0.2, '#d88a3c'], [-0.15, 0.25, 0.05, '#2b2420'], [0.05, 0.3, -0.38, '#2b2420'], [-0.2, 0.12, -0.32, '#d88a3c'], [0.22, 0.05, 0.2, '#d88a3c']] }),
  leaozinho: () => quadrupede({ cor: '#d8a85e', peito: '#e8c58e', barriga: '#efd5a6', escuro: '#a8763a', corOrelha: '#a8763a', orelha: 'redonda', comp: 0.56, grosso: 0.31, cab: 0.26, focinho: 0.11, perna: 0.32, grossPerna: 0.075, bigode: true, nariz: '#6b3f2a',
    manchas: [[0.2, 0.1, 0.1, '#c4924c'], [-0.18, 0.06, -0.2, '#c4924c']],
    cauda: { pivo: [0, 0.1, -0.6], tipo: 'balanca', fazer: (k) => { k.capsula('#d8a85e', [0, -0.05, -0.25], [0.05, 0.45, 0.05], [-1.9, 0, 0]); k.bola('#5a3a22', [0, -0.18, -0.46], 0.08); } } }),
  jabuti() {
    const r = { tronco: new Kit(), cabeca: parte([0, 0.02, 0.6]), patas: [], cauda: null };
    const t = r.tronco;
    t.bola('#6b4a2b', [0, 0.05, 0], [0.62, 0.4, 0.68]).bola('#d8c28a', [0, -0.18, 0], [0.6, 0.12, 0.66]);
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; t.bola('#a8803f', [Math.cos(a) * 0.36, 0.28, Math.sin(a) * 0.42], [0.15, 0.06, 0.15]); }
    t.bola('#a8803f', [0, 0.43, 0], [0.18, 0.05, 0.2]);
    const c = r.cabeca.kit; c.capsula('#8a8d5c', [0, 0.05, 0.12], [0.16, 0.28, 0.16], [Math.PI / 2 - 0.3, 0, 0]).bola('#8a8d5c', [0, 0.1, 0.3], [0.14, 0.12, 0.17]);
    c.olho([-0.08, 0.15, 0.4], 0.028).olho([0.08, 0.15, 0.4], 0.028); c.bolinha('#3a3a22', [0, 0.07, 0.46], [0.03, 0.015, 0.01]);
    [[-0.45, 0.42, 0], [0.45, 0.42, Math.PI], [-0.45, -0.42, Math.PI], [0.45, -0.42, 0]].forEach(([x, z, f]) => { const pa = parte([x, -0.1, z], 'x', f); pa.kit.capsula('#8a8d5c', [0, -0.12, 0], [0.16, 0.26, 0.18]); pa.kit.bola('#6f7248', [0, -0.25, 0.04], [0.1, 0.05, 0.12]); r.patas.push(pa); });
    return r;
  },
  'pinguim-imperador'() {
    const r = { tronco: new Kit(), cabeca: parte([0, 0.5, 0.05]), patas: [], cauda: null };
    const t = r.tronco;
    t.bola('#1f232b', [0, -0.05, -0.04], [0.36, 0.6, 0.32]).bola('#f2efe6', [0, -0.08, 0.08], [0.31, 0.55, 0.27]).bola('#f5d36a', [0, 0.32, 0.17], [0.16, 0.12, 0.08]);
    const c = r.cabeca.kit; c.bola('#1f232b', [0, 0.12, 0.02], 0.22).bola('#f2b43a', [-0.17, 0.05, 0.08], [0.05, 0.1, 0.06]).bola('#f2b43a', [0.17, 0.05, 0.08], [0.05, 0.1, 0.06]);
    c.cone('#2a2a2a', [0, 0.1, 0.3], [0.04, 0.22, 0.04], [Math.PI / 2 + 0.25, 0, 0]).bola('#e88a3a', [0, 0.06, 0.3], [0.025, 0.02, 0.08]);
    c.olho([-0.1, 0.17, 0.17], 0.028).olho([0.1, 0.17, 0.17], 0.028);
    [[-0.13, 0], [0.13, Math.PI]].forEach(([x, f]) => { const pa = parte([x, -0.62, 0.08], 'x', f); pa.kit.bola('#3a3a3a', [0, -0.03, 0.08], [0.09, 0.03, 0.13]); r.patas.push(pa); });
    [[-1, 0.0], [1, Math.PI]].forEach(([sx, f]) => { const pa = parte([sx * 0.34, 0.15, 0], 'z', f); pa.kit.bola('#1f232b', [sx * 0.04, -0.25, 0], [0.06, 0.3, 0.12], [0, 0, sx * 0.15]); pa.nadadeira = sx; r.patas.push(pa); });
    return r;
  },
  'pato-real'() {
    const r = { tronco: new Kit(), cabeca: parte([0, 0.25, 0.4]), patas: [], cauda: parte([0, 0.12, -0.5], 'y'), tipoCauda: 'balanca' };
    const t = r.tronco;
    t.bola('#9a948a', [0, 0, -0.05], [0.33, 0.28, 0.52]).bola('#7a4a32', [0, 0.02, 0.33], [0.29, 0.27, 0.22]).bola('#6e5a48', [-0.27, 0.06, -0.08], [0.08, 0.2, 0.42]).bola('#6e5a48', [0.27, 0.06, -0.08], [0.08, 0.2, 0.42]);
    t.bola('#3a5bbf', [-0.31, 0.06, -0.15], [0.03, 0.06, 0.12]).bola('#3a5bbf', [0.31, 0.06, -0.15], [0.03, 0.06, 0.12]);
    const c = r.cabeca.kit; c.cil('#ffffff', [0, 0.02, 0.02], [0.13, 0.04, 0.13]).capsula('#1f6b3a', [0, 0.12, 0.04], [0.2, 0.2, 0.2], [0.3, 0, 0]).bola('#1f6b3a', [0, 0.24, 0.1], [0.15, 0.14, 0.17]);
    c.bola('#e8c23a', [0, 0.2, 0.3], [0.07, 0.035, 0.14]); c.olho([-0.1, 0.28, 0.17], 0.025).olho([0.1, 0.28, 0.17], 0.025);
    r.cauda.kit.bola('#2b2b2b', [0, 0.05, -0.05], [0.12, 0.06, 0.12]).bola('#ffffff', [0, 0.04, -0.12], [0.08, 0.03, 0.06]);
    [[-0.12, 0], [0.12, Math.PI]].forEach(([x, f]) => { const pa = parte([x, -0.2, 0.02], 'x', f); pa.kit.cil('#f08a2a', [0, -0.1, 0], [0.025, 0.2, 0.025]).bola('#f08a2a', [0, -0.21, 0.06], [0.08, 0.02, 0.1]); r.patas.push(pa); });
    return r;
  }
};

/* ---------- materiais e a montagem de cada prêmio ---------- */
const MAT = {
  pelucia: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 }),
  lanche: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0 }),
  inseto: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.05 }),
  ouro: new THREE.MeshStandardMaterial({ color: '#ffcc33', roughness: 0.25, metalness: 0.85, emissive: '#553300', emissiveIntensity: 0.35 }),
  olho: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.2, metalness: 0 }),
  real: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0 }),
  vagalume: new THREE.MeshStandardMaterial({ color: '#fff27a', emissive: '#ffe54a', emissiveIntensity: 1.2, roughness: 0.4 })
};
const OLHO = (() => { const k = new Kit(); k.bola(PRETO, [0, 0, 0], 1).bolinha('#ffffff', [0.32, 0.36, 0.78], 0.32); return k.geometria(); })();
const cache = {};
function modelo(tipo) {
  if (cache[tipo]) return cache[tipo];
  const base = tipo.replace(/-dourad[oa]$/, ''), ouro = base !== tipo;
  const nomeBase = { urso: 'urso', dino: 'dino', joaninha: 'joaninha', burguer: 'x-burguer' }[base] || base;
  if (REAIS[nomeBase]) {   // bicho de verdade: uma geometria por articulação
    const r = REAIS[nomeBase](), geo = (k) => { const g = k.geometria(); g.userData.compartilhado = true; return g; };
    const art = (pa) => pa && { geo: geo(pa.kit), pivo: pa.pivo, eixo: pa.eixo, fase: pa.fase, olhos: pa.kit.olhos, nadadeira: pa.nadadeira };
    cache[tipo] = { rig: { tronco: geo(r.tronco), cabeca: art(r.cabeca), patas: r.patas.map(art), cauda: art(r.cauda), tipoCauda: r.tipoCauda },
      olhos: [], asas: [], mat: ouro ? MAT.ouro : MAT.real, ouro };
    return cache[tipo];
  }
  const k = new Kit(); (TIPOS[nomeBase] || TIPOS.urso)(k);
  const fam = Object.keys(MAQUINAS).find((m) => MAQUINAS[m].tipos.includes(nomeBase));
  // insetos e cachorro-quente são compridos: encolhem um pouco para caber na bola da física
  const enc = fam === 'estrelas' ? 0.82 : nomeBase === 'cachorro-quente' ? 0.85 : 1;
  if (enc !== 1) { k.partes.forEach((g) => g.scale(enc, enc, enc)); k.olhos.forEach((o) => { o.pos = o.pos.map((v) => v * enc); o.r *= enc; }); k.asas.forEach((a) => { a.pivo = a.pivo.map((v) => v * enc); a.esc = a.esc.map((v) => v * enc); }); }
  const mat = ouro ? MAT.ouro : fam === 'lanchonete' ? MAT.lanche : fam === 'estrelas' ? MAT.inseto : MAT.pelucia;
  cache[tipo] = { geo: k.geometria(), olhos: k.olhos, asas: k.asas, mat, ouro, vagalume: nomeBase === 'vagalume' };
  cache[tipo].geo.userData.compartilhado = true;
  return cache[tipo];
}
const ASA = new THREE.SphereGeometry(1, 16, 8);
// o que é de todos os prêmios não pode ser apagado quando uma partida acaba (o app.js olha esta marca)
[ASA, OLHO, ...Object.values(GEO)].forEach((g) => { g.userData.compartilhado = true; });
Object.values(MAT).forEach((mt) => { mt.userData.compartilhado = true; });
export function criarPremio(tipo) {
  const md = modelo(tipo);
  const raiz = new THREE.Group(), corpo = new THREE.Group();
  raiz.add(corpo);
  const olhos = [];
  let rig = null;
  if (md.rig) {   // bicho de verdade: tronco + articulações
    const t = new THREE.Mesh(md.rig.tronco, md.mat); t.castShadow = true; t.receiveShadow = true; corpo.add(t);
    const articular = (a) => {
      if (!a) return null;
      const g = new THREE.Group(); g.position.set(...a.pivo); corpo.add(g);
      const ms = new THREE.Mesh(a.geo, md.mat); ms.castShadow = true; g.add(ms);
      a.olhos.forEach((o) => { const e = new THREE.Mesh(OLHO, MAT.olho); e.position.set(...o.pos); e.scale.setScalar(o.r); g.add(e); olhos.push(e); });
      return { g, eixo: a.eixo, fase: a.fase, nadadeira: a.nadadeira };
    };
    rig = { cabeca: articular(md.rig.cabeca), patas: md.rig.patas.map(articular), cauda: articular(md.rig.cauda), tipoCauda: md.rig.tipoCauda };
  } else {
    const malha = new THREE.Mesh(md.geo, md.mat); malha.castShadow = true; malha.receiveShadow = true; corpo.add(malha);
    md.olhos.forEach((o) => { const e = new THREE.Mesh(OLHO, MAT.olho); e.position.set(...o.pos); e.scale.setScalar(o.r); corpo.add(e); olhos.push(e); });
  }
  const asas = md.asas.map((a) => {
    const piv = new THREE.Group(); piv.position.set(...a.pivo); piv.rotation.y = a.inclina * a.lado;
    const mat = new THREE.MeshStandardMaterial({ color: md.ouro ? '#ffe38a' : a.cor, transparent: true, opacity: 0.82, roughness: 0.3, side: THREE.DoubleSide });
    const w = new THREE.Mesh(ASA, mat); w.scale.set(...a.esc); w.position.x = a.lado * a.esc[0]; piv.add(w); corpo.add(piv);
    return { piv, lado: a.lado };
  });
  if (md.vagalume) { const luz = new THREE.Mesh(GEO.bola, MAT.vagalume); luz.position.set(0, -0.05, -0.58); luz.scale.set(0.42, 0.36, 0.44); corpo.add(luz); }
  raiz.userData = { premio: true, tipo, corpo, olhos, asas, rig, fase: Math.random() * 10, ouro: md.ouro };
  return raiz;
}

// olhos piscando, asas batendo e, nos vivos, o corpo se mexendo (balança, respira, olha em volta)
export function animar(obj, t, vivo, agitado, andando) {
  const u = obj.userData, f = t + u.fase;
  const pisca = (f % 4.2) < 0.13 ? 0.12 : 1;
  for (const o of u.olhos) o.scale.y = o.scale.x * pisca;
  if (u.rig) { animarBicho(u, f, agitado, andando); return; }
  for (const a of u.asas) a.piv.rotation.z = a.lado * (0.25 + Math.sin(f * (agitado ? 28 : 9)) * (agitado ? 0.6 : 0.35));
  if (vivo) {
    u.corpo.rotation.z = Math.sin(f * 2.3) * 0.12;
    u.corpo.rotation.y = Math.sin(f * 0.9) * 0.35;
    const s = 1 + Math.sin(f * 3.1) * 0.04; u.corpo.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
  } else if (agitado) {
    u.corpo.rotation.z = Math.sin(f * 14) * 0.08;
  } else { u.corpo.rotation.z = 0; }
}

// bicho de verdade: anda (patas alternadas, corpo sobe e desce), olha em volta, abana o rabo, respira; na garra, esperneia
function animarBicho(u, f, agitado, andando) {
  const r = u.rig;
  const passo = agitado ? 16 : 9, amp = agitado ? 0.85 : andando ? 0.55 : 0;
  for (const p of r.patas) {
    if (!p) continue;
    const v = Math.sin(f * passo + p.fase) * amp;
    if (p.eixo === 'z') p.g.rotation.z = p.nadadeira * (0.15 + (agitado || andando ? Math.abs(Math.sin(f * passo + p.fase)) * 0.5 : Math.sin(f * 1.5) * 0.06));
    else p.g.rotation.x = v;
  }
  if (r.cabeca) {
    r.cabeca.g.rotation.y = agitado ? Math.sin(f * 11) * 0.35 : andando ? Math.sin(f * 2) * 0.12 : Math.sin(f * 0.55) * 0.65 + Math.sin(f * 1.7) * 0.12;
    r.cabeca.g.rotation.x = andando ? Math.sin(f * passo * 2) * 0.05 : Math.sin(f * 0.8) * 0.12 - 0.05;
  }
  if (r.cauda) {
    const k = r.tipoCauda === 'abana' ? Math.sin(f * 12) * 0.55 : r.tipoCauda === 'pompom' ? Math.sin(f * 6) * 0.15 : Math.sin(f * 1.6) * 0.45;
    r.cauda.g.rotation.y = k;
  }
  const res = 1 + Math.sin(f * 2.4) * 0.025;   // respira
  u.corpo.scale.set(1, res, 1);
  u.corpo.position.y = andando ? Math.abs(Math.sin(f * passo)) * 0.05 : 0;
  u.corpo.rotation.z = agitado ? Math.sin(f * 14) * 0.1 : 0;
}
