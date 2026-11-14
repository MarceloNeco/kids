/* A-GARRA — as máquinas em 3D, fiéis às fotos de fliperama que o dono mandou (14/Nov/2026), mas com desenho próprio:
   nenhuma marca, letreiro ou personagem das fotos (no lugar deles, "A-GARRA" e desenhos nossos).
     - telefone:   cabine de telefone vermelha, vidrinhos com grade vermelha nas laterais, placa branca "TELEFONE",
                   painel com bandeira, portinha "PRÊMIO" quadriculada;
     - neon:       gabinete preto com tubos de neon verde e amarelo, parede de tijolo, letreiro de LED que corre;
     - estrelas:   azul estrelado com hexágonos (desenhos de insetos nossos) e luz azul;
     - lanchonete: vermelho e creme, chão quadriculado, cardápio na parede.
   Por dentro, igual em todas (como nas fotos): trilhos em cima, ponte e carrinho branco, cabo enrolado, garra de 3 dedos
   de metal, buraco de acrílico no canto da frente à esquerda, luz de LED no teto.
   As medidas são as da física (maquina.js): x 0..L, z 0..P (fundo → frente), y 0..A.
     montarMaquina(cena, tema, M)  → { atualizar(t, garra, extra), alvo (Vector3 para a câmera), visor(fichas, tempo, ganhos) } */
import * as THREE from './libs/three.module.js';

const TEMAS = {
  telefone: { corpo: '#c8102e', escuro: '#8e0a20', fundo: '#2a1a1e', chao: '#3a1020', luz: '#ffe9d6', neon: null, borda: '#c8102e' },
  neon: { corpo: '#111214', escuro: '#050506', fundo: '#202322', chao: '#141a17', luz: '#e8fff0', neon: '#39ff6a', neon2: '#ffd400', borda: '#1a1a1a' },
  estrelas: { corpo: '#1d2c78', escuro: '#101a4d', fundo: '#1f3a8f', chao: '#1a2160', luz: '#e6efff', neon: '#3aa0ff', neon2: '#7ef9ff', borda: '#c9a24a' },
  lanchonete: { corpo: '#d62839', escuro: '#9c1b28', fundo: '#fff3df', chao: '#ffffff', luz: '#fff7e0', neon: '#ffd166', neon2: '#ff7ab8', borda: '#fff3df' }
};

/* ---------- desenhos em canvas (texturas) ---------- */
function textura(w, h, desenha) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); desenha(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  t.userData = { canvas: c, g };
  return t;
}
function tijolos(g, w, h, base, linha, luz) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  const bh = h / 14, bw = bh * 2.6;
  for (let r = 0, y = 0; y < h; r++, y += bh) for (let x = (r % 2) * -bw / 2; x < w; x += bw) {
    g.fillStyle = luz; g.fillRect(x + 3, y + 3, bw - 6, 4); g.fillRect(x + 3, y + 3, 4, bh - 6);   // chanfro de cima, como os das fotos
    g.strokeStyle = linha; g.lineWidth = 4; g.strokeRect(x + 1, y + 1, bw - 2, bh - 2);
  }
}
function brilho(g, cor, blur) { g.shadowColor = cor; g.shadowBlur = blur; }
function texto(g, txt, x, y, fonte, cor, sombra) { g.font = fonte; g.textAlign = 'center'; g.textBaseline = 'middle'; if (sombra) brilho(g, sombra, 18); g.fillStyle = cor; g.fillText(txt, x, y); g.shadowBlur = 0; }
function estrela(g, x, y, r, ri, cor) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? ri : r; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fillStyle = cor; g.fill(); }
function hexagono(g, x, y, r) { g.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); }
function bandeira(g, x, y, w, h) {   // bandeira do Reino Unido (símbolo nacional), simplificada
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = '#1d3f8f'; g.fillRect(x, y, w, h);
  g.strokeStyle = '#fff'; g.lineWidth = h * 0.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y + h); g.moveTo(x + w, y); g.lineTo(x, y + h); g.stroke();
  g.strokeStyle = '#c8102e'; g.lineWidth = h * 0.07; g.stroke();
  g.fillStyle = '#fff'; g.fillRect(x + w * 0.42, y, w * 0.16, h); g.fillRect(x, y + h * 0.36, w, h * 0.28);
  g.fillStyle = '#c8102e'; g.fillRect(x + w * 0.455, y, w * 0.09, h); g.fillRect(x, y + h * 0.42, w, h * 0.16);
  g.restore();
}
function ursoNeon(g, x, y, s, cor) {   // contorno de ursinho em neon (desenho próprio)
  g.save(); brilho(g, cor, 20); g.strokeStyle = cor; g.lineWidth = 6 * s / 60; g.lineCap = 'round';
  g.beginPath(); g.arc(x, y, s * 0.5, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(x - s * 0.42, y - s * 0.42, s * 0.2, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(x + s * 0.42, y - s * 0.42, s * 0.2, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(x, y + s * 1.1, s * 0.62, Math.PI * 1.15, Math.PI * 1.85, true); g.stroke();
  g.beginPath(); g.arc(x - s * 0.17, y - s * 0.05, s * 0.05, 0, 7); g.arc(x + s * 0.17, y - s * 0.05, s * 0.05, 0, 7); g.fillStyle = cor; g.fill();
  g.beginPath(); g.arc(x, y + s * 0.12, s * 0.16, 0.2, Math.PI - 0.2); g.stroke();
  g.restore();
}
function coracaoNeon(g, x, y, s, cor) {
  g.save(); brilho(g, cor, 18); g.strokeStyle = cor; g.lineWidth = 5; g.beginPath();
  g.moveTo(x, y + s * 0.35); g.bezierCurveTo(x - s, y - s * 0.3, x - s * 0.35, y - s * 0.95, x, y - s * 0.35);
  g.bezierCurveTo(x + s * 0.35, y - s * 0.95, x + s, y - s * 0.3, x, y + s * 0.35); g.stroke(); g.restore();
}
function insetoIcone(g, x, y, s, qual) {
  if (qual === 0) { g.fillStyle = '#e63946'; g.beginPath(); g.ellipse(x, y, s * 0.5, s * 0.45, 0, 0, 7); g.fill(); g.fillStyle = '#17141c'; g.beginPath(); g.arc(x, y - s * 0.45, s * 0.25, 0, 7); g.fill(); [[-0.2, -0.05], [0.22, 0], [-0.15, 0.25], [0.18, 0.25]].forEach(([a, b]) => { g.beginPath(); g.arc(x + a * s, y + b * s, s * 0.08, 0, 7); g.fill(); }); }
  else if (qual === 1) { g.fillStyle = '#ffcf2e'; g.beginPath(); g.ellipse(x, y, s * 0.42, s * 0.32, 0, 0, 7); g.fill(); g.fillStyle = '#17141c'; [-0.12, 0.08].forEach((a) => g.fillRect(x + a * s, y - s * 0.3, s * 0.08, s * 0.6)); g.fillStyle = 'rgba(230,247,255,.85)'; g.beginPath(); g.ellipse(x - s * 0.1, y - s * 0.38, s * 0.15, s * 0.25, -0.4, 0, 7); g.ellipse(x + s * 0.12, y - s * 0.38, s * 0.15, s * 0.25, 0.4, 0, 7); g.fill(); }
  else { g.fillStyle = '#ff7ab8'; g.beginPath(); g.ellipse(x - s * 0.25, y - s * 0.12, s * 0.25, s * 0.3, -0.5, 0, 7); g.ellipse(x + s * 0.25, y - s * 0.12, s * 0.25, s * 0.3, 0.5, 0, 7); g.fill(); g.fillStyle = '#ffd166'; g.beginPath(); g.ellipse(x - s * 0.18, y + s * 0.22, s * 0.16, s * 0.18, 0.4, 0, 7); g.ellipse(x + s * 0.18, y + s * 0.22, s * 0.16, s * 0.18, -0.4, 0, 7); g.fill(); g.fillStyle = '#4a2c6e'; g.fillRect(x - s * 0.04, y - s * 0.35, s * 0.08, s * 0.7); }
}
function burguerIcone(g, x, y, s) {
  g.fillStyle = '#f0a94e'; g.beginPath(); g.ellipse(x, y - s * 0.12, s * 0.5, s * 0.3, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#7ed957'; g.fillRect(x - s * 0.52, y - s * 0.12, s * 1.04, s * 0.08);
  g.fillStyle = '#6b3a22'; g.fillRect(x - s * 0.5, y - s * 0.04, s, s * 0.14);
  g.fillStyle = '#e8a556'; g.beginPath(); g.ellipse(x, y + s * 0.14, s * 0.48, s * 0.1, 0, 0, 7); g.fill();
}

function fundoDe(tema) {
  return textura(1024, 1024, (g, w, h) => {
    if (tema === 'telefone') {
      tijolos(g, w, h, '#2b2f2e', '#151817', '#3e4442');
      g.strokeStyle = '#c8102e'; g.lineWidth = 34; g.strokeRect(17, 17, w - 34, h - 34);   // grades da cabine, como na foto
      for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(i * w / 3, 0); g.lineTo(i * w / 3, h); g.stroke(); }
      for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); }
      g.save(); brilho(g, '#39ff6a', 16); g.strokeStyle = '#39ff6a'; g.lineWidth = 6; g.beginPath(); g.arc(w * 0.42, h * 0.4, 160, 0.4, Math.PI * 1.6); g.stroke(); g.restore();
    } else if (tema === 'neon') {
      tijolos(g, w, h, '#232625', '#0f1110', '#3a3f3d');
      ursoNeon(g, w * 0.3, h * 0.36, 110, '#7ef9ff'); coracaoNeon(g, w * 0.74, h * 0.28, 70, '#ff4fd8');
      texto(g, 'A-GARRA', w * 0.7, h * 0.52, '700 64px Fredoka, system-ui, sans-serif', '#39ff6a', '#39ff6a');
    } else if (tema === 'estrelas') {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#24318f'); gr.addColorStop(1, '#141c5c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 160; i++) { g.globalAlpha = 0.3 + (i % 5) * 0.14; estrela(g, (i * 97) % w, (i * 151) % h, 3 + (i % 3) * 2, 1.4, '#fff7c2'); }
      g.globalAlpha = 1;
      [[0.3, 0.22, 0], [0.5, 0.22, 1], [0.7, 0.22, 2], [0.4, 0.42, 1], [0.6, 0.42, 0]].forEach(([x, y, q]) => {
        hexagono(g, x * w, y * h, 95); g.fillStyle = '#3a2f8f'; g.fill(); g.lineWidth = 8; g.strokeStyle = '#7ef9ff'; g.stroke(); insetoIcone(g, x * w, y * h, 110, q);
      });
      texto(g, 'INSETOS OFICIAIS DA A-GARRA', w / 2, h * 0.6, '700 46px Fredoka, system-ui, sans-serif', 'rgba(255,255,255,.75)');
    } else {
      for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.fillStyle = ((x + y) / 64) % 2 ? '#fff3df' : '#ffe0b8'; g.fillRect(x, y, 64, 64); }
      g.fillStyle = '#2a1a12'; g.fillRect(w * 0.14, h * 0.1, w * 0.72, h * 0.42); g.strokeStyle = '#c98b4a'; g.lineWidth = 14; g.strokeRect(w * 0.14, h * 0.1, w * 0.72, h * 0.42);
      texto(g, 'CARDÁPIO', w / 2, h * 0.16, '700 56px Fredoka, system-ui, sans-serif', '#ffd166');
      for (let i = 0; i < 3; i++) { burguerIcone(g, w * (0.3 + i * 0.2), h * 0.3, 90); texto(g, ['X-SALADA', 'X-BACON', 'DUPLO'][i], w * (0.3 + i * 0.2), h * 0.42, '600 30px Fredoka, system-ui, sans-serif', '#ffffff'); }
      g.save(); brilho(g, '#ff7ab8', 14); g.strokeStyle = '#ff7ab8'; g.lineWidth = 6; g.strokeRect(w * 0.1, h * 0.06, w * 0.8, h * 0.5); g.restore();
    }
  });
}
function placaDe(tema) {
  return textura(1024, 256, (g, w, h) => {
    if (tema === 'telefone') { g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); texto(g, 'A-GARRA', w / 2, h / 2 + 6, '800 150px Fredoka, system-ui, sans-serif', '#111'); estrela(g, 90, h / 2, 50, 22, '#c8102e'); estrela(g, w - 90, h / 2, 50, 22, '#c8102e'); }
    else if (tema === 'neon') { g.fillStyle = '#050505'; g.fillRect(0, 0, w, h); texto(g, 'A-GARRA', w / 2, h / 2 + 6, '800 150px Fredoka, system-ui, sans-serif', '#c6ffd4', '#39ff6a'); }
    else if (tema === 'estrelas') { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2b3aa0'); gr.addColorStop(1, '#101a4d'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) estrela(g, (i * 137) % w, (i * 71) % h, 6, 2.5, 'rgba(255,240,180,.7)'); texto(g, 'A-GARRA', w / 2, h / 2 + 6, '800 150px Fredoka, system-ui, sans-serif', '#ffd166', '#ff9f1c'); }
    else { g.fillStyle = '#d62839'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { g.fillStyle = (x / 64) % 2 ? '#fff' : '#d62839'; g.fillRect(x, h - 40, 64, 40); } texto(g, 'A-GARRA', w / 2, h / 2 - 12, '800 140px Fredoka, system-ui, sans-serif', '#ffd166', '#7a1020'); burguerIcone(g, 110, h / 2, 110); burguerIcone(g, w - 110, h / 2, 110); }
  });
}
function laterais(tema) {   // a placa "TELEFONE" das laterais da cabine
  return textura(512, 128, (g, w, h) => { g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); texto(g, 'TELEFONE', w / 2, h / 2 + 4, '800 78px Fredoka, system-ui, sans-serif', '#111'); });
}
function frenteBase(tema) {
  return textura(1024, 1024, (g, w, h) => {
    const T = TEMAS[tema];
    g.fillStyle = T.corpo; g.fillRect(0, 0, w, h);
    if (tema === 'telefone') { bandeira(g, 40, 520, 230, 250); bandeira(g, w - 270, 520, 230, 250); }
    if (tema === 'neon') { g.save(); brilho(g, '#39ff6a', 22); g.strokeStyle = '#39ff6a'; g.lineWidth = 12; g.strokeRect(40, 40, w - 80, h - 80); g.restore(); texto(g, 'A-GARRA', w * 0.62, h * 0.28, '800 120px Fredoka, system-ui, sans-serif', '#39ff6a', '#39ff6a'); }
    if (tema === 'estrelas') { for (let i = 0; i < 80; i++) estrela(g, (i * 97) % w, (i * 151) % h, 6 + (i % 3) * 3, 2.6, 'rgba(255,240,180,.8)'); texto(g, 'A-GARRA', w * 0.62, h * 0.28, '800 120px Fredoka, system-ui, sans-serif', '#ffd166', '#ff9f1c'); }
    if (tema === 'lanchonete') { for (let y = 640; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.fillStyle = ((x + y) / 64) % 2 ? '#fff' : '#111'; g.fillRect(x, y, 64, 64); } texto(g, 'A-GARRA', w * 0.62, h * 0.28, '800 120px Fredoka, system-ui, sans-serif', '#ffd166', '#7a1020'); }
    // portinha do prêmio (embaixo do buraco, à esquerda)
    const px = 50, py = 120, pw = 330, ph = 330;
    g.fillStyle = tema === 'lanchonete' ? '#fff3df' : tema === 'telefone' ? '#a00d24' : '#0b0b0b'; g.fillRect(px - 14, py - 14, pw + 28, ph + 28);
    g.fillStyle = '#050505'; g.fillRect(px, py, pw, ph * 0.62);
    if (tema === 'telefone') for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#fff' : '#111'; g.fillRect(px + i * pw / 6, py + ph * 0.66 + j * 28, pw / 6, 28); }
    texto(g, 'PRÊMIO', px + pw / 2, py + ph * 0.9, '800 64px Fredoka, system-ui, sans-serif', tema === 'neon' ? '#39ff6a' : tema === 'estrelas' ? '#ffd166' : tema === 'lanchonete' ? '#d62839' : '#ffffff');
  });
}

/* ---------- a máquina ---------- */
export function montarMaquina(cena, tema, M) {
  const T = TEMAS[tema] || TEMAS.telefone, { L, P, A, BX, BZ, AB } = M;
  const raiz = new THREE.Group(); cena.add(raiz);
  const matCorpo = new THREE.MeshStandardMaterial({ color: T.corpo, roughness: 0.4, metalness: 0.15 });
  const matEscuro = new THREE.MeshStandardMaterial({ color: T.escuro, roughness: 0.6 });
  const matMetal = new THREE.MeshStandardMaterial({ color: '#d9dde4', roughness: 0.25, metalness: 0.9 });
  const matBranco = new THREE.MeshStandardMaterial({ color: '#f2f3f5', roughness: 0.5 });
  const matVidro = new THREE.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.1, roughness: 0.05, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide });
  const matAcrilico = new THREE.MeshStandardMaterial({ color: '#e6f4ff', transparent: true, opacity: 0.22, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide });
  const neon = (cor) => new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: 2.2, roughness: 0.3 });
  const caixa = (mat, x0, y0, z0, x1, y1, z1, sombra) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); if (sombra) { m.receiveShadow = true; m.castShadow = true; } raiz.add(m); return m;
  };
  const plano = (mat, w, h, pos, rot) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(...pos); if (rot) m.rotation.set(...rot); raiz.add(m); return m; };

  /* sala atrás (parede de tijolo escura, como no fliperama das fotos) */
  const sala = textura(1024, 512, (g, w, h) => tijolos(g, w, h, '#1b1f1e', '#0a0c0b', '#2c3230'));
  sala.wrapS = sala.wrapT = THREE.RepeatWrapping; sala.repeat.set(4, 2);
  plano(new THREE.MeshStandardMaterial({ map: sala, roughness: 0.9 }), 60, 30, [L / 2, 4, -6]);
  plano(new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.95 }), 60, 40, [L / 2, -4.2, 10], [-Math.PI / 2, 0, 0]);

  /* por dentro: chão (sem o buraco), fundo, laterais, teto com LED */
  const chaoTex = textura(512, 512, (g, w, h) => {
    if (tema === 'lanchonete') { for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.fillStyle = ((x + y) / 64) % 2 ? '#111' : '#f5f5f5'; g.fillRect(x, y, 64, 64); } }
    else { g.fillStyle = T.chao; g.fillRect(0, 0, w, h); }
  });
  const matChao = new THREE.MeshStandardMaterial({ map: chaoTex, roughness: 0.85 });
  caixa(matChao, BX, -0.1, 0, L, 0, P, true).receiveShadow = true;
  caixa(matChao, 0, -0.1, 0, BX, 0, P - BZ, true).receiveShadow = true;
  // o buraco: um poço escuro descendo
  caixa(new THREE.MeshStandardMaterial({ color: '#050505', roughness: 1 }), 0, -1.8, P - BZ, BX, -1.7, P);
  for (const [x0, z0, x1, z1] of [[0, P - BZ, 0.02, P], [BX - 0.02, P - BZ, BX, P], [0, P - BZ, BX, P - BZ + 0.02]]) caixa(new THREE.MeshStandardMaterial({ color: '#0d0d0d' }), x0, -1.8, z0, x1, -0.1, z1);
  const fundo = plano(new THREE.MeshStandardMaterial({ map: fundoDe(tema), roughness: 0.8 }), L, A, [L / 2, A / 2, -0.01]);
  fundo.receiveShadow = true;
  // laterais: vidro (a cabine tem a grade vermelha; as outras, espelho escuro)
  for (const x of [-0.01, L + 0.01]) {
    plano(tema === 'telefone' ? matVidro : new THREE.MeshStandardMaterial({ color: T.fundo, roughness: 0.2, metalness: 0.5, transparent: true, opacity: 0.55 }), P, A, [x, A / 2, P / 2], [0, Math.PI / 2, 0]);
    if (tema === 'telefone') {
      for (let i = 1; i < 6; i++) caixa(matCorpo, x - 0.04, i * A / 6 - 0.04, 0, x + 0.04, i * A / 6 + 0.04, P);
      for (let i = 1; i < 3; i++) caixa(matCorpo, x - 0.04, 0, i * P / 3 - 0.04, x + 0.04, A, i * P / 3 + 0.04);
    }
  }
  caixa(matBranco, -0.2, A, -0.2, L + 0.2, A + 0.12, P + 0.2);
  const led = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: T.luz, emissiveIntensity: 1.6 });
  for (let i = 0; i < 5; i++) caixa(led, 0.4, A - 0.03, 0.4 + i * (P - 0.8) / 4, L - 0.4, A, 0.48 + i * (P - 0.8) / 4);
  // paredes de acrílico do buraco, com cantoneiras de metal
  caixa(matAcrilico, BX - 0.02, 0, P - BZ, BX + 0.02, AB, P);
  caixa(matAcrilico, 0, 0, P - BZ - 0.02, BX, AB, P - BZ + 0.02);
  caixa(matMetal, BX - 0.04, AB - 0.04, P - BZ, BX + 0.04, AB + 0.02, P);
  caixa(matMetal, 0, AB - 0.04, P - BZ - 0.04, BX, AB + 0.02, P - BZ + 0.04);
  caixa(matMetal, BX - 0.05, 0, P - BZ - 0.05, BX + 0.05, AB + 0.02, P - BZ + 0.05);

  /* por fora: colunas, vidro da frente, letreiro, base com painel e portinha */
  const C = 0.35;   // grossura das colunas
  for (const x of [-C, L]) for (const z of [-C, P]) caixa(matCorpo, x, -3.3, z, x + C, A + 0.15, z + C);
  caixa(matCorpo, -C, -3.3, -C, L + C, -0.1, P + C);   // base
  const frente = plano(new THREE.MeshStandardMaterial({ map: frenteBase(tema), roughness: 0.5 }), L + 2 * C, 3.2, [L / 2, -1.7, P + C + 0.005]);
  frente.receiveShadow = true;
  plano(matVidro, L, A, [L / 2, A / 2, P + 0.01]);   // vidro da frente
  // reflexos do vidro
  const reflexo = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.06, depthWrite: false });
  for (const [x, l] of [[1.6, 0.6], [2.6, 0.18], [4.7, 0.35]]) { const r = plano(reflexo, l, A * 1.2, [x, A / 2, P + 0.02], [0, 0, -0.35]); r.renderOrder = 5; }
  // letreiro em cima
  const topo = new THREE.Group(); raiz.add(topo);
  const placa = new THREE.Mesh(new THREE.BoxGeometry(L + 2 * C, 1.3, P + 2 * C), [matCorpo, matCorpo, matCorpo, matCorpo, (() => { const tx = placaDe(tema); return new THREE.MeshStandardMaterial({ map: tx, emissive: '#ffffff', emissiveMap: tx, emissiveIntensity: 0.55, roughness: 0.6 }); })(), matCorpo]);
  placa.position.set(L / 2, A + 0.8, P / 2); topo.add(placa);
  let ledTex = null;
  if (tema === 'neon') {   // letreiro de LED que corre, como o das fotos
    ledTex = textura(1024, 128, () => {});
    const m = new THREE.Mesh(new THREE.PlaneGeometry(L + 2 * C, 0.9), new THREE.MeshBasicMaterial({ map: ledTex }));
    m.position.set(L / 2, A + 1.95, P / 2 + 0.2); topo.add(m);
    caixa(matCorpo, -C, A + 1.45, P / 2, L + C, A + 2.45, P / 2 + 0.18);
  }
  if (tema === 'telefone') {
    const lt = new THREE.MeshStandardMaterial({ map: laterais(), emissive: '#ffffff', emissiveIntensity: 0.3 });
    for (const s of [-1, 1]) { const p = plano(lt, P * 0.8, 0.8, [L / 2 + s * (L / 2 + C + 0.01), A + 0.8, P / 2], [0, s * Math.PI / 2, 0]); p.renderOrder = 1; }
    caixa(matCorpo, -C - 0.1, A + 1.45, -C - 0.1, L + C + 0.1, A + 1.7, P + C + 0.1);   // telhadinho
  }
  // tubos de neon nas colunas da frente
  if (T.neon) {
    const n1 = neon(T.neon), n2 = neon(T.neon2 || T.neon);
    for (const x of [-C + 0.06, L + C - 0.14]) {
      caixa(n1, x, A * 0.52, P + C, x + 0.08, A - 0.2, P + C + 0.03);
      caixa(n2, x, 0.3, P + C, x + 0.08, A * 0.48, P + C + 0.03);
    }
    caixa(n1, -C, A + 0.12, P + C, L + C, A + 0.18, P + C + 0.03);
    caixa(n1, -C, -0.6, P + C + 0.9, L + C, -0.54, P + C + 0.93);
  }
  if (tema === 'estrelas' || tema === 'lanchonete') caixa(new THREE.MeshStandardMaterial({ color: T.borda, roughness: 0.3, metalness: 0.6 }), -C, -0.16, P + C, L + C, -0.06, P + C + 0.03);
  // painel de controle (prateleira) com alavanca, botão e visor
  const painel = new THREE.Group(); painel.position.set(L / 2, -0.55, P + C + 0.45); raiz.add(painel);
  const tampo = new THREE.Mesh(new THREE.BoxGeometry(L * 0.8, 0.2, 0.9), tema === 'telefone' ? new THREE.MeshStandardMaterial({ map: textura(512, 128, (g, w, h) => bandeira(g, 0, 0, w, h)) }) : matEscuro);
  tampo.rotation.x = 0.12; tampo.castShadow = true; painel.add(tampo);
  const frenteP = new THREE.Mesh(new THREE.BoxGeometry(L * 0.8, 0.45, 0.06), matCorpo); frenteP.position.set(0, -0.25, 0.45); painel.add(frenteP);
  const alavanca = new THREE.Group(); alavanca.position.set(-1.3, 0.1, 0); painel.add(alavanca);
  const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 10), matMetal); haste.position.y = 0.21; alavanca.add(haste);
  const bola = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 12), new THREE.MeshStandardMaterial({ color: '#e8f4ff', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.85 })); bola.position.y = 0.45; alavanca.add(bola);
  const botao = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.1, 24), neon(tema === 'neon' ? '#7ef9ff' : tema === 'lanchonete' ? '#ffd166' : '#ff4f6d')); botao.position.set(1.3, 0.15, 0); painel.add(botao);
  const visorTex = textura(512, 128, () => {});
  const visor = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.32), new THREE.MeshBasicMaterial({ map: visorTex })); visor.position.set(0, 0.11, 0.05); visor.rotation.x = -Math.PI / 2 + 0.12; painel.add(visor);

  /* garra: trilhos, ponte, carrinho, cabo enrolado, cubo e 3 dedos */
  const trilhoY = A - 0.25;
  caixa(matMetal, 0.02, trilhoY - 0.05, 0.1, 0.12, trilhoY + 0.05, P - 0.1);
  caixa(matMetal, L - 0.12, trilhoY - 0.05, 0.1, L - 0.02, trilhoY + 0.05, P - 0.1);
  const ponte = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, L - 0.2, 12), matMetal); ponte.rotation.z = Math.PI / 2; raiz.add(ponte);
  const carrinho = new THREE.Group(); raiz.add(carrinho);
  const cx = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.4, 0.5), matBranco); cx.castShadow = true; carrinho.add(cx);
  const adesivo = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.3), new THREE.MeshBasicMaterial({ map: textura(128, 128, (g) => { g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 128); texto(g, 'A', 64, 70, '800 96px Fredoka, system-ui, sans-serif', '#ff4f7b'); }) }));
  adesivo.position.set(0, 0, 0.255); carrinho.add(adesivo);
  // cabo prateado em "U" saindo do carrinho (como nas fotos)
  const u = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.25, -0.1, 0), new THREE.Vector3(-0.45, -0.9, 0.05), new THREE.Vector3(-0.15, -1.15, 0.08), new THREE.Vector3(0.05, -0.6, 0.05), new THREE.Vector3(0.1, -0.15, 0)]), 30, 0.035, 8), matMetal);
  carrinho.add(u);
  const espiral = (() => { const pts = []; for (let i = 0; i <= 600; i++) { const a = i / 600 * Math.PI * 2 * 40; pts.push(new THREE.Vector3(Math.cos(a) * 0.07, -i / 600, Math.sin(a) * 0.07)); } return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 900, 0.012, 5), new THREE.MeshStandardMaterial({ color: '#d9dde4', roughness: 0.35, metalness: 0.7 })); })();
  raiz.add(espiral);
  const garra = new THREE.Group(); raiz.add(garra);
  const cubo = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.3, 20), new THREE.MeshStandardMaterial({ color: tema === 'telefone' ? '#d6a94a' : '#c9ced6', roughness: 0.2, metalness: 0.95 }));
  cubo.castShadow = true; garra.add(cubo);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 8, 20), new THREE.MeshStandardMaterial({ color: tema === 'neon' ? '#3a7bd5' : '#9aa0a8', roughness: 0.3, metalness: 0.8 }));
  aro.rotation.x = Math.PI / 2; aro.position.y = -0.1; garra.add(aro);
  const curvaDedo = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.2, -0.22, 0), new THREE.Vector3(0.3, -0.5, 0), new THREE.Vector3(0.22, -0.72, 0), new THREE.Vector3(0.06, -0.8, 0)]);
  const geoDedo = new THREE.TubeGeometry(curvaDedo, 24, 0.028, 8);
  const dedos = [0, 1, 2].map((i) => {
    const piv = new THREE.Group(); piv.rotation.y = Math.PI / 2 + i * Math.PI * 2 / 3; piv.position.y = -0.12; garra.add(piv);
    const dobra = new THREE.Group(); dobra.position.x = 0.1; piv.add(dobra);
    const d = new THREE.Mesh(geoDedo, matMetal); d.castShadow = true; dobra.add(d);
    return dobra;
  });
  // mira: um anel embaixo da garra, em cima do que está no monte (o app liga só no fácil e no médio)
  const mira = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.3, 32), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false }));
  mira.rotation.x = -Math.PI / 2; mira.renderOrder = 4; raiz.add(mira);

  /* luzes */
  const amb = new THREE.HemisphereLight('#ffffff', '#3a3344', 1.1); raiz.add(amb);
  const sol = new THREE.DirectionalLight(T.luz, 2.4); sol.position.set(L / 2 + 0.4, A + 6, P / 2 + 1.2); sol.target.position.set(L / 2, 0, P / 2);
  sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); sol.shadow.camera.left = -4; sol.shadow.camera.right = 4; sol.shadow.camera.top = 4; sol.shadow.camera.bottom = -4; sol.shadow.camera.near = 1; sol.shadow.camera.far = 20; sol.shadow.bias = -0.002;
  raiz.add(sol); raiz.add(sol.target);
  const frenteLuz = new THREE.DirectionalLight('#ffffff', 0.9); frenteLuz.position.set(L / 2, 4, P + 8); raiz.add(frenteLuz);
  if (T.neon) { const n = new THREE.PointLight(T.neon, 6, 9, 1.6); n.position.set(L / 2, 2, P + 1.5); raiz.add(n); }

  function desenharLed(t) {
    const g = ledTex.userData.g, w = 1024, h = 128;
    g.fillStyle = '#020302'; g.fillRect(0, 0, w, h);
    const msg = '  A-GARRA  ★  PEGUE O SEU BICHINHO  ★  ', larg = msg.length * 46, desl = (t * 140) % larg;
    g.font = '800 92px Fredoka, system-ui, sans-serif'; g.textBaseline = 'middle';
    for (let k = -1; k < 3; k++) { const cores = ['#39ff6a', '#ff4fd8', '#7ef9ff', '#ffd400']; g.fillStyle = cores[(k + 4) % 4]; g.fillText(msg, k * larg - desl, h / 2 + 4); }
    g.fillStyle = 'rgba(0,0,0,.55)'; for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 3, h); for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 3);   // pontinhos de LED
    ledTex.needsUpdate = true;
  }

  return {
    raiz, mira,
    alvo: new THREE.Vector3(L / 2, 2.2, P / 2),
    visor(fichas, tempo, ganhos) {
      const g = visorTex.userData.g; g.fillStyle = '#0a1a3a'; g.fillRect(0, 0, 512, 128);
      g.font = '700 54px Fredoka, system-ui, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left';
      g.fillStyle = '#7ef9ff'; g.fillText('🪙' + fichas, 20, 66); g.fillStyle = '#ffd166'; g.fillText('🧸' + ganhos, 190, 66);
      if (tempo != null) { g.fillStyle = tempo <= 5 ? '#ff4f6d' : '#39ff6a'; g.fillText('⏱️' + tempo, 350, 66); }
      visorTex.needsUpdate = true;
    },
    atualizar(t, gr, extra) {
      // garra: carrinho e ponte seguem x/z; o cubo fica em y; o cabo enrolado estica entre os dois
      const bx = gr.balanco[0] * 0.5, bz = gr.balanco[1] * 0.5;
      carrinho.position.set(gr.x, trilhoY, gr.z); ponte.position.set(L / 2, trilhoY, gr.z);
      garra.position.set(gr.x + bx, gr.y, gr.z + bz); garra.rotation.set(gr.balanco[1] * 0.5, 0, -gr.balanco[0] * 0.5);
      const topoCabo = trilhoY - 0.2, l = Math.max(0.05, topoCabo - (gr.y + 0.15));
      espiral.position.set(gr.x + bx * 0.3, topoCabo, gr.z + bz * 0.3); espiral.scale.set(1, l, 1);
      espiral.rotation.set(gr.balanco[1] * 0.25, 0, -gr.balanco[0] * 0.25);
      const ab = Math.max(0, Math.min(1, gr.abertura));
      for (const d of dedos) d.rotation.z = -0.15 + ab * 0.55;   // abrir = pontas para fora
      // painel: a alavanca inclina para onde a garra anda; o botão pisca
      alavanca.rotation.set((extra.dz || 0) * 0.35, 0, -(extra.dx || 0) * 0.35);
      botao.material.emissiveIntensity = extra.podePegar ? 1.6 + Math.sin(t * 6) * 0.8 : 0.4;
      botao.position.y = extra.apertado ? 0.1 : 0.15;
      if (ledTex) desenharLed(t);
      if (extra.mira) { mira.visible = true; mira.position.set(gr.x, extra.mira + 0.03, gr.z); mira.material.opacity = 0.35 + Math.sin(t * 5) * 0.2; } else mira.visible = false;
    }
  };
}
