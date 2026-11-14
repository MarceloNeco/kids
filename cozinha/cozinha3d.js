/* Mão na Massa — a cozinha em 3D (v0.13.0, "3D em tudo"): enquanto a criança escolhe o utensílio, a cozinha de casa
   aparece em 3D (three.js, libs/, MIT): piso xadrez, bancada com pia e fogão (forno embaixo), geladeira, armários, janela,
   ilha no meio e a mesa da família. O cozinheirinho anda até a estação do passo (pia, fogão, geladeira, bancada, mesa) e
   ela acende. Um só desenho fica vivo entre os passos: o app pede anexar(caixa) a cada tela e o canvas muda de lugar.
   API: window.Cozinha3D = { suportado(), anexar(el, estacao), ir(estacao, aoChegar), soltar() }. */
import * as THREE from './libs/three.module.min.js';

function suportado() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
const M = {};
function mat(cor, op) { const k = cor + JSON.stringify(op || {}); if (!M[k]) M[k] = new THREE.MeshStandardMaterial(Object.assign({ color: cor, roughness: 0.65 }, op || {})); return M[k]; }
function sh(m) { m.castShadow = true; m.receiveShadow = true; return m; }
function caixa(w, h, d, cor, x, y, z, op) { const m = sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(cor, op))); m.position.set(x, y + h / 2, z); return m; }
function cil(r1, r2, h, cor, x, y, z, op) { const m = sh(new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 20), mat(cor, op))); m.position.set(x, y + h / 2, z); return m; }
function bola(r, cor, x, y, z, op) { const m = sh(new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat(cor, op))); m.position.set(x, y, z); return m; }

// onde o cozinheirinho fica em cada estação (x, z) e para onde olha
const EST = { porta: [3.2, 3.2, Math.PI * 0.75], pia: [-1.2, -1.3, Math.PI], fogao: [1.3, -1.3, Math.PI], geladeira: [3.1, -1.0, Math.PI * 0.8], bancada: [0, 0.9, Math.PI], mesa: [2.6, 2.2, -Math.PI / 2] };
let R = null;

function chef() {
  const g = new THREE.Group(), pele = '#f6c9a3';
  const pernas = [-0.14, 0.14].map(x => { const p = new THREE.Group(); p.position.set(x, 0.6, 0); p.add(caixa(0.2, 0.6, 0.22, '#3a5a8c', 0, -0.6, 0)); g.add(p); return p; });
  const tronco = sh(new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.45, 6, 16), mat('#ff8a3d'))); tronco.position.y = 0.95; g.add(tronco);
  g.add(caixa(0.4, 0.55, 0.05, '#ffffff', 0, 0.62, 0.3));
  g.add(bola(0.34, pele, 0, 1.62, 0)); g.add(bola(0.05, '#3b2412', -0.12, 1.66, 0.3)); g.add(bola(0.05, '#3b2412', 0.12, 1.66, 0.3));
  g.add(caixa(0.14, 0.03, 0.02, '#9b2c3c', 0, 1.5, 0.32));
  g.add(cil(0.3, 0.27, 0.32, '#ffffff', 0, 1.86, 0)); g.add(bola(0.36, '#ffffff', 0, 2.25, 0));
  const bracos = [-1, 1].map(l => { const b = new THREE.Group(); b.position.set(l * 0.36, 1.2, 0); b.add(caixa(0.15, 0.5, 0.15, '#ff8a3d', 0, -0.5, 0)); b.add(bola(0.1, pele, 0, -0.55, 0)); g.add(b); return b; });
  g.userData = { pernas, bracos };
  return g;
}

function montar() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const cena = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-6, 6, 6, -6, 0.1, 100);
  cena.add(new THREE.HemisphereLight('#ffffff', '#c7b49a', 1.05));
  const sol = new THREE.DirectionalLight('#fff3df', 1.5); sol.position.set(6, 12, 8); sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024);
  Object.assign(sol.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); cena.add(sol);
  // piso xadrez
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d');
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? '#3b3b4f' : '#f4f1ea'; x.fillRect(i * 32, j * 32, 32, 32); }
  const tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2.5, 2.5); tex.colorSpace = THREE.SRGBColorSpace;
  const piso = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 8), [mat('#7c6a58'), mat('#7c6a58'), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }), mat('#7c6a58'), mat('#9b8670'), mat('#9b8670')]);
  piso.position.set(0.5, -0.15, 0.5); piso.receiveShadow = true; cena.add(piso);
  // paredes do fundo e da esquerda
  cena.add(caixa(9, 4.2, 0.2, '#c4ecf5', 0.5, 0, -3.6)); cena.add(caixa(0.2, 4.2, 8, '#9fd8e8', -4.1, 0, 0.5));
  cena.add(caixa(1.6, 1.3, 0.05, '#bfe9ff', -0.2, 2.2, -3.48, { emissive: '#6aa8d8', emissiveIntensity: 0.3 })); cena.add(caixa(1.7, 0.08, 0.15, '#ffffff', -0.2, 2.15, -3.45));
  // bancada do fundo: armários, tampo, pia e fogão (com forno), armários de cima
  cena.add(caixa(5.4, 1.1, 1.1, '#ffd76a', -0.5, 0, -2.9)); cena.add(caixa(5.6, 0.12, 1.25, '#f4f1ea', -0.5, 1.1, -2.9));
  const pia = new THREE.Group(); pia.add(caixa(1.1, 0.06, 0.7, '#a9b6c4', 0, 1.2, 0, { metalness: 0.4, roughness: 0.3 })); pia.add(cil(0.05, 0.05, 0.5, '#c9d2dc', 0, 1.2, -0.42, { metalness: 0.8 }));
  const agua = cil(0.03, 0.04, 0.4, '#7fcfff', 0, 1.25, -0.2, { transparent: true, opacity: 0.7 }); agua.visible = false; pia.add(agua); pia.position.set(-1.2, 0, -2.9); cena.add(pia);
  const fogao = new THREE.Group(); fogao.add(caixa(1.2, 0.05, 0.9, '#2d2d3a', 0, 1.2, 0));
  const chamas = []; for (const [fx, fz] of [[-0.28, -0.2], [0.28, -0.2], [-0.28, 0.2], [0.28, 0.2]]) { fogao.add(cil(0.15, 0.15, 0.02, '#555', fx, 1.25, fz)); const ch = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25, 10), mat('#3aa0ff', { emissive: '#2a7aff', emissiveIntensity: 1, transparent: true, opacity: 0.85 })); ch.position.set(fx, 1.4, fz); ch.visible = false; fogao.add(ch); chamas.push(ch); }
  fogao.add(caixa(1.1, 0.75, 0.04, '#2d2d3a', 0, 0.2, 0.56)); const vidro = caixa(0.8, 0.45, 0.02, '#ffb347', 0, 0.33, 0.585, { emissive: '#ff8a1a', emissiveIntensity: 0.4 }); fogao.add(vidro);
  fogao.position.set(1.3, 0, -2.9); cena.add(fogao);
  cena.add(caixa(5.4, 0.9, 0.6, '#ffffff', -0.5, 2.6, -3.25));
  // geladeira
  const gel = new THREE.Group(); gel.add(caixa(1.2, 3.2, 1.1, '#8fc9ff', 0, 0, 0, { roughness: 0.35 })); gel.add(caixa(1.18, 0.04, 0.02, '#5a8fc9', 0, 1.9, 0.56));
  gel.add(caixa(0.06, 0.6, 0.06, '#ffffff', -0.4, 2.3, 0.58)); gel.add(caixa(0.06, 0.6, 0.06, '#ffffff', -0.4, 1.0, 0.58)); gel.position.set(3.4, 0, -2.85); cena.add(gel);
  // ilha no meio com tábua, tigela e frutas
  const ilha = new THREE.Group(); ilha.add(caixa(2.2, 1.0, 1.1, '#e84a3c', 0, 0, 0)); ilha.add(caixa(2.4, 0.1, 1.3, '#fff6e0', 0, 1.0, 0));
  ilha.add(caixa(0.8, 0.06, 0.5, '#d9a066', -0.4, 1.1, 0)); const tig = cil(0.32, 0.2, 0.25, '#bfe9ff', 0.6, 1.1, 0, { transparent: true, opacity: 0.75, roughness: 0.1 }); ilha.add(tig);
  ilha.add(bola(0.12, '#ff9f1a', 0.1, 1.22, 0.3)); ilha.add(bola(0.12, '#e8342e', 0.3, 1.22, 0.35));
  ilha.position.set(0, 0, 0); cena.add(ilha);
  // mesa da família com cadeiras e pratos
  const mesa = new THREE.Group(); mesa.add(caixa(1.8, 0.1, 1.2, '#c98a4b', 0, 0.8, 0)); for (const [mx, mz] of [[-0.8, -0.5], [0.8, -0.5], [-0.8, 0.5], [0.8, 0.5]]) mesa.add(caixa(0.1, 0.8, 0.1, '#8a5a2b', mx, 0, mz));
  for (const [px, pz] of [[-0.45, -0.3], [0.45, -0.3], [-0.45, 0.3], [0.45, 0.3]]) mesa.add(cil(0.22, 0.18, 0.04, '#ffffff', px, 0.9, pz));
  for (const [cx, cz] of [[0, -1.0], [0, 1.0]]) mesa.add(caixa(0.6, 0.08, 0.6, '#2bb673', cx, 0.45, cz));
  mesa.position.set(2.6, 0, 3.2); cena.add(mesa);
  // vaso de planta
  cena.add(cil(0.25, 0.2, 0.45, '#c96a3a', -3.5, 0, 3.3)); cena.add(bola(0.45, '#4caf50', -3.5, 0.85, 3.3, { flatShading: true }));
  const ch = chef(); cena.add(ch);
  const ESTA = { pia, fogao, geladeira: gel, bancada: ilha, mesa };
  R = { renderer, cena, cam, ch, ESTA, agua, chamas, vidro, pos: 'porta', anda: null, raf: 0, ultimo: performance.now(), t: 0, host: null };
  porEm('porta');
}
function porEm(id) { const e = EST[id] || EST.porta; R.ch.position.set(e[0], 0, e[1]); R.ch.rotation.y = e[2]; R.pos = id; acender(id); }
function acender(id) {
  Object.keys(R.ESTA).forEach(k => R.ESTA[k].traverse(o => { if (o.material && o.material.emissive && !o.userData.emi0) o.userData.emi0 = o.material; }));
  R.agua.visible = id === 'pia'; R.chamas.forEach(c => { c.visible = id === 'fogao'; });
  R.luz = id;
}
function tamanho() {
  const w = R.host.clientWidth || 300, h = R.host.clientHeight || 200, asp = w / h;
  R.renderer.setSize(w, h, false);
  const c = R.cam; c.position.set(9, 10, 11); c.lookAt(0.3, 0.6, 0.2);
  const meio = 4.4; let hw = meio, hh = meio; if (asp > 1) hw = hh * asp; else hh = hw / asp;
  c.left = -hw; c.right = hw; c.top = hh * 0.95; c.bottom = -hh * 1.05; c.updateProjectionMatrix();
}
function anexar(el, estacao) {
  if (!R) montar();
  R.host = el; el.appendChild(R.renderer.domElement); tamanho();
  if (estacao && estacao !== R.pos && !R.anda) porEm(estacao);
  if (!R.raf) { R.ultimo = performance.now(); R.raf = requestAnimationFrame(quadro); }
}
function ir(id, aoChegar) {
  if (!R) { aoChegar && aoChegar(); return; }
  const a = R.ch.position.clone(), e = EST[id] || EST.porta, b = new THREE.Vector3(e[0], 0, e[1]);
  const dist = a.distanceTo(b);
  if (dist < 0.05) { porEm(id); aoChegar && aoChegar(); return; }
  R.anda = { a, b, d: 0, tot: dist, vel: Math.max(3, dist / 0.9), id, aoChegar, rot: e[2] };
}
function quadro(agora) {
  if (!R) return;
  if (!R.host || !R.host.isConnected) { R.raf = 0; return; }
  const dt = Math.min(0.3, (agora - R.ultimo) / 1000); R.ultimo = agora; R.t += dt;
  if (Math.abs((R.host.clientWidth || 0) - R.renderer.domElement.width / R.renderer.getPixelRatio()) > 2) tamanho();
  const ch = R.ch, u = ch.userData;
  if (R.anda) {
    const A = R.anda; A.d = Math.min(A.tot, A.d + dt * A.vel); const f = A.d / A.tot;
    ch.position.lerpVectors(A.a, A.b, f); ch.rotation.y = Math.atan2(A.b.x - A.a.x, A.b.z - A.a.z);
    u.pernas[0].rotation.x = Math.sin(R.t * 14) * 0.6; u.pernas[1].rotation.x = -Math.sin(R.t * 14) * 0.6; ch.position.y = Math.abs(Math.sin(R.t * 14)) * 0.08;
    if (f >= 1) { R.anda = null; u.pernas.forEach(p => { p.rotation.x = 0; }); porEm(A.id); const cb = A.aoChegar; cb && setTimeout(cb, 120); }
  } else { ch.position.y = Math.sin(R.t * 3) * 0.02; u.bracos.forEach((b, i) => { b.rotation.x = R.luz && R.luz !== 'porta' ? -0.9 + Math.sin(R.t * 5 + i) * 0.15 : 0; }); }
  R.chamas.forEach((c, i) => { c.scale.y = 1 + Math.sin(R.t * 18 + i) * 0.2; });
  R.vidro.material.emissiveIntensity = R.luz === 'fogao' ? 0.6 + Math.sin(R.t * 3) * 0.2 : 0.2;
  R.renderer.render(R.cena, R.cam);
  R.raf = requestAnimationFrame(quadro);
}
function soltar() { if (R && R.raf) { cancelAnimationFrame(R.raf); R.raf = 0; } }

window.Cozinha3D = { suportado, anexar, ir, soltar, estado: () => R && { pos: R.pos, andando: !!R.anda } };
