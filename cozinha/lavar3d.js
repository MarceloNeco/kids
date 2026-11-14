/* Mão na Massa — lavar as mãos em 3D (v0.12.0, pedido do dono de 14/Nov/2026: "mostrar uma criança subindo na pia,
   passando sabão"). Cena com o three.js (libs/, MIT): pia com torneira, sabonete líquido, toalha e um banquinho; a
   criança anda até o banquinho e sobe, abre a torneira, molha as mãos, aperta o sabonete, esfrega (a espuma cresce),
   enxágua, fecha a torneira e seca na toalha. Cada etapa é um botão grande (e tocar na cena também avança); a esfregação
   é fazendo círculos com o dedo na cena, como antes. API: window.Lavar3D.montar(caixa, op) → função que para.
   op = { textos: { [etapa]: [instrução, botão] }, aoFim(), calmo, rapido }. */
import * as THREE from './libs/three.module.min.js';

function suportado() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }

const M = {};
function mat(cor, op) { const k = cor + JSON.stringify(op || {}); if (!M[k]) M[k] = new THREE.MeshStandardMaterial(Object.assign({ color: cor, roughness: 0.7 }, op || {})); return M[k]; }
function sh(m) { m.castShadow = true; m.receiveShadow = true; return m; }
function caixa(w, h, d, cor, x, y, z, op) { const m = sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(cor, op))); m.position.set(x, y, z); return m; }
function cil(r1, r2, h, cor, x, y, z, op) { const m = sh(new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 20), mat(cor, op))); m.position.set(x, y, z); return m; }
function bola(r, cor, x, y, z, op) { const m = sh(new THREE.Mesh(new THREE.SphereGeometry(r, 20, 16), mat(cor, op))); m.position.set(x, y, z); return m; }

// a criança: cabeça, cabelo, corpo, braços com mãos (que se esfregam), pernas que dobram para subir
function crianca() {
  const g = new THREE.Group(), pele = '#f6c9a3';
  const quadril = new THREE.Group(); quadril.position.y = 0.95; g.add(quadril);
  const pernas = [-0.16, 0.16].map(x => { const p = new THREE.Group(); p.position.set(x, 0, 0); p.add(caixa(0.2, 0.5, 0.22, '#3a5a8c', 0, -0.25, 0)); const c = new THREE.Group(); c.position.y = -0.5; c.add(caixa(0.19, 0.45, 0.2, '#3a5a8c', 0, -0.22, 0)); c.add(caixa(0.22, 0.12, 0.34, '#e84a3c', 0, -0.48, 0.06)); p.add(c); p.userData.canela = c; quadril.add(p); return p; });
  const tronco = new THREE.Group(); quadril.add(tronco);
  tronco.add(sh(new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.45, 6, 16), mat('#ff8a3d')))); tronco.children[0].position.y = 0.4;
  const cabeca = new THREE.Group(); cabeca.position.y = 1.15; tronco.add(cabeca);
  cabeca.add(bola(0.36, pele, 0, 0, 0));
  const cabelo = bola(0.38, '#6b3e1f', 0, 0.08, -0.04); cabelo.scale.set(1, 0.85, 1); cabeca.add(cabelo);
  cabeca.add(bola(0.05, '#3b2412', -0.13, 0.02, 0.32)); cabeca.add(bola(0.05, '#3b2412', 0.13, 0.02, 0.32));
  const boca = caixa(0.14, 0.03, 0.02, '#9b2c3c', 0, -0.13, 0.34); cabeca.add(boca);
  cabeca.add(bola(0.07, '#ff8fa3', -0.22, -0.07, 0.27, { transparent: true, opacity: 0.6 })); cabeca.add(bola(0.07, '#ff8fa3', 0.22, -0.07, 0.27, { transparent: true, opacity: 0.6 }));
  const bracos = [-1, 1].map(lado => { const b = new THREE.Group(); b.position.set(lado * 0.36, 0.72, 0); b.add(caixa(0.16, 0.5, 0.16, '#ff8a3d', 0, -0.22, 0)); const mao = bola(0.11, pele, 0, -0.5, 0); b.add(mao); b.userData.mao = mao; b.rotation.z = lado * 0.15; tronco.add(b); return b; });
  g.userData = { quadril, pernas, tronco, cabeca, bracos };
  g.scale.setScalar(1.1);
  return g;
}

function montar(caixaEl, op) {
  op = op || {};
  const TX = op.textos || {};
  caixaEl.innerHTML = '<div class="lavar3d"><p class="lv-instr" aria-live="polite"></p><button type="button" class="grande verde lv-bt"></button><div class="lv-barra" hidden><span></span></div>' +
    '<div class="lv-cena"></div><p class="limpinho" hidden></p></div>';
  const host = caixaEl.querySelector('.lv-cena'), instr = caixaEl.querySelector('.lv-instr'), bt = caixaEl.querySelector('.lv-bt'),
    barra = caixaEl.querySelector('.lv-barra'), barraIn = barra.querySelector('span'), limpo = caixaEl.querySelector('.limpinho');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  const cena = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  function enquadrar() { const d = cam.aspect >= 1.2 ? 1 : 1.2 / Math.max(0.6, cam.aspect); cam.position.set(4.6 * d, 2.9 + 0.5 * d, 3.4 * d); cam.lookAt(0.2, 1.45, -0.2); }
  cena.add(new THREE.HemisphereLight('#ffffff', '#c9b79c', 1.1));
  const sol = new THREE.DirectionalLight('#fff6e6', 1.4); sol.position.set(3, 6, 4); sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); cena.add(sol);
  // banheiro: chão de madeira, parede com azulejos, espelho
  const chao = sh(new THREE.Mesh(new THREE.PlaneGeometry(12, 8), mat('#d9a066'))); chao.rotation.x = -Math.PI / 2; cena.add(chao);
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'); x.fillStyle = '#bfe6f5'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#ffffff'; x.lineWidth = 6;
  for (let i = 0; i <= 256; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 256); x.moveTo(0, i); x.lineTo(256, i); x.stroke(); }
  const tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(6, 3); tex.colorSpace = THREE.SRGBColorSpace;
  const parede = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 })); parede.position.set(0, 3, -1.2); parede.receiveShadow = true; cena.add(parede);
  cena.add(caixa(1.8, 1.3, 0.06, '#e6f6ff', -0.1, 3.45, -1.15, { roughness: 0.05, metalness: 0.6 })); cena.add(caixa(1.95, 1.45, 0.04, '#ffffff', -0.1, 3.45, -1.17));
  // gabinete e pia
  cena.add(caixa(2.4, 1.7, 1.1, '#ffffff', -0.1, 0.85, -0.6)); cena.add(caixa(0.02, 1.3, 0.9, '#e2e2e2', -0.1, 0.8, -0.04));
  cena.add(caixa(2.6, 0.12, 1.25, '#f4f1ea', -0.1, 1.76, -0.55));
  const cuba = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.42, 0.25, 32, 1, true), mat('#d8e2ea', { side: THREE.DoubleSide, metalness: 0.3, roughness: 0.25 })); cuba.position.set(-0.1, 1.72, -0.5); cena.add(cuba);
  // torneira (o registro gira) e a água
  cena.add(cil(0.07, 0.07, 0.45, '#c9d2dc', -0.1, 2.05, -0.98, { metalness: 0.8, roughness: 0.2 }));
  const bico = cil(0.06, 0.06, 0.45, '#c9d2dc', -0.1, 2.27, -0.78, { metalness: 0.8, roughness: 0.2 }); bico.rotation.x = Math.PI / 2; cena.add(bico);
  const registro = new THREE.Group(); registro.add(caixa(0.32, 0.06, 0.06, '#e84a3c')); registro.position.set(0.32, 2.05, -0.98); cena.add(registro);
  const agua = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.5, 12, 1, true), new THREE.MeshStandardMaterial({ color: '#7fcfff', transparent: true, opacity: 0.6, roughness: 0.05 }));
  agua.position.set(-0.1, 1.98, -0.56); agua.visible = false; cena.add(agua);
  // sabonete líquido e toalha
  const sab = new THREE.Group(); sab.add(cil(0.14, 0.16, 0.36, '#ff8fb1', 0, 0, 0, { roughness: 0.2 })); const bomba = cil(0.04, 0.04, 0.14, '#ffffff', 0, 0.25, 0); sab.add(bomba); sab.add(caixa(0.16, 0.04, 0.06, '#ffffff', 0.06, 0.32, 0));
  sab.position.set(0.85, 2.0, -0.85); cena.add(sab);
  const toalha = sh(new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.0, 0.06), mat('#ffd23f'))); toalha.position.set(1.55, 2.3, -1.1); cena.add(toalha);
  cena.add(caixa(0.9, 0.06, 0.12, '#c9d2dc', 1.55, 2.85, -1.1, { metalness: 0.7 }));
  // banquinho
  const banco = new THREE.Group(); banco.add(caixa(1.0, 0.12, 0.7, '#2bb673', 0, 0.62, 0));
  for (const [bx, bz] of [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]]) banco.add(caixa(0.1, 0.6, 0.1, '#1b8653', bx, 0.3, bz));
  banco.position.set(-0.1, 0, 0.55); cena.add(banco);
  // a criança, a espuma (bolhas) e as gotinhas
  const kid = crianca(); kid.position.set(-2.6, 0, 1.5); kid.rotation.y = Math.PI / 2; cena.add(kid);
  const espuma = new THREE.Group(); cena.add(espuma);
  const bolhas = []; for (let i = 0; i < 26; i++) { const b = bola(0.05 + Math.random() * 0.06, '#ffffff', 0, 0, 0, { transparent: true, opacity: 0.9, roughness: 0.1 }); b.visible = false; b.userData = { a: Math.random() * 6.28, r: 0.05 + Math.random() * 0.18, y: Math.random() * 0.25 }; espuma.add(b); bolhas.push(b); }
  const gotas = []; for (let i = 0; i < 10; i++) { const d = bola(0.035, '#7fcfff', 0, -10, 0, { transparent: true, opacity: 0.8 }); d.castShadow = false; gotas.push(d); cena.add(d); }

  // etapas. andar/subir/molhar/enxaguar/secar animam sozinhas depois do toque; esfregar é com círculos do dedo
  const ETAPAS = ['subir', 'abrir', 'molhar', 'sabao', 'esfregar', 'enxaguar', 'fechar', 'secar'];
  let et = 0, anim = null, esfregado = 0, fim = false, raf = 0, ultimo = performance.now(), t = 0;
  const D = op.calmo || op.rapido ? 0.01 : 1;
  const POS_PIA = new THREE.Vector3(-0.1, 0.72, 0.55);
  function mostrar() {
    if (fim) return;
    const e = ETAPAS[et], tx = TX[e] || [e, e];
    instr.textContent = tx[0]; bt.textContent = tx[1]; bt.hidden = e === 'esfregar'; bt.disabled = false;
    barra.hidden = e !== 'esfregar';
    caixaEl.querySelector('.lavar3d').dataset.etapa = e;
  }
  function animar(dur, passo, depois) { anim = { t: 0, dur: Math.max(0.01, dur * D), passo, depois }; bt.disabled = true; }
  function avancar() {
    if (anim || fim) return;
    const e = ETAPAS[et];
    if (e === 'subir') {
      const p0 = kid.position.clone(), r0 = kid.rotation.y;
      animar(2.2, f => {
        const fa = Math.min(1, f / 0.62), fb = Math.max(0, (f - 0.62) / 0.38), alvo = POS_PIA.clone();
        if (f < 0.62) { kid.position.lerpVectors(p0, new THREE.Vector3(alvo.x, 0, alvo.z + 0.05), fa); kid.rotation.y = fa < 0.8 ? Math.atan2(alvo.x - p0.x, alvo.z - p0.z) : Math.PI / 2 + (fa - 0.8) / 0.2 * Math.PI / 2; caminhar(fa * 9); }
        else { kid.position.set(alvo.x, alvo.y * Math.sin(fb * Math.PI / 2) + Math.sin(fb * Math.PI) * 0.25, alvo.z); kid.rotation.y = Math.PI; dobrar(Math.sin(fb * Math.PI) * 0.9); }
      }, () => { kid.rotation.y = Math.PI; dobrar(0); proxima(); });
    } else if (e === 'abrir') {
      animar(0.7, f => { registro.rotation.y = f * Math.PI / 2; bracoAte(1, new THREE.Vector3(0.32, 2.05, -0.98), f); }, () => { agua.visible = true; bracoAte(1, null, 0); proxima(); });
    } else if (e === 'molhar') {
      animar(1.6, f => { maosNaAgua(Math.min(1, f * 2)); }, proxima);
    } else if (e === 'sabao') {
      animar(1.2, f => { bomba.position.y = 0.25 - Math.sin(f * Math.PI) * 0.08; bracoAte(1, new THREE.Vector3(0.85, 2.2, -0.85), Math.sin(f * Math.PI)); if (f > 0.5) espumaQtd(0.15); }, () => { bracoAte(1, null, 0); maosNaAgua(1); proxima(); });
    } else if (e === 'enxaguar') {
      animar(1.8, f => { maosNaAgua(1); espumaQtd(1 - f); }, () => { espumaQtd(0); proxima(); });
    } else if (e === 'fechar') {
      animar(0.7, f => { registro.rotation.y = (1 - f) * Math.PI / 2; bracoAte(1, new THREE.Vector3(0.32, 2.05, -0.98), Math.sin(f * Math.PI)); if (f > 0.5) agua.visible = false; }, () => { agua.visible = false; maosNaAgua(0); proxima(); });
    } else if (e === 'secar') {
      animar(1.6, f => { bracoAte(0, new THREE.Vector3(1.4, 2.2, -0.9), Math.sin(Math.min(1, f * 1.4) * Math.PI / 2)); bracoAte(1, new THREE.Vector3(1.6, 2.1, -0.9), Math.sin(Math.min(1, f * 1.4) * Math.PI / 2)); toalha.rotation.z = Math.sin(f * 20) * 0.08; }, () => { bracoAte(0, null, 0); bracoAte(1, null, 0); toalha.rotation.z = 0; terminar(); });
    }
  }
  function proxima() { anim = null; et++; mostrar(); }
  function terminar() {
    fim = true; anim = null; bt.hidden = true; barra.hidden = true; instr.textContent = '';
    limpo.textContent = (TX.fim && TX.fim[0]) || '✨'; limpo.hidden = false;
    caixaEl.querySelector('.lavar3d').classList.add('limpo');
    const c = kid.userData.cabeca; c.rotation.z = 0.2;
    setTimeout(() => op.aoFim && op.aoFim(), op.rapido ? 50 : 900);
  }
  // braço i (0 esquerdo, 1 direito) vai até o ponto p (no mundo), com peso f (0 = solto)
  function bracoAte(i, p, f) { const b = kid.userData.bracos[i]; if (!p || !f) { b.rotation.x = 0; return; } b.rotation.x = -1.3 * f; }
  function maosNaAgua(f) { kid.userData.bracos.forEach((b, i) => { b.rotation.x = -1.15 * f; b.rotation.z = (i ? 1 : -1) * (0.15 - 0.45 * f); }); kid.userData.tronco.rotation.x = 0.25 * f; }
  function caminhar(k) { kid.userData.pernas[0].rotation.x = Math.sin(k) * 0.5; kid.userData.pernas[1].rotation.x = -Math.sin(k) * 0.5; }
  function dobrar(f) { kid.userData.pernas.forEach(p => { p.rotation.x = -f; p.userData.canela.rotation.x = f * 1.6; }); }
  function espumaQtd(f) { const n = Math.round(f * bolhas.length); bolhas.forEach((b, i) => { b.visible = i < n; }); espuma.userData.f = f; }
  // esfregar: círculos com o dedo na cena (ou o botão escondido de teclado)
  let ang0 = null, acc = 0;
  host.addEventListener('pointerdown', e => {
    if (ETAPAS[et] !== 'esfregar') { avancar(); return; }
    const r = host.getBoundingClientRect(); ang0 = Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2); try { host.setPointerCapture(e.pointerId); } catch (x) { /* ok */ }
  });
  host.addEventListener('pointermove', e => {
    if (ang0 == null || ETAPAS[et] !== 'esfregar') return;
    const r = host.getBoundingClientRect(), a = Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2);
    let d = a - ang0; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; ang0 = a; somar(Math.abs(d));
  });
  host.addEventListener('pointerup', () => { ang0 = null; });
  function somar(d) {
    if (ETAPAS[et] !== 'esfregar' || fim) return;
    acc += d; esfregado = Math.min(1, acc / (Math.PI * 2 * (op.voltas || 3)));
    barraIn.style.width = (esfregado * 100) + '%'; espumaQtd(0.2 + esfregado * 0.8);
    kid.userData.esfregando = performance.now();
    if (esfregado >= 1) proxima();
  }
  bt.addEventListener('click', avancar);
  // quadro a quadro
  function tamanho() { const w = host.clientWidth || 300, h = host.clientHeight || 220; renderer.setSize(w, h, false); cam.aspect = w / h; enquadrar(); cam.updateProjectionMatrix(); }
  tamanho();
  function quadro(agora) {
    const dt = Math.min(0.3, (agora - ultimo) / 1000); ultimo = agora; t += dt;   // até 0,3 s: num aparelho lento a etapa dura o mesmo
    if (host.clientWidth && (Math.abs(host.clientWidth - renderer.domElement.width / renderer.getPixelRatio()) > 2)) tamanho();
    if (anim) { anim.t += dt; const f = Math.min(1, anim.t / anim.dur); anim.passo(f); if (f >= 1) { const d = anim.depois; anim = null; d && d(); } }
    // esfregando: as mãos vão e voltam uma na outra
    const esf = kid.userData.esfregando && performance.now() - kid.userData.esfregando < 250;
    if (ETAPAS[et] === 'esfregar' || esf) kid.userData.bracos.forEach((b, i) => { b.rotation.x = -1.15 + Math.sin(t * 14 + i * Math.PI) * (esf ? 0.18 : 0.04); b.rotation.z = (i ? 1 : -1) * -0.3 + Math.cos(t * 14 + i) * (esf ? 0.12 : 0); });
    // bolhas em volta das mãos (na frente da criança, em cima da pia)
    const cx = kid.position.x, cz = kid.position.z - 0.85, cy = 1.95;
    bolhas.forEach(b => { if (!b.visible) return; const u = b.userData; b.position.set(cx + Math.cos(u.a + t * 1.5) * u.r * 1.6, cy + u.y + Math.sin(t * 3 + u.a) * 0.02, cz + Math.sin(u.a + t * 1.5) * u.r); });
    // água: gotinhas caindo da torneira
    gotas.forEach((d, i) => { if (!agua.visible) { d.position.y = -10; return; } const f = ((t * 1.6 + i / gotas.length) % 1); d.position.set(-0.1 + Math.sin(i) * 0.03, 2.2 - f * 0.55, -0.56); });
    if (agua.visible) agua.scale.x = agua.scale.z = 1 + Math.sin(t * 20) * 0.08;
    // piscar e respirar
    kid.userData.cabeca.position.y = 1.15 + Math.sin(t * 2) * 0.01;
    renderer.render(cena, cam);
    raf = requestAnimationFrame(quadro);
  }
  raf = requestAnimationFrame(quadro);
  mostrar();
  // para o teclado e os testes: esfregar um pouquinho
  caixaEl.lv = { somar, avancar, etapa: () => ETAPAS[et], fim: () => fim };
  return function parar() { cancelAnimationFrame(raf); renderer.dispose(); };
}

window.Lavar3D = { suportado, montar };
