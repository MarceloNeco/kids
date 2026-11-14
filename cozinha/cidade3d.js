/* Mão na Massa — a cidade em 3D de verdade (v0.12.0, pedido do dono de 14/Nov/2026: "estilo SimCity", girar a cidade,
   carro andando, o bonequinho indo a pé até o lugar).
   Feita com o three.js (libs/three.module.min.js, licença MIT, guardado no jogo para funcionar sem internet): os prédios
   são montados no código, com luz e sombra; carros rodam pelas ruas; o cozinheirinho anda pela rua da porta de casa até
   a porta do lugar tocado. Dá para girar a cidade arrastando o dedo (ou com ⟲ ⟳) e aproximar com dois dedos.
   Em pé (celular em pé) a cidade fica em 2 colunas; deitada, em 5 colunas: assim cada lugar fica grande na tela.
   Os nomes dos lugares são os próprios botões do app (data-lugar), postos em cima de cada prédio a cada quadro.
   API (window.Cidade3D): suportado(), montar(el, op), andar(id, aoChegar), porNaPorta(id), pausar(), girar(passo).
   op = { pos: 'casa', aoTocar(id), placas: { mercado: 'MERCADO', padaria: 'PADARIA' }, instantaneo: bool }. */
import * as THREE from './libs/three.module.min.js';

const PASSO = 12, LOTE = 9;
const RETRATO = [['rio', 'pomar'], ['horta', 'galinheiro'], ['vaca', 'mercado'], ['padaria', 'feira'], ['vizinha', 'casa']];
const PAISAGEM = [['rio', 'pomar', 'horta', 'galinheiro', 'vaca'], ['mercado', 'padaria', 'feira', 'vizinha', 'casa']];

let R = null;   // tudo da cidade montada: renderer, cena, câmera, lotes, ruas, quem anda...

function suportado() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
}

// ---------- materiais e peças ----------
const MAT = {};
function mat(cor, op) {
  const k = cor + JSON.stringify(op || {});
  if (!MAT[k]) MAT[k] = new THREE.MeshStandardMaterial(Object.assign({ color: cor, roughness: 0.82, metalness: 0 }, op || {}));
  return MAT[k];
}
function sombra(m) { m.castShadow = true; m.receiveShadow = true; return m; }
function caixa(w, h, d, cor, x, y, z, op) { const m = sombra(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(cor, op))); m.position.set(x || 0, (y || 0) + h / 2, z || 0); return m; }
function cilindro(r1, r2, h, cor, x, y, z, seg) { const m = sombra(new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg || 14), mat(cor))); m.position.set(x || 0, (y || 0) + h / 2, z || 0); return m; }
function bola(r, cor, x, y, z, op) { const m = sombra(new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat(cor, op))); m.position.set(x || 0, y || 0, z || 0); return m; }
function copa(r, cor, x, y, z) { const m = sombra(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat(cor, { flatShading: true }))); m.position.set(x, y, z); return m; }
// telhado de duas águas: prisma triangular de largura w (em x), altura h, comprimento d (em z)
function telhado(w, h, d, cor, y) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.lineTo(-w / 2, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2);
  const m = sombra(new THREE.Mesh(g, mat(cor))); m.position.y = y; return m;
}
// placa/toldo com textura desenhada num canvas
function texturaListras(c1, c2, n) {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 32; const x = cv.getContext('2d');
  for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? c2 : c1; x.fillRect(i * 128 / n, 0, 128 / n + 1, 32); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function placa(texto, fundo, cor, w, h) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const x = cv.getContext('2d');
  x.fillStyle = fundo; x.fillRect(0, 0, 256, 64); x.strokeStyle = cor; x.lineWidth = 6; x.strokeRect(3, 3, 250, 58);
  x.fillStyle = cor; x.font = '700 40px Fredoka, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(texto, 128, 34);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }));
}
function toldo(w, d, c1, c2, y, z) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: texturaListras(c1, c2, 10), side: THREE.DoubleSide, roughness: 0.7 }));
  m.rotation.x = -Math.PI / 2 + 0.45; m.position.set(0, y, z); m.castShadow = true; return m;
}
function janela(w, h, x, y, z, ry) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat('#bfe9ff', { emissive: '#6aa8d8', emissiveIntensity: 0.25, roughness: 0.2 }));
  m.position.set(x, y, z); m.rotation.y = ry || 0; return m;
}
function cerca(g, lado) {   // cerquinha de madeira em volta do lote
  const L = lado / 2;
  for (let i = -L; i <= L + 0.01; i += 1.5) for (const [x, z] of [[i, -L], [i, L], [-L, i], [L, i]]) g.add(caixa(0.18, 0.9, 0.18, '#a8692f', x, 0, z));
  for (const y of [0.35, 0.75]) {
    g.add(caixa(lado, 0.1, 0.1, '#c98a4b', 0, y, -L)); g.add(caixa(lado, 0.1, 0.1, '#c98a4b', 0, y, L));
    g.add(caixa(0.1, 0.1, lado, '#c98a4b', -L, y, 0)); g.add(caixa(0.1, 0.1, lado, '#c98a4b', L, y, 0));
  }
}
function arvore(x, z, cor, frutas, alt) {
  const g = new THREE.Group(), a = alt || 2.2;
  g.add(cilindro(0.18, 0.26, a, '#8a5a2b', 0, 0, 0, 8));
  const c = copa(1.25, cor, 0, a + 0.7, 0); g.add(c);
  (frutas || []).forEach((f, i) => { const ang = i * 2.1, r = 1.1; g.add(bola(0.2, f, Math.cos(ang) * r * 0.8, a + 0.5 + (i % 2) * 0.6, Math.sin(ang) * r * 0.8)); });
  g.position.set(x, 0, z); g.userData.balanca = c; return g;
}

// ---------- cada lugar ----------
const LUGAR = {};
LUGAR.casa = (op) => {
  const g = new THREE.Group();
  g.add(caixa(5, 3.2, 4.4, '#a9d8ff', 0, 0, -0.6));
  const t = telhado(5.8, 2.2, 5.2, '#ff8a3d', 3.2); t.position.z = -0.6; g.add(t);
  g.add(caixa(1.1, 2, 0.12, '#b85a2a', -0.9, 0, 1.62));
  g.add(janela(1, 0.9, 1.3, 1.9, 1.63)); g.add(janela(0.9, 0.9, 2.51, 1.9, -0.6, Math.PI / 2));
  g.add(caixa(0.6, 1.8, 0.6, '#b85a3a', 1.4, 3.6, -1.4));
  g.userData.fumaca = [1.4, 5.6, -1.4];
  g.add(caixa(1.6, 0.08, 1.4, '#d9cbb8', -0.9, 0, 2.4));   // caminho até a porta
  return g;
};
LUGAR.vizinha = () => {
  const g = new THREE.Group();
  g.add(caixa(4.6, 3, 4, '#ffb6c9', 0, 0, -0.6));
  const t = telhado(5.4, 2, 4.8, '#e8574a', 3); t.position.z = -0.6; g.add(t);
  g.add(caixa(1, 1.9, 0.12, '#a35a3a', -1, 0, 1.42)); g.add(janela(1.2, 1, 1.1, 1.8, 1.43));
  for (const [x, z, c] of [[-2.6, 2.4, '#ff5e9c'], [-1.8, 2.8, '#ffd23f'], [2.4, 2.6, '#8e6bff'], [3, 1.8, '#ff5e9c']]) { g.add(cilindro(0.04, 0.04, 0.6, '#3f8f2e', x, 0, z)); g.add(bola(0.22, c, x, 0.7, z)); }
  g.add(caixa(1.6, 0.4, 0.5, '#c98a4b', 2.2, 0.3, 1.9));   // banquinho
  return g;
};
LUGAR.mercado = (op) => {
  const g = new THREE.Group();
  g.add(caixa(6.6, 3.4, 4.6, '#ffd76a', 0, 0, -0.8));
  g.add(caixa(6.8, 0.4, 4.8, '#f2b84a', 0, 3.4, -0.8));
  g.add(caixa(2, 2.2, 0.1, '#6cc3e8', 0, 0, 1.52, { roughness: 0.2, emissive: '#3a8fb8', emissiveIntensity: 0.2 }));
  g.add(janela(1.4, 1.2, -2.2, 1.6, 1.53)); g.add(janela(1.4, 1.2, 2.2, 1.6, 1.53));
  g.add(toldo(6.4, 1.6, '#2bb6a8', '#ffffff', 2.7, 2.1));
  const p = placa((op.placas && op.placas.mercado) || 'MERCADO', '#ffffff', '#b8541c', 4, 1); p.position.set(0, 3.25, 1.56); g.add(p);
  // a cesta gigante no telhado
  const c = new THREE.Group(); c.add(caixa(2.2, 1, 1.4, '#ffc93c')); const alca = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 8, 24, Math.PI), mat('#fff6e0')); alca.position.y = 1; c.add(alca);
  c.add(bola(0.32, '#e8432f', -0.4, 1.2, 0)); c.add(bola(0.32, '#7bc950', 0.3, 1.2, 0.1)); c.position.set(0, 3.8, -0.8); g.add(c);
  return g;
};
LUGAR.padaria = (op) => {
  const g = new THREE.Group();
  g.add(caixa(5.8, 3.2, 4.4, '#e9a66b', 0, 0, -0.8));
  g.add(caixa(1.2, 2, 0.1, '#7a4a2a', -1.6, 0, 1.42));
  g.add(janela(2.2, 1.3, 1.2, 1.4, 1.43));
  for (const x of [0.5, 1.2, 1.9]) { const p = bola(0.28, '#d98b3a', x, 0.95, 1.5); p.scale.set(1.4, 0.7, 0.8); g.add(p); }
  g.add(toldo(5.6, 1.4, '#e84a3c', '#ffffff', 2.6, 2));
  const pl = placa((op.placas && op.placas.padaria) || 'PADARIA', '#fff6e0', '#7a3b12', 3.6, 0.9); pl.position.set(0, 3.0, 1.46); g.add(pl);
  const pao = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 2.6, 6, 16), mat('#e0a050')); pao.rotation.z = Math.PI / 2; pao.position.set(-0.4, 3.9, -0.8); sombra(pao); g.add(pao);
  for (const x of [-1.4, -0.4, 0.6]) g.add(caixa(0.12, 0.12, 0.9, '#a65e1e', x, 4.45, -0.8));
  g.add(caixa(0.7, 1.6, 0.7, '#b85a3a', 2, 3.2, -1.8)); g.userData.fumaca = [2, 5, -1.8];
  return g;
};
LUGAR.feira = () => {
  const g = new THREE.Group();
  g.add(caixa(8.4, 0.06, 8.4, '#e9d9b0', 0, 0, 0));
  const cores = [['#2b8fd6', ['#ff9a1f', '#e8342e', '#ffd23f']], ['#2bb673', ['#7bc950', '#ff8a1a', '#8e2c6b']], ['#e84a3c', ['#e8432f', '#ffe27a', '#3fa34d']]];
  [[-2.4, -1.6], [2.2, -0.8], [-0.6, 2.2]].forEach(([x, z], i) => {
    const b = new THREE.Group();
    for (const [px, pz] of [[-1.3, -0.8], [1.3, -0.8], [-1.3, 0.8], [1.3, 0.8]]) b.add(cilindro(0.06, 0.06, 2.4, '#8a8a8a', px, 0, pz, 6));
    b.add(caixa(2.6, 0.9, 1.4, '#c98a4b', 0, 0, 0));
    cores[i][1].forEach((c, k) => { for (let n = 0; n < 4; n++) b.add(bola(0.18, c, -0.8 + k * 0.8 + (n % 2) * 0.2, 1.05 + (n > 1 ? 0.15 : 0), -0.2 + (n % 2) * 0.3)); });
    const tl = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), new THREE.MeshStandardMaterial({ map: texturaListras(cores[i][0], '#ffffff', 8), side: THREE.DoubleSide }));
    tl.rotation.x = -Math.PI / 2 + 0.25; tl.position.y = 2.5; tl.castShadow = true; b.add(tl);
    b.position.set(x, 0, z); b.rotation.y = (i - 1) * 0.35; g.add(b);
  });
  // bandeirinhas
  g.add(cilindro(0.07, 0.07, 3.4, '#8a5a2b', -4, 0, 3.6, 6)); g.add(cilindro(0.07, 0.07, 3.4, '#8a5a2b', 4, 0, -3.6, 6));
  const bc = ['#e84a3c', '#ffc93c', '#2bb673', '#3aa0e8', '#ff5e9c', '#8e6bff'], bandeiras = [];
  for (let i = 0; i < 12; i++) {
    const f = i / 11, x = -4 + 8 * f, z = 3.6 - 7.2 * f, y = 3.3 - Math.sin(f * Math.PI) * 0.6;
    const t = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 3), mat(bc[i % 6])); t.rotation.x = Math.PI; t.position.set(x, y - 0.2, z); g.add(t); bandeiras.push(t);
  }
  g.userData.bandeiras = bandeiras;
  return g;
};
LUGAR.galinheiro = () => {
  const g = new THREE.Group();
  for (const [x, z] of [[-1.5, -2], [1.5, -2], [-1.5, 0.2], [1.5, 0.2]]) g.add(caixa(0.22, 1, 0.22, '#a8692f', x, 0, z));
  g.add(caixa(3.4, 2, 2.6, '#e0a050', 0, 1, -0.9));
  const t = telhado(4, 1.4, 3.2, '#7d6b5d', 3); t.position.z = -0.9; g.add(t);
  g.add(caixa(0.9, 1.1, 0.06, '#5b3415', -0.6, 1.2, 0.42));
  const r = caixa(0.9, 0.08, 2.4, '#d99a4c', -0.6, 0, 1.4); r.rotation.x = 0.45; r.position.y = 0.55; g.add(r);
  g.add(caixa(1.4, 0.8, 1.2, '#d48f45', 2.4, 1, -0.9)); g.add(bola(0.18, '#fff4e0', 2.3, 1.95, -0.6)); g.add(bola(0.18, '#f3d9b5', 2.6, 1.95, -0.7));
  const galinhas = [];
  for (let i = 0; i < 3; i++) {
    const gl = new THREE.Group(); gl.add(bola(0.32, '#ffffff', 0, 0.38, 0)); gl.add(bola(0.18, '#ffffff', 0.3, 0.7, 0)); gl.add(caixa(0.1, 0.14, 0.06, '#e84a3c', 0.3, 0.84, 0)); gl.add(caixa(0.12, 0.05, 0.06, '#ffb21a', 0.48, 0.66, 0));
    gl.position.set(-2 + i * 1.6, 0, 2.6 - i * 0.4); gl.userData.base = gl.position.clone(); gl.userData.fase = i * 2; galinhas.push(gl); g.add(gl);
  }
  g.userData.galinhas = galinhas;
  return g;
};
LUGAR.vaca = () => {
  const g = new THREE.Group();
  g.add(caixa(4.6, 3, 4, '#d6403a', -0.6, 0, -1));
  const t = telhado(5.2, 2.2, 4.6, '#5f5853', 3); t.position.set(-0.6, 3, -1); t.position.y = 3; g.add(t);
  g.add(caixa(1.8, 2.2, 0.1, '#a92f2a', -0.6, 0, 1.02));
  const x1 = caixa(2.6, 0.14, 0.12, '#ffffff', -0.6, 1, 1.08); x1.rotation.z = 0.88; g.add(x1);
  const x2 = caixa(2.6, 0.14, 0.12, '#ffffff', -0.6, 1, 1.08); x2.rotation.z = -0.88; g.add(x2);
  // cata-vento
  g.add(cilindro(0.08, 0.25, 6, '#e8e8e8', 3, 0, -2.4, 6));
  const pas = new THREE.Group(); for (let i = 0; i < 6; i++) { const p = caixa(0.25, 1.6, 0.04, '#f4f4f4'); p.position.y = 0.8; const h = new THREE.Group(); h.add(p); h.rotation.z = i * Math.PI / 3; pas.add(h); }
  pas.position.set(3, 6, -2.2); g.add(pas); g.userData.pas = pas;
  // a vaca Mimosa
  const v = new THREE.Group();
  v.add(caixa(1.8, 0.9, 0.9, '#ffffff', 0, 0.7, 0)); v.add(caixa(0.5, 0.5, 0.02, '#222', -0.3, 1.0, 0.46)); v.add(caixa(0.4, 0.4, 0.02, '#222', 0.4, 0.8, -0.46));
  for (const [x, z] of [[-0.7, -0.3], [0.7, -0.3], [-0.7, 0.3], [0.7, 0.3]]) v.add(caixa(0.18, 0.7, 0.18, '#eeeeee', x, 0, z));
  const cab = new THREE.Group(); cab.add(caixa(0.6, 0.6, 0.6, '#ffffff')); cab.add(caixa(0.3, 0.25, 0.5, '#ffb3c1', 0.3, 0.05, 0)); cab.position.set(1.1, 1.05, 0); v.add(cab);
  v.position.set(2.2, 0, 2.2); v.rotation.y = -0.6; g.add(v); g.userData.cabecaVaca = cab;
  return g;
};
LUGAR.pomar = () => {
  const g = new THREE.Group(); cerca(g, 8.4);
  g.userData.arvores = [];
  [[-2.2, -2, '#5cbf4a', '#ff8c1a'], [2, -1.8, '#4fae45', '#e8342e'], [-1.8, 2, '#66c653', '#ffd23f'], [2.2, 2.2, '#5cbf4a', '#e8342e']].forEach(([x, z, c, f]) => {
    const a = arvore(x, z, c, [f, f, f, f, f]); g.add(a); g.userData.arvores.push(a.userData.balanca);
  });
  return g;
};
LUGAR.horta = () => {
  const g = new THREE.Group(); cerca(g, 8.4);
  [-2.4, 0, 2.4].forEach((z, i) => {
    g.add(caixa(7, 0.35, 1.3, '#8b5a33', 0, 0, z));
    for (let k = 0; k < 6; k++) {
      const x = -2.9 + k * 1.15;
      if (i === 0) { const f = sombra(new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 6), mat('#3f9a2e'))); f.position.set(x, 0.7, z); g.add(f); g.add(bola(0.12, '#ff8a1a', x, 0.4, z)); }
      else if (i === 1) g.add(bola(0.42, '#7bc950', x, 0.6, z, { flatShading: true }));
      else { g.add(bola(0.3, '#e8432f', x, 0.75, z)); g.add(cilindro(0.04, 0.04, 0.9, '#3f9a2e', x - 0.2, 0.3, z)); }
    }
  });
  return g;
};
LUGAR.rio = () => {
  const g = new THREE.Group();
  const agua = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 8.2, 24, 24), mat('#3aa0e8', { roughness: 0.15, metalness: 0.1, emissive: '#1b6aa8', emissiveIntensity: 0.15 }));
  agua.rotation.x = -Math.PI / 2; agua.position.y = 0.08; agua.receiveShadow = true; g.add(agua); g.userData.agua = agua;
  g.add(caixa(8.6, 0.05, 8.6, '#d9c08a', 0, 0, 0));   // areia na beira
  for (const [x, z, s] of [[-3.2, 3, 0.5], [3.4, -3, 0.6], [3, 3.3, 0.4]]) { const p = bola(s, '#9aa5b4', x, 0.15, z, { flatShading: true }); p.scale.y = 0.6; g.add(p); }
  for (const [x, z] of [[-3.6, -2.4], [-3.4, -2], [-3.7, -1.6]]) g.add(cilindro(0.05, 0.05, 1.4, '#3f8f2e', x, 0, z, 5));
  g.add(caixa(1.4, 0.15, 3.2, '#c98a4b', 2.6, 0.35, 2.4));   // trapiche
  for (const [x, z] of [[2, 1], [3.2, 1], [2, 3.8], [3.2, 3.8]]) g.add(cilindro(0.1, 0.1, 0.5, '#8a5a2b', x, 0, z, 6));
  const peixe = new THREE.Group(); const corpo = bola(0.35, '#ff9f43', 0, 0, 0); corpo.scale.set(1.5, 0.7, 0.5); peixe.add(corpo);
  const rabo = sombra(new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.4, 3), mat('#ff9f43'))); rabo.rotation.z = Math.PI / 2; rabo.position.x = -0.6; peixe.add(rabo);
  peixe.visible = false; g.add(peixe); g.userData.peixe = peixe;
  return g;
};

// ---------- personagens e carros ----------
function cozinheiro() {
  const g = new THREE.Group();
  const p1 = caixa(0.22, 0.6, 0.22, '#3a5a8c', -0.14, 0, 0), p2 = caixa(0.22, 0.6, 0.22, '#3a5a8c', 0.14, 0, 0);
  const pernas = [new THREE.Group(), new THREE.Group()]; pernas[0].add(p1); pernas[1].add(p2); p1.position.y = -0.3; p2.position.y = -0.3; pernas.forEach(pp => { pp.position.y = 0.6; g.add(pp); });
  g.add(cilindro(0.34, 0.4, 0.8, '#ff8a3d', 0, 0.55, 0));
  g.add(caixa(0.36, 0.5, 0.05, '#ffffff', 0, 0.75, 0.37));
  g.add(bola(0.32, '#f6c9a3', 0, 1.62, 0));
  g.add(cilindro(0.3, 0.26, 0.32, '#ffffff', 0, 1.86, 0)); g.add(bola(0.34, '#ffffff', 0, 2.25, 0));
  const cesta = caixa(0.42, 0.28, 0.3, '#c98a4b', 0.5, 0.5, 0.1); g.add(cesta);
  g.userData.pernas = pernas; g.scale.setScalar(1.15);
  return g;
}
function carro(cor) {
  const g = new THREE.Group();
  g.add(caixa(1.9, 0.6, 1, cor, 0, 0.25, 0)); g.add(caixa(1.1, 0.5, 0.9, cor, -0.15, 0.85, 0));
  g.add(caixa(1.12, 0.36, 0.92, '#bfe9ff', -0.15, 0.92, 0, { roughness: 0.2 }));
  for (const [x, z] of [[-0.6, 0.5], [0.6, 0.5], [-0.6, -0.5], [0.6, -0.5]]) { const r = cilindro(0.24, 0.24, 0.16, '#222', x, 0, z, 12); r.rotation.x = Math.PI / 2; r.position.y = 0.24; g.add(r); }
  return g;
}

// ---------- montar ----------
function montar(el, op) {
  op = op || {};
  const host = el.querySelector('.cidade3d'); if (!host) return;
  const retrato = el.clientHeight > el.clientWidth * 1.05;
  const grade = retrato ? RETRATO : PAISAGEM;
  if (R && R.host === host && R.retrato === retrato) { R.op = op; acharRotulos(el); porNaPorta(op.pos || 'casa'); continuar(); return; }
  pausar();
  if (R && R.renderer) R.renderer.dispose();
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.innerHTML = ''; host.appendChild(renderer.domElement);
  const cena = new THREE.Scene(); cena.background = new THREE.Color('#bfe8ff');
  const cols = grade[0].length, linhas = grade.length, W = cols * PASSO, D = linhas * PASSO;
  const cam = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 400);
  cena.add(new THREE.HemisphereLight('#ffffff', '#6fae4a', 1.1));
  const sol = new THREE.DirectionalLight('#fff4dc', 1.6); sol.position.set(-20, 40, 25); sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024); const sc = sol.shadow.camera; const ext = Math.max(W, D) * 0.75; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.far = 140; sol.shadow.bias = -0.0005;
  cena.add(sol);
  // chão, ruas e calçadas
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(W + 60, D + 60), mat('#8fd16a')); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; cena.add(chao);
  const xs = [], zs = [];
  for (let c = 0; c <= cols; c++) xs.push(-W / 2 + c * PASSO);
  for (let r = 0; r <= linhas; r++) zs.push(-D / 2 + r * PASSO);
  const ruaMat = mat('#6f747c', { roughness: 0.95 }), faixa = mat('#ffffff');
  zs.forEach(z => { const m = new THREE.Mesh(new THREE.BoxGeometry(W + 3, 0.05, 3), ruaMat); m.position.set(0, 0.02, z); m.receiveShadow = true; cena.add(m); for (let x = -W / 2; x < W / 2; x += 2.2) { const f = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.02, 0.14), faixa); f.position.set(x + 0.6, 0.06, z); cena.add(f); } });
  xs.forEach(x => { const m = new THREE.Mesh(new THREE.BoxGeometry(3, 0.05, D + 3), ruaMat); m.position.set(x, 0.021, 0); m.receiveShadow = true; cena.add(m); for (let z = -D / 2; z < D / 2; z += 2.2) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 1.1), faixa); f.position.set(x, 0.061, z + 0.6); cena.add(f); } });
  // lotes: base de grama mais clara, com meio-fio, e o lugar em cima
  const lotes = {}, animados = [];
  grade.forEach((linha, r) => linha.forEach((id, c) => {
    const x = -W / 2 + c * PASSO + PASSO / 2, z = -D / 2 + r * PASSO + PASSO / 2;
    cena.add(caixa(LOTE + 0.6, 0.25, LOTE + 0.6, '#d9d3c7', x, 0, z));
    cena.add(caixa(LOTE, 0.3, LOTE, id === 'rio' ? '#d9c08a' : '#9ee07a', x, 0, z));
    const g = (LUGAR[id] || (() => new THREE.Group()))(op); g.position.set(x, 0.3, z);
    g.traverse(o => { o.userData.lugar = id; });
    cena.add(g); lotes[id] = { g, x, z, porta: new THREE.Vector3(x + 2.2, 0.06, z + PASSO / 2) }; animados.push(g);
    // árvores e postes nas esquinas do lote
    const pst = cilindro(0.08, 0.08, 3, '#555', x - LOTE / 2 - 0.9, 0, z + LOTE / 2 + 0.9, 6); cena.add(pst); cena.add(bola(0.22, '#fff6c8', x - LOTE / 2 - 0.9, 3.05, z + LOTE / 2 + 0.9, { emissive: '#ffe58a', emissiveIntensity: 0.6 }));
  }));
  // árvores em volta da cidade
  for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2, rx = W / 2 + 4 + (i % 3), rz = D / 2 + 4 + ((i + 1) % 3); cena.add(arvore(Math.cos(a) * rx, Math.sin(a) * rz, ['#5cbf4a', '#4fae45', '#66c653'][i % 3], [], 1.6 + (i % 3) * 0.3)); }
  // fumaça das chaminés
  const fumacas = [];
  Object.values(lotes).forEach(L => { const f = L.g.userData.fumaca; if (!f) return; for (let i = 0; i < 3; i++) { const b = bola(0.35, '#ffffff', L.x + f[0], 0.3 + f[1], L.z + f[2], { transparent: true, opacity: 0.8 }); b.castShadow = false; b.userData.f = i / 3; b.userData.o = [L.x + f[0], 0.3 + f[1], L.z + f[2]]; fumacas.push(b); cena.add(b); } });
  // carros rodando pelas ruas (um na volta de fora, um na rua do meio)
  const voltaFora = [[xs[0], zs[0]], [xs[cols], zs[0]], [xs[cols], zs[linhas]], [xs[0], zs[linhas]]];
  const meio = Math.floor(linhas / 2), voltaMeio = [[xs[0], zs[meio]], [xs[cols], zs[meio]], [xs[cols], zs[linhas]], [xs[0], zs[linhas]]];
  const carros = [{ m: carro('#e84a3c'), rota: voltaFora, t: 0, vel: 5.5 }, { m: carro('#3aa0e8'), rota: voltaFora, t: 0.5, vel: 5.5 }, { m: carro('#ffc93c'), rota: voltaMeio, t: 0.25, vel: 4.5 }];
  carros.forEach(c => { c.len = rotaLen(c.rota); cena.add(c.m); });
  const chef = cozinheiro(); cena.add(chef);
  R = { host, el, retrato, renderer, cena, cam, sol, lotes, xs, zs, W, D, carros, chef, fumacas, op, az: retrato ? 0.18 : 0.14, azAlvo: null, zoom: 1, rodando: false, anda: null, t0: performance.now(), rotulos: {} };
  ajustarTamanho(); acharRotulos(el); porNaPorta(op.pos || 'casa'); interacao(); continuar();
}
function rotaLen(r) { let s = 0; for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length]; s += Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]); } return s; }
function naRota(r, d) {
  let s = d;
  for (let i = 0; i < r.length; i++) {
    const a = r[i], b = r[(i + 1) % r.length], l = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
    if (s <= l) { const f = s / l; return { x: a[0] + (b[0] - a[0]) * f, z: a[1] + (b[1] - a[1]) * f, ang: Math.atan2(-(b[1] - a[1]), b[0] - a[0]) }; }
    s -= l;
  }
  return { x: r[0][0], z: r[0][1], ang: 0 };
}
function acharRotulos(el) {
  R.rotulos = {};
  el.querySelectorAll('[data-lugar]').forEach(b => { R.rotulos[b.getAttribute('data-lugar')] = b; });
}

// ---------- câmera: vista de cima inclinada, girando em volta do centro; enquadra a cidade inteira ----------
function ajustarTamanho() {
  if (!R) return;
  const w = R.host.clientWidth || 300, h = R.host.clientHeight || 300;
  R.renderer.setSize(w, h, false); R.w = w; R.h = h;
}
function posicionarCamera() {
  const el = R.retrato ? 1.0 : 0.95, dist = 120, c = R.cam;
  c.position.set(Math.sin(R.az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.cos(R.az) * Math.cos(el) * dist);
  c.lookAt(0, 0, 0); c.updateMatrixWorld();
  // enquadra: projeta os cantos da cidade (com a altura dos prédios) no espaço da câmera
  const inv = c.matrixWorldInverse, pts = [];
  for (const x of [-R.W / 2 + 1, R.W / 2 - 1]) for (const z of [-R.D / 2 + 1, R.D / 2 - 1]) for (const y of [0, 4]) pts.push(new THREE.Vector3(x, y, z).applyMatrix4(inv));
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  pts.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); });
  const cw = x1 - x0, ch = y1 - y0, asp = R.w / R.h;
  let hw = cw / 2, hh = ch / 2;
  if (hw / hh > asp) hh = hw / asp; else hw = hh * asp;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  c.left = cx - hw; c.right = cx + hw; c.top = cy + hh; c.bottom = cy - hh; c.zoom = R.zoom; c.updateProjectionMatrix();
}
function interacao() {
  const cv = R.renderer.domElement; let ini = null, toques = {}, dist0 = 0, zoom0 = 1;
  cv.style.touchAction = 'none';
  cv.addEventListener('pointerdown', e => { toques[e.pointerId] = [e.clientX, e.clientY]; ini = { x: e.clientX, y: e.clientY, az: R.az, mexeu: false }; const k = Object.values(toques); if (k.length === 2) { dist0 = Math.hypot(k[0][0] - k[1][0], k[0][1] - k[1][1]); zoom0 = R.zoom; } try { cv.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } });
  cv.addEventListener('pointermove', e => {
    if (!toques[e.pointerId]) return; toques[e.pointerId] = [e.clientX, e.clientY];
    const k = Object.values(toques);
    if (k.length === 2 && dist0) { R.zoom = Math.max(0.8, Math.min(2.6, zoom0 * Math.hypot(k[0][0] - k[1][0], k[0][1] - k[1][1]) / dist0)); ini && (ini.mexeu = true); continuar(); return; }
    if (!ini) return; const dx = e.clientX - ini.x;
    if (Math.abs(dx) > 8) ini.mexeu = true;
    if (ini.mexeu) { R.az = ini.az - dx / R.w * Math.PI; R.azAlvo = null; continuar(); }
  });
  const fim = e => {
    delete toques[e.pointerId];
    if (ini && !ini.mexeu && Object.keys(toques).length === 0) tocar(e);
    if (!Object.keys(toques).length) ini = null;
  };
  cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', e => { delete toques[e.pointerId]; ini = null; });
  cv.addEventListener('wheel', e => { e.preventDefault(); R.zoom = Math.max(0.8, Math.min(2.6, R.zoom * (e.deltaY < 0 ? 1.1 : 0.9))); continuar(); }, { passive: false });
}
function tocar(e) {
  const r = R.renderer.domElement.getBoundingClientRect(), v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  const rc = new THREE.Raycaster(); rc.setFromCamera(v, R.cam);
  const hit = rc.intersectObjects(Object.values(R.lotes).map(L => L.g), true)[0];
  if (hit && hit.object.userData.lugar && R.op.aoTocar) R.op.aoTocar(hit.object.userData.lugar);
}
function girar(passo) { R.azAlvo = (R.azAlvo == null ? R.az : R.azAlvo) + passo * Math.PI / 2; continuar(); }

// ---------- quem anda ----------
function porNaPorta(id) {
  const L = R && R.lotes[id]; if (!L) return;
  R.anda = null; R.chef.position.copy(L.porta); R.chef.rotation.y = 0; R.pos = id;
}
function andar(id, aoChegar) {
  const de = R.lotes[R.pos || 'casa'], ate = R.lotes[id];
  if (!de || !ate || R.op.instantaneo) { if (ate) porNaPorta(id); aoChegar && aoChegar(); return; }
  const a = de.porta, b = ate.porta, cam = [a.clone()];
  if (Math.abs(a.z - b.z) > 0.1) {
    const vx = R.xs.slice().sort((p, q) => (Math.abs(a.x - p) + Math.abs(p - b.x)) - (Math.abs(a.x - q) + Math.abs(q - b.x)))[0];
    cam.push(new THREE.Vector3(vx, a.y, a.z), new THREE.Vector3(vx, a.y, b.z));
  }
  cam.push(b.clone());
  let tot = 0; const seg = []; for (let i = 1; i < cam.length; i++) { const l = cam[i].distanceTo(cam[i - 1]); seg.push(l); tot += l; }
  R.anda = { cam, seg, tot, d: 0, vel: Math.max(8, tot / 2.4), id, aoChegar };
  R.pos = id; continuar();
}

// ---------- o laço de desenho ----------
let raf = 0, ultimo = 0;
function continuar() { if (!R || R.rodando) return; R.rodando = true; ultimo = performance.now(); raf = requestAnimationFrame(quadro); }
function pausar() { if (R) R.rodando = false; cancelAnimationFrame(raf); }
function quadro(agora) {
  if (!R || !R.rodando) return;
  if (!R.host.isConnected || R.host.offsetParent === null) { R.rodando = false; return; }
  const dtReal = Math.min(0.25, (agora - ultimo) / 1000), dt = Math.min(0.05, dtReal); ultimo = agora; const t = (agora - R.t0) / 1000;   // dtReal: o andar dura o mesmo em aparelho lento
  if (R.host.clientWidth !== R.w || R.host.clientHeight !== R.h) ajustarTamanho();
  if (R.azAlvo != null) { const d = R.azAlvo - R.az; if (Math.abs(d) < 0.01) { R.az = R.azAlvo; R.azAlvo = null; } else R.az += d * Math.min(1, dt * 6); }
  posicionarCamera();
  // carros
  R.carros.forEach(c => { c.t = (c.t + dt * c.vel / c.len) % 1; const p = naRota(c.rota, c.t * c.len); c.m.position.set(p.x, 0.06, p.z); c.m.rotation.y = p.ang; });
  // o cozinheirinho andando
  const ch = R.chef, pernas = ch.userData.pernas;
  if (R.anda) {
    const A = R.anda; A.d = Math.min(A.tot, A.d + dtReal * A.vel);
    let s = A.d, i = 0; while (i < A.seg.length - 1 && s > A.seg[i]) { s -= A.seg[i]; i++; }
    const p0 = A.cam[i], p1 = A.cam[i + 1], f = A.seg[i] ? Math.min(1, s / A.seg[i]) : 1;
    ch.position.lerpVectors(p0, p1, f); ch.rotation.y = Math.atan2(p1.x - p0.x, p1.z - p0.z);
    pernas[0].rotation.x = Math.sin(t * 14) * 0.6; pernas[1].rotation.x = -Math.sin(t * 14) * 0.6; ch.position.y = 0.06 + Math.abs(Math.sin(t * 14)) * 0.12;
    if (A.d >= A.tot) { R.anda = null; pernas.forEach(p => { p.rotation.x = 0; }); ch.rotation.y = Math.PI; const cb = A.aoChegar; setTimeout(() => cb && cb(), 160); }
  } else { ch.position.y = 0.06 + Math.sin(t * 3) * 0.03; }
  // animações dos lugares
  Object.values(R.lotes).forEach(L => {
    const u = L.g.userData;
    if (u.pas) u.pas.rotation.z = t * 1.6;
    if (u.cabecaVaca) u.cabecaVaca.rotation.z = -0.25 - Math.max(0, Math.sin(t * 0.8)) * 0.35;
    if (u.galinhas) u.galinhas.forEach(gl => { const k = t * 0.6 + gl.userData.fase; gl.position.x = gl.userData.base.x + Math.sin(k) * 0.8; gl.position.z = gl.userData.base.z + Math.cos(k * 0.7) * 0.4; gl.rotation.y = Math.cos(k) > 0 ? 0 : Math.PI; gl.children[1].position.y = 0.7 - Math.max(0, Math.sin(t * 3 + gl.userData.fase)) * 0.25; });
    if (u.arvores) u.arvores.forEach((a, i) => { a.rotation.z = Math.sin(t * 1.2 + i) * 0.04; });
    if (u.bandeiras) u.bandeiras.forEach((b, i) => { b.rotation.z = Math.sin(t * 2 + i) * 0.3; });
    if (u.agua) { const pos = u.agua.geometry.attributes.position; for (let k = 0; k < pos.count; k++) pos.setZ(k, Math.sin(pos.getX(k) * 1.3 + t * 1.6) * 0.05 + Math.cos(pos.getY(k) * 1.1 + t) * 0.05); pos.needsUpdate = true; }
    if (u.peixe) { const ciclo = (t % 4) / 4; if (ciclo > 0.6) { const f = (ciclo - 0.6) / 0.4; u.peixe.visible = true; u.peixe.position.set(-1.5 + f * 2.4, 0.3 + Math.sin(f * Math.PI) * 1.6, -0.8); u.peixe.rotation.z = Math.cos(f * Math.PI) * 0.9; } else u.peixe.visible = false; }
  });
  R.fumacas.forEach(b => { const f = (b.userData.f + t * 0.25) % 1; b.position.set(b.userData.o[0] + f * 0.8, b.userData.o[1] + f * 2.4, b.userData.o[2]); b.scale.setScalar(0.6 + f * 1.4); b.material.opacity = 0.8 * (1 - f); });
  R.renderer.render(R.cena, R.cam);
  // os nomes (botões do app) em cima de cada prédio
  const v = new THREE.Vector3();
  Object.keys(R.rotulos).forEach(id => {
    const L = R.lotes[id], b = R.rotulos[id]; if (!L || !b) return;
    v.set(L.x, 0.4, L.z + LOTE / 2 - 0.4).project(R.cam);
    const x = (v.x + 1) / 2 * R.w, y = (1 - v.y) / 2 * R.h;
    b.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px) translate(-50%, -100%)';
  });
  raf = requestAnimationFrame(quadro);
}

window.Cidade3D = { suportado, montar, andar, porNaPorta, pausar, continuar, girar, estado: () => R && { pos: R.pos, andando: !!R.anda, az: R.az } };
window.dispatchEvent(new Event('cidade3d-pronta'));
