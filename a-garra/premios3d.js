/* A-GARRA — os prêmios em 3D, montados em código com peças simples (bolas, cilindros, cones, caixas), todos desenho
   próprio (nenhum personagem de marca). Cada tipo vira UMA geometria com as cores nos vértices (rápido no celular) e,
   por cima, os olhos (piscam) e as asas (batem) como pecinhas separadas.
     MAQUINAS             as máquinas (cada uma é um jogo): nome, prêmios, o raro e se os bichinhos são vivos
     NOMES[tipo]          [pt, en]
     criarPremio(tipo)    THREE.Group de raio ~1 (o app escala pelo raio da física)
     animar(obj, t, vivo) olhos piscando, asas batendo, bichinho vivo se mexendo */
import * as THREE from './libs/three.module.js';

export const MAQUINAS = {
  telefone: { nome: ['Cabine de Telefone', 'Phone Booth'], prem: ['Pelúcias', 'Plushies'],
    tipos: ['urso', 'coelho', 'gato', 'cachorro', 'ovelha', 'pinguim', 'unicornio', 'sapo', 'porquinho', 'panda', 'pato', 'girafa'], raro: 'urso-dourado' },
  neon: { nome: ['Neon', 'Neon'], prem: ['Bichinhos que mexem', 'Wiggly critters'], vivos: true,
    tipos: ['dino', 'polvo', 'pintinho', 'macaco', 'raposa', 'hamster', 'coruja', 'tartaruga'], raro: 'dino-dourado' },
  estrelas: { nome: ['Estrelas', 'Stars'], prem: ['Insetos', 'Bugs'],
    tipos: ['joaninha', 'abelha', 'borboleta', 'besouro', 'lagarta', 'libelula', 'formiga', 'vagalume'], raro: 'joaninha-dourada' },
  lanchonete: { nome: ['Lanchonete', 'Burger Bar'], prem: ['Hambúrgueres e lanches', 'Burgers and snacks'],
    tipos: ['x-burguer', 'x-salada', 'x-bacon', 'duplo', 'x-frango', 'vegano', 'x-tudo', 'cachorro-quente', 'batata', 'milk-shake'], raro: 'burguer-dourado' }
};

export const NOMES = {
  urso: ['Ursinho', 'Teddy'], coelho: ['Coelhinha', 'Bunny'], gato: ['Gatinho', 'Kitty'], cachorro: ['Cachorrinho', 'Puppy'],
  ovelha: ['Ovelhinha', 'Lamb'], pinguim: ['Pinguim', 'Penguin'], unicornio: ['Unicórnio', 'Unicorn'], sapo: ['Sapinho', 'Froggy'],
  porquinho: ['Porquinha', 'Piggy'], panda: ['Panda', 'Panda'], pato: ['Patinho', 'Duckling'], girafa: ['Girafinha', 'Giraffe'],
  'urso-dourado': ['Ursinho dourado', 'Golden teddy'],
  dino: ['Dino', 'Dino'], polvo: ['Polvinho', 'Octopus'], pintinho: ['Pintinho', 'Chick'], macaco: ['Macaquinho', 'Monkey'],
  raposa: ['Raposinha', 'Fox'], hamster: ['Hamster', 'Hamster'], coruja: ['Corujinha', 'Owl'], tartaruga: ['Tartaruga', 'Turtle'],
  'dino-dourado': ['Dino dourado', 'Golden dino'],
  joaninha: ['Joaninha', 'Ladybug'], abelha: ['Abelhinha', 'Bee'], borboleta: ['Borboleta', 'Butterfly'], besouro: ['Besouro', 'Beetle'],
  lagarta: ['Lagarta', 'Caterpillar'], libelula: ['Libélula', 'Dragonfly'], formiga: ['Formiguinha', 'Ant'], vagalume: ['Vaga-lume', 'Firefly'],
  'joaninha-dourada': ['Joaninha dourada', 'Golden ladybug'],
  'x-burguer': ['X-Burguer', 'Cheeseburger'], 'x-salada': ['X-Salada', 'Salad burger'], 'x-bacon': ['X-Bacon', 'Bacon burger'],
  duplo: ['Burguer duplo', 'Double burger'], 'x-frango': ['X-Frango', 'Chicken burger'], vegano: ['Burguer verde', 'Veggie burger'],
  'x-tudo': ['X-Tudo', 'Everything burger'], 'cachorro-quente': ['Cachorro-quente', 'Hot dog'], batata: ['Batata frita', 'Fries'],
  'milk-shake': ['Milk-shake', 'Milkshake'], 'burguer-dourado': ['Burguer dourado', 'Golden burger']
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

/* ---------- materiais e a montagem de cada prêmio ---------- */
const MAT = {
  pelucia: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 }),
  lanche: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0 }),
  inseto: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.05 }),
  ouro: new THREE.MeshStandardMaterial({ color: '#ffcc33', roughness: 0.25, metalness: 0.85, emissive: '#553300', emissiveIntensity: 0.35 }),
  olho: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.2, metalness: 0 }),
  vagalume: new THREE.MeshStandardMaterial({ color: '#fff27a', emissive: '#ffe54a', emissiveIntensity: 1.2, roughness: 0.4 })
};
const OLHO = (() => { const k = new Kit(); k.bola(PRETO, [0, 0, 0], 1).bolinha('#ffffff', [0.32, 0.36, 0.78], 0.32); return k.geometria(); })();
const cache = {};
function modelo(tipo) {
  if (cache[tipo]) return cache[tipo];
  const base = tipo.replace(/-dourad[oa]$/, ''), ouro = base !== tipo;
  const nomeBase = { urso: 'urso', dino: 'dino', joaninha: 'joaninha', burguer: 'x-burguer' }[base] || base;
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
  const malha = new THREE.Mesh(md.geo, md.mat); malha.castShadow = true; malha.receiveShadow = true; corpo.add(malha);
  const olhos = md.olhos.map((o) => { const e = new THREE.Mesh(OLHO, MAT.olho); e.position.set(...o.pos); e.scale.setScalar(o.r); corpo.add(e); return e; });
  const asas = md.asas.map((a) => {
    const piv = new THREE.Group(); piv.position.set(...a.pivo); piv.rotation.y = a.inclina * a.lado;
    const mat = new THREE.MeshStandardMaterial({ color: md.ouro ? '#ffe38a' : a.cor, transparent: true, opacity: 0.82, roughness: 0.3, side: THREE.DoubleSide });
    const w = new THREE.Mesh(ASA, mat); w.scale.set(...a.esc); w.position.x = a.lado * a.esc[0]; piv.add(w); corpo.add(piv);
    return { piv, lado: a.lado };
  });
  if (md.vagalume) { const luz = new THREE.Mesh(GEO.bola, MAT.vagalume); luz.position.set(0, -0.05, -0.58); luz.scale.set(0.42, 0.36, 0.44); corpo.add(luz); }
  raiz.userData = { premio: true, tipo, corpo, olhos, asas, fase: Math.random() * 10, ouro: md.ouro };
  return raiz;
}

// olhos piscando, asas batendo e, nos vivos, o corpo se mexendo (balança, respira, olha em volta)
export function animar(obj, t, vivo, agitado) {
  const u = obj.userData, f = t + u.fase;
  const pisca = (f % 4.2) < 0.13 ? 0.12 : 1;
  for (const o of u.olhos) o.scale.y = o.scale.x * pisca;
  for (const a of u.asas) a.piv.rotation.z = a.lado * (0.25 + Math.sin(f * (agitado ? 28 : 9)) * (agitado ? 0.6 : 0.35));
  if (vivo) {
    u.corpo.rotation.z = Math.sin(f * 2.3) * 0.12;
    u.corpo.rotation.y = Math.sin(f * 0.9) * 0.35;
    const s = 1 + Math.sin(f * 3.1) * 0.04; u.corpo.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
  } else if (agitado) {
    u.corpo.rotation.z = Math.sin(f * 14) * 0.08;
  } else { u.corpo.rotation.z = 0; }
}
