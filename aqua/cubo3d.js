/* AQUA — Cubo d'Água em 3D (three.js r170, libs/, MIT). Carregado só quando a criança escolhe o cubo (import()).
   As regras ficam no cubo-motor.js (CuboMotor); aqui é o desenho e o toque:
   - 26 cubinhos de vidro escuro com cantos arredondados e uma pastilha de "líquido" brilhante em cada face de fora;
     reflexos de um ambiente de luz feito no código (sem imagem nenhuma) e uma sombra macia embaixo;
   - arrastar fora do cubo (ou com dois dedos) gira o cubo inteiro;
   - pôr o dedo num cubinho e arrastar gira a fatia dele para aquele lado, acompanhando o dedo; soltando com mais de
     uns 17° a fatia completa o giro, senão volta;
   - tocar num cubinho (sem arrastar) marca a pastilha e mostra as setas ⬆⬇⬅➡ (alternativa ao arrasto);
   - face montada (uma cor só) brilha; "reduzir movimento" encurta as animações e tira o balanço parado.
   Fica em window.AquaCubo: iniciar(el, op) · carregar(est) · desfazer() · dica() · seta(dx, dy) · ativo(sim)
   · redimensionar() · ocupado() · projetar(id) · girar(g) · simbolos(sim) */
import * as THREE from './libs/three.module.min.js';

const C = window.CuboMotor;
const ESP = 1.02;            // distância entre os centros dos cubinhos
const TAM = 0.96;            // tamanho de um cubinho
const EIXOS = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
// a cor de cada face (na ordem de CuboMotor.FACES: cima, baixo, direita, esquerda, frente, trás)
const CORES = ['#f4f8ff', '#ffcc00', '#e8193c', '#ff7a00', '#1f6ff2', '#12b25a'];
const SIMBOLOS = ['●', '★', '♥', '▲', '◆', '✿'];

let op = {}, renderer, cena, camera, grupo, sombra, raio = new THREE.Raycaster();
let el, est = null, cubinhos = [], pastilhas = {}, alvos = [], quadro = 0, vivo = false, ultimo = 0, relogio = 0;
let anim = null, giroVivo = null, selecao = null, toques = new Map(), arrasto = null, comSimbolos = false;

// ---------- geometria ----------
// cubo de cantos arredondados: uma caixa subdividida com os vértices empurrados para uma "casca" de raio r
function caixaArredondada(lado, r, seg) {
  const g = new THREE.BoxGeometry(lado, lado, lado, seg, seg, seg), p = g.attributes.position, n = g.attributes.normal;
  const h = lado / 2 - r, v = new THREE.Vector3(), d = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const dentro = new THREE.Vector3(THREE.MathUtils.clamp(v.x, -h, h), THREE.MathUtils.clamp(v.y, -h, h), THREE.MathUtils.clamp(v.z, -h, h));
    d.subVectors(v, dentro);
    if (d.lengthSq() > 1e-9) { d.normalize(); v.copy(dentro).addScaledVector(d, r); p.setXYZ(i, v.x, v.y, v.z); n.setXYZ(i, d.x, d.y, d.z); }
  }
  return g;
}
function pastilhaGeo() {
  const s = 0.78, r = 0.16, h = s / 2, f = new THREE.Shape();
  f.moveTo(-h + r, -h); f.lineTo(h - r, -h); f.quadraticCurveTo(h, -h, h, -h + r); f.lineTo(h, h - r); f.quadraticCurveTo(h, h, h - r, h);
  f.lineTo(-h + r, h); f.quadraticCurveTo(-h, h, -h, h - r); f.lineTo(-h, -h + r); f.quadraticCurveTo(-h, -h, -h + r, -h);
  const g = new THREE.ExtrudeGeometry(f, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 4, curveSegments: 8 });
  g.translate(0, 0, -0.02);
  return g;
}
// textura de um brilho redondo (o reflexo "molhado" de cada pastilha e a sombra do cubo)
function texturaBrilho(cor, a) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, cor.replace('A', a)); gr.addColorStop(1, cor.replace('A', 0));
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// o contorno amarelo que brilha em volta da pastilha marcada
function texturaAro() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'); x.shadowColor = '#ff9d00'; x.shadowBlur = 10; x.strokeStyle = '#ffb300'; x.lineWidth = 14;
  x.beginPath(); x.roundRect ? x.roundRect(14, 14, 100, 100, 22) : x.rect(14, 14, 100, 100); x.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function texturaSimbolo(s) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'); x.fillStyle = 'rgba(0,0,0,0)'; x.fillRect(0, 0, 128, 128);
  x.font = '76px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = 'rgba(20,30,50,.55)'; x.fillText(s, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------- o ambiente de luz (para os reflexos), feito no código ----------
function ambiente() {
  const env = new THREE.Scene();
  const cores = [], esfera = new THREE.SphereGeometry(10, 32, 16), pos = esfera.attributes.position;
  const cima = new THREE.Color('#d9f3ff'), meio = new THREE.Color('#ffffff'), baixo = new THREE.Color('#2b4a6b'), cc = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 10; if (y > 0) cc.lerpColors(meio, cima, y); else cc.lerpColors(meio, baixo, -y); cores.push(cc.r, cc.g, cc.b); }
  esfera.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3));
  env.add(new THREE.Mesh(esfera, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  // três "janelas" de luz que viram os reflexos brilhantes nas pastilhas
  [[-5, 6, 4, 4, 2.5], [6, 3, 5, 3, 3], [0, -2, 7, 6, 1]].forEach(([x, y, z, w, h]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 3) }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  });
  const pm = new THREE.PMREMGenerator(renderer), tex = pm.fromScene(env, 0.03).texture;
  pm.dispose();
  return tex;
}

// ---------- montar ----------
let geoCorpo, geoPastilha, matCorpo, texReflexo, matAro;
function iniciar(container, opcoes) {
  op = opcoes || {}; el = container; comSimbolos = !!op.simbolos;
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.domElement.className = 'cubo-tela';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  el.appendChild(renderer.domElement);
  cena = new THREE.Scene();
  cena.environment = ambiente();
  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  cena.add(new THREE.HemisphereLight('#e8f6ff', '#30485f', 0.7));
  const sol = new THREE.DirectionalLight('#ffffff', 1.6); sol.position.set(-3, 6, 5); cena.add(sol);
  const contra = new THREE.DirectionalLight('#9fe7ff', 0.6); contra.position.set(4, -2, -5); cena.add(contra);
  sombra = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: texturaBrilho('rgba(5,25,45,A)', 0.45), transparent: true, depthWrite: false }));
  sombra.rotation.x = -Math.PI / 2; sombra.position.y = -2.45; cena.add(sombra);
  grupo = new THREE.Group(); cena.add(grupo);
  geoCorpo = caixaArredondada(TAM, 0.13, 5); geoPastilha = pastilhaGeo();
  matCorpo = new THREE.MeshPhysicalMaterial({ color: '#0d1d33', roughness: 0.28, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.9 });
  texReflexo = texturaBrilho('rgba(255,255,255,A)', 0.85);
  matAro = new THREE.MeshBasicMaterial({ map: texturaAro(), transparent: true, depthWrite: false, toneMapped: false });
  const a = renderer.domElement;
  a.style.touchAction = 'none';
  a.addEventListener('pointerdown', apertou); a.addEventListener('pointermove', moveu);
  a.addEventListener('pointerup', soltou); a.addEventListener('pointercancel', soltou); a.addEventListener('lostpointercapture', soltou);
  if (window.ResizeObserver) new ResizeObserver(redimensionar).observe(el); else window.addEventListener('resize', redimensionar);
  redimensionar();
}

function montar() {
  while (grupo.children.length) grupo.remove(grupo.children[0]);
  cubinhos = []; pastilhas = {}; alvos = [];
  const porPos = {};
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    if (!x && !y && !z) continue;
    const c = new THREE.Group(); c.position.set(x * ESP, y * ESP, z * ESP);
    const corpo = new THREE.Mesh(geoCorpo, matCorpo); c.add(corpo); alvos.push(corpo);
    grupo.add(c); cubinhos.push(c); porPos[x + ',' + y + ',' + z] = c;
  }
  // as pastilhas nascem do cubo montado do motor (mesmos ids)
  C.novo().pastilhas.forEach((p) => {
    const c = porPos[p.pos.join(',')], cor = new THREE.Color(CORES[p.cor]);
    const mat = new THREE.MeshPhysicalMaterial({ color: cor, roughness: 0.2, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05,
      emissive: cor, emissiveIntensity: 0.1, envMapIntensity: 0.75 });
    const m = new THREE.Mesh(geoPastilha, mat), n = new THREE.Vector3().fromArray(p.normal);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    m.position.copy(n).multiplyScalar(TAM / 2 + 0.004);
    // o reflexo "molhado" no canto de cima da pastilha
    const brilho = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.24), new THREE.MeshBasicMaterial({ map: texReflexo, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
    brilho.position.set(-0.12, 0.17, 0.05); brilho.rotation.z = 0.35; m.add(brilho);
    const simbolo = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: texturaSimbolo(SIMBOLOS[p.cor]), transparent: true, depthWrite: false }));
    simbolo.position.z = 0.04; simbolo.visible = comSimbolos; m.add(simbolo);
    const aro = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 1.08), matAro); aro.position.z = 0.06; aro.visible = false; m.add(aro);
    m.userData = { id: p.id, mat, simbolo, aro, brilhoAlvo: 0.1 };
    c.add(m); pastilhas[p.id] = m; alvos.push(m);
  });
}

// ---------- giros ----------
function camadaDe(c, eixo) { return Math.round(c.position[eixo] / ESP); }
function prenderFatia(eixo, camada) {
  const pivo = new THREE.Object3D(); grupo.add(pivo);
  cubinhos.filter((c) => camadaDe(c, eixo) === camada).forEach((c) => pivo.attach(c));
  return pivo;
}
function soltarFatia(pivo) {
  pivo.updateMatrixWorld(true);
  pivo.children.slice().forEach((c) => {
    grupo.attach(c);
    c.position.set(Math.round(c.position.x / ESP) * ESP, Math.round(c.position.y / ESP) * ESP, Math.round(c.position.z / ESP) * ESP);
    const m = new THREE.Matrix4().makeRotationFromQuaternion(c.quaternion), e = m.elements;
    for (let i = 0; i < 16; i++) e[i] = Math.round(e[i]);
    c.quaternion.setFromRotationMatrix(m);
  });
  grupo.remove(pivo);
}
// gira de verdade: anima (ou não) e, no fim, registra no motor
function girar(g, comoAnimar, depois) {
  const pivo = giroVivo && giroVivo.eixo === g.eixo && giroVivo.camada === g.camada ? giroVivo.pivo : prenderFatia(g.eixo, g.camada);
  const de = giroVivo ? giroVivo.angulo : 0, para = g.dir * Math.PI / 2;
  giroVivo = null;
  const fim = () => { pivo.setRotationFromAxisAngle(EIXOS[g.eixo], para); soltarFatia(pivo); if (depois) depois(); };
  if (comoAnimar === false) { fim(); return; }
  anim = { pivo, eixo: g.eixo, de, para, t: 0, dur: (op.calmo ? 0.12 : 0.24) * (Math.abs(para - de) / (Math.PI / 2) * 0.6 + 0.4), fim };
  pedir();
}
function voltarGiro() {   // o arrasto não chegou a girar: a fatia volta para o lugar
  const v = giroVivo; giroVivo = null; if (!v) return;
  anim = { pivo: v.pivo, eixo: v.eixo, de: v.angulo, para: 0, t: 0, dur: 0.16, fim: () => { v.pivo.setRotationFromAxisAngle(EIXOS[v.eixo], 0); soltarFatia(v.pivo); } };
  pedir();
}
function feito(g, daCrianca) {
  if (daCrianca) C.girar(est, g);
  atualizarBrilho(true);
  if (op.aoGirar) op.aoGirar(g, daCrianca);
  if (daCrianca && C.pronto(est) && op.aoVencer) setTimeout(op.aoVencer, op.calmo ? 100 : 450);
}

// ---------- brilho das faces montadas ----------
let prontasAntes = 0;
function atualizarBrilho(avisar) {
  if (!est) return;
  const prontas = C.FACES.filter((f) => C.faceInteira(est, f.normal)).map((f) => f.normal.join(','));
  est.pastilhas.forEach((p) => { const m = pastilhas[p.id]; if (m) m.userData.brilhoAlvo = prontas.indexOf(p.normal.join(',')) >= 0 ? 0.42 : 0.1; });
  if (avisar && prontas.length > prontasAntes && op.aoFacePronta) op.aoFacePronta(prontas.length);
  prontasAntes = prontas.length;
}

// ---------- câmera e tamanho ----------
function redimensionar() {
  if (!renderer || !el) return;
  const r = el.getBoundingClientRect(); if (r.width < 10 || r.height < 10) return;
  renderer.setSize(r.width, r.height, false);
  camera.aspect = r.width / r.height;
  // o cubo (com folga para girar) cabe inteiro, em pé ou deitado
  const raioCubo = 2.75, vfov = THREE.MathUtils.degToRad(camera.fov), hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
  const d = raioCubo / Math.sin(Math.min(vfov, hfov) / 2);
  camera.position.set(0, 0.9, d); camera.lookAt(0, -0.15, 0); camera.updateProjectionMatrix();
  pedir();
}

// ---------- toque ----------
function pontoTela(e) { const r = renderer.domElement.getBoundingClientRect(); return new THREE.Vector2(e.clientX - r.left, e.clientY - r.top); }
function tocado(p) {
  const r = renderer.domElement.getBoundingClientRect();
  raio.setFromCamera(new THREE.Vector2(p.x / r.width * 2 - 1, -(p.y / r.height) * 2 + 1), camera);
  const hit = raio.intersectObjects(alvos, false)[0]; if (!hit) return null;
  const obj = hit.object, cubinho = obj.parent.userData && obj.parent.userData.id !== undefined ? obj.parent.parent : obj.parent;
  const inv = grupo.quaternion.clone().invert();
  const nMundo = hit.face.normal.clone().transformDirection(obj.matrixWorld);
  const n = nMundo.applyQuaternion(inv), k = ['x', 'y', 'z'].reduce((a, b) => (Math.abs(n[b]) > Math.abs(n[a]) ? b : a), 'x');
  const normal = new THREE.Vector3(); normal[k] = Math.sign(n[k]);
  return { cubinho, pastilha: obj.userData && obj.userData.id !== undefined ? obj : null, normal, eixoNormal: k, ponto: grupo.worldToLocal(hit.point.clone()) };
}
function telaDe(vLocal) {
  const w = vLocal.clone().applyMatrix4(grupo.matrixWorld).project(camera), r = renderer.domElement.getBoundingClientRect();
  return new THREE.Vector2((w.x + 1) / 2 * r.width, (1 - w.y) / 2 * r.height);
}
// para onde (eixo, sentido) gira a fatia quando o dedo anda "dir" (pixels) a partir do ponto tocado
function escolherGiro(t, dir) {
  let melhor = null;
  ['x', 'y', 'z'].forEach((eixo) => {
    if (eixo === t.eixoNormal) return;
    const v = EIXOS[eixo].clone().cross(t.ponto), a = telaDe(t.ponto), b = telaDe(t.ponto.clone().addScaledVector(v, 0.05));
    const s = b.sub(a).multiplyScalar(1 / 0.05);            // pixels por radiano, na tela
    const comp = s.length(); if (comp < 1) return;
    const nota = s.clone().normalize().dot(dir.clone().normalize());
    if (!melhor || Math.abs(nota) > Math.abs(melhor.nota)) melhor = { eixo, nota, pxRad: comp, sDir: s.normalize() };
  });
  if (!melhor) return null;
  return { eixo: melhor.eixo, camada: camadaDe(t.cubinho, melhor.eixo), sinal: Math.sign(melhor.nota) || 1, pxRad: melhor.pxRad, sDir: melhor.sDir };
}

function apertou(e) {
  if (!vivo || anim) return;
  renderer.domElement.setPointerCapture(e.pointerId);
  toques.set(e.pointerId, pontoTela(e));
  if (toques.size === 2) { arrasto = { tipo: 'orbita', ultimo: null }; if (giroVivo) voltarGiro(); return; }
  const p = pontoTela(e), t = tocado(p);
  arrasto = { tipo: t ? 'fatia?' : 'orbita', ini: p, ultimo: p, t };
}
function moveu(e) {
  if (!arrasto || !toques.has(e.pointerId)) return;
  const p = pontoTela(e); toques.set(e.pointerId, p);
  if (arrasto.tipo === 'orbita') {
    let d;
    if (toques.size === 2) { const ps = [...toques.values()], meio = ps[0].clone().add(ps[1]).multiplyScalar(0.5); d = arrasto.ultimo ? meio.clone().sub(arrasto.ultimo) : new THREE.Vector2(); arrasto.ultimo = meio; }
    else { d = p.clone().sub(arrasto.ultimo); arrasto.ultimo = p; }
    orbitar(d.x, d.y); return;
  }
  const delta = p.clone().sub(arrasto.ini);
  if (arrasto.tipo === 'fatia?') {
    if (delta.length() < 10) return;
    const g = escolherGiro(arrasto.t, delta); if (!g) { arrasto.tipo = 'orbita'; arrasto.ultimo = p; return; }
    arrasto.tipo = 'fatia'; arrasto.g = g; desmarcar();
    giroVivo = { eixo: g.eixo, camada: g.camada, angulo: 0, pivo: prenderFatia(g.eixo, g.camada) };
  }
  if (arrasto.tipo === 'fatia') {
    const g = arrasto.g, ang = THREE.MathUtils.clamp(delta.dot(g.sDir) / g.pxRad, -Math.PI / 2, Math.PI / 2);
    giroVivo.angulo = ang; giroVivo.pivo.setRotationFromAxisAngle(EIXOS[g.eixo], ang); pedir();
  }
}
function soltou(e) {
  if (!toques.has(e.pointerId)) return;
  toques.delete(e.pointerId);
  const a = arrasto; if (!a) return;
  if (toques.size) { if (a.tipo !== 'orbita') arrasto = { tipo: 'orbita', ultimo: null }; return; }
  arrasto = null;
  if (a.tipo === 'fatia' && giroVivo) {
    const ang = giroVivo.angulo;
    if (Math.abs(ang) > 0.3) { const g = { eixo: a.g.eixo, camada: a.g.camada, dir: ang > 0 ? 1 : -1 }; girar(g, true, () => feito(g, true)); }
    else voltarGiro();
  } else if (a.tipo === 'fatia?') marcar(a.t);         // toque sem arrastar: marca a pastilha e mostra as setas
  else if (a.tipo === 'orbita' && a.ini && a.ultimo && a.ultimo.distanceTo(a.ini) < 6) desmarcar();
}
function orbitar(dx, dy) {
  const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * 0.009);
  const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * 0.009);
  grupo.quaternion.premultiply(qy).premultiply(qx); pedir();
}

// ---------- marcar uma pastilha e as setas ----------
function marcar(t) {
  desmarcar();
  if (!t || !t.pastilha) return;
  selecao = t; pedir();
  if (op.aoSelecionar) op.aoSelecionar(true);
}
function desmarcar() { if (!selecao) return; selecao = null; pedir(); if (op.aoSelecionar) op.aoSelecionar(false); }
function seta(dx, dy) {
  if (!selecao || anim || !est) return false;
  const g0 = escolherGiro(selecao, new THREE.Vector2(dx, dy)); if (!g0) return false;
  const g = { eixo: g0.eixo, camada: g0.camada, dir: g0.sinal };
  // a pastilha marcada continua marcada no lugar novo (para dar vários giros seguidos)
  const pid = selecao.pastilha.userData.id;
  girar(g, true, () => { feito(g, true); remarcar(pid); });
  return true;
}
function remarcar(id) {
  const m = pastilhas[id]; if (!m) return desmarcar();
  m.updateMatrixWorld(true);
  const centro = new THREE.Vector3().setFromMatrixPosition(m.matrixWorld);
  const ponto = grupo.worldToLocal(centro.clone()), nMundo = new THREE.Vector3(0, 0, 1).applyQuaternion(m.getWorldQuaternion(new THREE.Quaternion()));
  const n = nMundo.applyQuaternion(grupo.quaternion.clone().invert()), k = ['x', 'y', 'z'].reduce((a, b) => (Math.abs(n[b]) > Math.abs(n[a]) ? b : a), 'x');
  const normal = new THREE.Vector3(); normal[k] = Math.sign(n[k]);
  selecao = { cubinho: m.parent, pastilha: m, normal, eixoNormal: k, ponto: ponto.add(normal.clone().multiplyScalar(0.0)) };
  pedir();
}

// ---------- ajudas ----------
function desfazer() {
  if (!est || anim || !est.giros.length) return false;
  desmarcar();
  const g = C.inverso(est.giros[est.giros.length - 1]);
  girar(g, true, () => { C.desfazer(est); feito(g, false); });
  return true;
}
// dica: a fatia certa balança duas vezes para o lado do giro (sem girar)
function dica() {
  if (!est || anim) return null;
  const g = C.dica(est); if (!g) return null;
  desmarcar();
  const pivo = prenderFatia(g.eixo, g.camada);
  anim = { pivo, eixo: g.eixo, balanco: g.dir, t: 0, dur: op.calmo ? 0.5 : 1.3, fim: () => { pivo.setRotationFromAxisAngle(EIXOS[g.eixo], 0); soltarFatia(pivo); } };
  pedir();
  return g;
}

// ---------- carregar uma fase ----------
function carregar(estado) {
  est = estado; desmarcar(); anim = null; giroVivo = null;
  montar();
  est.embaralho.concat(est.giros).forEach((g) => girar(g, false));
  grupo.quaternion.setFromEuler(new THREE.Euler(0.5, -0.65, 0, 'YXZ'));
  prontasAntes = 0; atualizarBrilho(false);
  aplicarSimbolos(); pedir();
}
function aplicarSimbolos() { Object.keys(pastilhas).forEach((id) => { pastilhas[id].userData.simbolo.visible = comSimbolos; }); }

// ---------- o quadro ----------
function pedir() { if (!quadro && vivo) quadro = requestAnimationFrame(desenhar); }
function suave(x) { return x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x); }
function desenhar(ts) {
  quadro = 0; if (!vivo) return;
  const dt = ultimo ? Math.min(0.05, (ts - ultimo) / 1000) : 0.016; ultimo = ts; relogio += dt;
  let mexendo = false;
  if (anim) {
    anim.t += dt * (op.vel || 1);
    const u = Math.min(1, anim.t / anim.dur);
    if (anim.balanco) anim.pivo.setRotationFromAxisAngle(EIXOS[anim.eixo], anim.balanco * 0.42 * Math.sin(u * Math.PI * 2) * (1 - u * 0.3));
    else anim.pivo.setRotationFromAxisAngle(EIXOS[anim.eixo], anim.de + (anim.para - anim.de) * suave(u));
    if (u >= 1) { const f = anim.fim; anim = null; f(); }
    mexendo = true;
  }
  // brilho das faces montadas, a pastilha marcada pulsando e o cubo respirando de leve
  Object.keys(pastilhas).forEach((id) => {
    const m = pastilhas[id], ud = m.userData, alvo = ud.brilhoAlvo + (selecao && selecao.pastilha === m ? 0.35 + 0.25 * Math.sin(relogio * 8) : 0);
    const atual = ud.mat.emissiveIntensity, novo = atual + (alvo - atual) * Math.min(1, dt * 8);
    if (Math.abs(novo - atual) > 0.001) { ud.mat.emissiveIntensity = novo; mexendo = true; }
    if (ud.brilhoAlvo > 0.2 && !op.calmo) { ud.mat.emissiveIntensity = ud.brilhoAlvo + 0.12 * Math.sin(relogio * 3 + m.userData.id); mexendo = true; }
  });
  Object.keys(pastilhas).forEach((id) => { const ud = pastilhas[id].userData; ud.aro.visible = !!(selecao && selecao.pastilha === pastilhas[id]); });
  if (selecao) { matAro.opacity = 0.65 + 0.35 * Math.sin(relogio * 7); mexendo = true; }
  if (!op.calmo) { grupo.position.y = Math.sin(relogio * 1.3) * 0.06; mexendo = true; }
  renderer.render(cena, camera);
  if (mexendo || arrasto) pedir(); else ultimo = 0;
}
function ativo(sim) { vivo = !!sim; ultimo = 0; if (vivo) { redimensionar(); pedir(); } }

// para os testes: onde fica na tela o centro da pastilha "id"
function projetar(id) {
  const m = pastilhas[id]; if (!m) return null;
  m.updateMatrixWorld(true);
  const p = new THREE.Vector3().setFromMatrixPosition(m.matrixWorld).project(camera), r = renderer.domElement.getBoundingClientRect();
  const n = new THREE.Vector3(0, 0, 1).applyQuaternion(m.getWorldQuaternion(new THREE.Quaternion()));
  const olho = camera.position.clone().sub(new THREE.Vector3().setFromMatrixPosition(m.matrixWorld)).normalize();
  return { x: r.left + (p.x + 1) / 2 * r.width, y: r.top + (1 - p.y) / 2 * r.height, deFrente: n.dot(olho) };
}

// para os testes: quantas pastilhas estão num lugar diferente do que o motor diz (0 = desenho e regras iguais)
function diferencas() {
  if (!est) return -1;
  const inv = grupo.quaternion.clone().invert(); let n = 0;
  grupo.updateMatrixWorld(true);
  est.pastilhas.forEach((p) => {
    const m = pastilhas[p.id], q = m.getWorldQuaternion(new THREE.Quaternion()), nm = new THREE.Vector3(0, 0, 1).applyQuaternion(q).applyQuaternion(inv);
    const pos = grupo.worldToLocal(new THREE.Vector3().setFromMatrixPosition(m.parent.matrixWorld)).divideScalar(ESP);
    const ok = Math.round(nm.x) === p.normal[0] && Math.round(nm.y) === p.normal[1] && Math.round(nm.z) === p.normal[2] &&
      Math.round(pos.x) === p.pos[0] && Math.round(pos.y) === p.pos[1] && Math.round(pos.z) === p.pos[2];
    if (!ok) n++;
  });
  return n;
}
window.AquaCubo = {
  diferencas,
  iniciar, carregar, desfazer, dica, seta, ativo, redimensionar, projetar,
  girar: (g) => { if (anim || !est) return false; girar(g, true, () => feito(g, true)); return true; },
  ocupado: () => !!(anim || giroVivo), marcado: () => !!selecao, estado: () => est,
  simbolos: (sim) => { comSimbolos = !!sim; aplicarSimbolos(); pedir(); },
  marcarPastilha: (id) => { remarcar(id); if (op.aoSelecionar) op.aoSelecionar(true); }
};
window.dispatchEvent(new Event('aquacubo'));
