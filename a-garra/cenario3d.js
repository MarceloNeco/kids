/* H-rraaa (pasta a-garra) — as máquinas em 3D, fiéis às fotos de fliperama que o dono mandou (14/Nov/2026), mas com desenho próprio:
   nenhuma marca, letreiro ou personagem das fotos (no lugar deles, "H-rraaa", com o H colorido, e desenhos nossos).
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
import { criarPremio, MAQUINAS } from './premios3d.js';

const TEMAS = {
  telefone: { corpo: '#c8102e', escuro: '#8e0a20', fundo: '#2a1a1e', chao: '#3a1020', luz: '#ffe9d6', neon: null, borda: '#c8102e' },
  neon: { corpo: '#111214', escuro: '#050506', fundo: '#202322', chao: '#141a17', luz: '#e8fff0', neon: '#39ff6a', neon2: '#ffd400', borda: '#1a1a1a' },
  estrelas: { corpo: '#1d2c78', escuro: '#101a4d', fundo: '#1f3a8f', chao: '#1a2160', luz: '#e6efff', neon: '#3aa0ff', neon2: '#7ef9ff', borda: '#c9a24a' },
  lanchonete: { corpo: '#d62839', escuro: '#9c1b28', fundo: '#fff3df', chao: '#ffffff', luz: '#fff7e0', neon: '#ffd166', neon2: '#ff7ab8', borda: '#fff3df' },
  gigantes: { corpo: '#f4f2ff', escuro: '#cfc6f0', fundo: '#bfe3ff', chao: '#e9e3ff', luz: '#ffffff', neon: '#b06bff', neon2: '#7ef9ff', borda: '#ffffff' },
  bichos: { corpo: '#e9ecef', escuro: '#b8bec6', fundo: '#e8e2d8', chao: '#efe3cf', luz: '#fff4e2', neon: '#7ef9ff', neon2: '#ffb3d1', borda: '#c9ced6' }
};
// a máquina de Festas (festas.js) troca de cor e de enfeite com a festa do dia
const TEMAS_FESTA = {
  natal: { corpo: '#b3122e', escuro: '#7a0b1f', chao: '#f4f7fb', luz: '#fff3e0', neon: '#39d353', neon2: '#ffd166', borda: '#ffd166', texto: '#ffffff', titulo: ['FELIZ NATAL', 'MERRY CHRISTMAS', 'FELIZ NAVIDAD'] },
  carnaval: { corpo: '#5b1a9e', escuro: '#3b0f6b', chao: '#2b0f4f', luz: '#fff0ff', neon: '#ffd400', neon2: '#ff4fd8', borda: '#ffd400', texto: '#ffd400', titulo: ['CARNAVAL', 'CARNIVAL', 'CARNAVAL'] },
  pascoa: { corpo: '#a98ae6', escuro: '#7f62c4', chao: '#bfe8a6', luz: '#fffaf0', neon: '#ffb3d1', neon2: '#9be37d', borda: '#ffffff', texto: '#ffffff', titulo: ['FELIZ PÁSCOA', 'HAPPY EASTER', 'FELIZ PASCUA'] },
  junina: { corpo: '#d9661f', escuro: '#9c4512', chao: '#c9a46a', luz: '#fff2d6', neon: '#ffd166', neon2: '#e63946', borda: '#ffd166', texto: '#ffd166', titulo: ['ARRAIÁ DA H-rraaa', 'JUNE PARTY', 'VERBENA'] },
  criancas: { corpo: '#1e88e5', escuro: '#1565c0', chao: '#ffe9a8', luz: '#ffffff', neon: '#ffd400', neon2: '#39ff6a', borda: '#ffd400', texto: '#ffffff', titulo: ['DIA DAS CRIANÇAS', "CHILDREN'S DAY", 'DÍA DEL NIÑO'] },
  bruxas: { corpo: '#241a33', escuro: '#120c1a', chao: '#3b2a52', luz: '#ffe2c2', neon: '#ff8a1f', neon2: '#9b5cff', borda: '#ff8a1f', texto: '#ff8a1f', titulo: ['DIA DAS BRUXAS', 'HALLOWEEN', 'HALLOWEEN'] }
};
let festa = 'natal';   // a festa da máquina que está sendo montada

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
function texto(g, txt, x, y, fonte, cor, sombra, larg) { g.font = fonte; g.textAlign = 'center'; g.textBaseline = 'middle'; if (sombra) brilho(g, sombra, 18); g.fillStyle = cor; if (larg) g.fillText(txt, x, y, larg); else g.fillText(txt, x, y); g.shadowBlur = 0; }
// letreiros no idioma escolhido na estante (../idioma.js); a máquina é montada de novo a cada partida
const tx = (pt, en, es) => (window.BolinhoIdioma ? window.BolinhoIdioma.t(pt, en, es) : pt);
const NOME = () => 'H-rraaa';   // o nome do jogo (dono, 14/Nov/2026), igual nos três idiomas
// o nome nos letreiros: o "H" com as cores do arco-íris e o resto na cor da máquina (mesmos argumentos do texto())
function nomeColorido(g, x, y, fonte, cor, sombra, larg) {
  const txt = NOME(), h = txt[0], resto = txt.slice(1), px = +(fonte.match(/(\d+)px/) || [0, 100])[1];
  g.save(); g.font = fonte; g.textBaseline = 'middle'; g.textAlign = 'left';
  const wh = g.measureText(h).width, wr = g.measureText(resto).width, tot = wh + wr, k = larg && tot > larg ? larg / tot : 1;
  g.translate(x - tot * k / 2, y); g.scale(k, 1);
  if (sombra) brilho(g, sombra, 18);
  g.fillStyle = cor; g.fillText(resto, wh, 0);
  const gr = g.createLinearGradient(0, -px * 0.4, wh, px * 0.4);
  ARCO_IRIS.forEach((c, i) => gr.addColorStop(i / (ARCO_IRIS.length - 1), c));
  brilho(g, '#ff4fd8', 14); g.fillStyle = gr; g.fillText(h, 0, 0);
  g.shadowBlur = 0; g.lineWidth = Math.max(2, px * 0.025); g.strokeStyle = 'rgba(20,10,30,.55)'; g.strokeText(h, 0, 0);
  g.restore();
}
const ARCO_IRIS = ['#ff3b3b', '#ff9f1c', '#ffe14d', '#39ff6a', '#3ec7ff', '#9b5cff', '#ff4fd8'];
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
function patinha(g, x, y, s, cor, giro) {
  g.save(); g.translate(x, y); g.rotate(giro || 0); g.fillStyle = cor;
  g.beginPath(); g.ellipse(0, s * 0.35, s * 0.55, s * 0.45, 0, 0, 7); g.fill();
  [[-0.55, -0.25], [-0.2, -0.6], [0.2, -0.6], [0.55, -0.25]].forEach(([a, b]) => { g.beginPath(); g.ellipse(a * s, b * s, s * 0.2, s * 0.26, a * 0.5, 0, 7); g.fill(); });
  g.restore();
}
function burguerIcone(g, x, y, s) {
  g.fillStyle = '#f0a94e'; g.beginPath(); g.ellipse(x, y - s * 0.12, s * 0.5, s * 0.3, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#7ed957'; g.fillRect(x - s * 0.52, y - s * 0.12, s * 1.04, s * 0.08);
  g.fillStyle = '#6b3a22'; g.fillRect(x - s * 0.5, y - s * 0.04, s, s * 0.14);
  g.fillStyle = '#e8a556'; g.beginPath(); g.ellipse(x, y + s * 0.14, s * 0.48, s * 0.1, 0, 0, 7); g.fill();
}

const tituloFesta = () => { const t = TEMAS_FESTA[festa].titulo; return tx(t[0], t[1], t[2]); };
function bandeirinhas(g, w, y, n) {   // varal de bandeirinhas de festa junina
  g.strokeStyle = '#3a2418'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, y); g.quadraticCurveTo(w / 2, y + 40, w, y); g.stroke();
  for (let i = 0; i < n; i++) { const x = (i + 0.5) * w / n, yy = y + 40 * (1 - ((x - w / 2) / (w / 2)) ** 2) * 0.5 + 2; g.fillStyle = ['#e63946', '#ffd166', '#3aa0ff', '#39b54a', '#ff7ab8'][i % 5]; g.beginPath(); g.moveTo(x - 22, yy); g.lineTo(x + 22, yy); g.lineTo(x + 22, yy + 46); g.lineTo(x, yy + 32); g.lineTo(x - 22, yy + 46); g.closePath(); g.fill(); }
}
function confete(g, w, h, n) { for (let i = 0; i < n; i++) { g.fillStyle = ARCO_IRIS[i % ARCO_IRIS.length]; g.save(); g.translate((i * 97) % w, (i * 151) % h); g.rotate(i); g.fillRect(-6, -3, 12, 6); g.restore(); } }
function ovoDesenho(g, x, y, s, cor, faixa) { g.fillStyle = cor; g.beginPath(); g.ellipse(x, y, s * 0.7, s, 0, 0, 7); g.fill(); g.save(); g.clip(); g.fillStyle = faixa; g.fillRect(x - s, y - s * 0.2, s * 2, s * 0.25); g.fillRect(x - s, y + s * 0.35, s * 2, s * 0.15); g.restore(); }
function morcegoDesenho(g, x, y, s) { g.fillStyle = '#120c1a'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - s * 0.6, y - s * 0.6, x - s * 1.4, y - s * 0.2); g.quadraticCurveTo(x - s * 0.9, y + s * 0.05, x - s * 0.8, y + s * 0.4); g.quadraticCurveTo(x - s * 0.4, y + s * 0.1, x, y + s * 0.3); g.quadraticCurveTo(x + s * 0.4, y + s * 0.1, x + s * 0.8, y + s * 0.4); g.quadraticCurveTo(x + s * 0.9, y + s * 0.05, x + s * 1.4, y - s * 0.2); g.quadraticCurveTo(x + s * 0.6, y - s * 0.6, x, y); g.fill(); }
function fundoFesta(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h), cor = { natal: ['#14244f', '#2a4a8f'], carnaval: ['#3b0f6b', '#7b2cbf'], pascoa: ['#e8dcff', '#c9f0d6'], junina: ['#101a3a', '#2a1a4a'], criancas: ['#7ec8ff', '#d6f0ff'], bruxas: ['#120c1a', '#3b2357'] }[festa];
  gr.addColorStop(0, cor[0]); gr.addColorStop(1, cor[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const tit = (cor2, sombra) => texto(g, tituloFesta(), w / 2, h * 0.55, '800 72px Fredoka, system-ui, sans-serif', cor2, sombra, w * 0.9);
  if (festa === 'natal') {
    for (let i = 0; i < 140; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.4 + (i % 4) * 0.15) + ')'; g.beginPath(); g.arc((i * 97) % w, (i * 151) % h, 2 + (i % 3) * 2, 0, 7); g.fill(); }
    for (let k = 0; k < 3; k++) { g.fillStyle = '#1f7a3a'; g.beginPath(); g.moveTo(w * 0.5, h * (0.06 + k * 0.08)); g.lineTo(w * (0.36 - k * 0.04), h * (0.2 + k * 0.08)); g.lineTo(w * (0.64 + k * 0.04), h * (0.2 + k * 0.08)); g.closePath(); g.fill(); }
    g.fillStyle = '#6b3f22'; g.fillRect(w * 0.47, h * 0.36, w * 0.06, h * 0.06); estrela(g, w * 0.5, h * 0.06, 34, 14, '#ffd166');
    for (let i = 0; i < 12; i++) { g.fillStyle = ['#e63946', '#ffd166', '#3aa0ff'][i % 3]; g.beginPath(); g.arc(w * (0.42 + (i * 0.37) % 0.17), h * (0.16 + (i % 4) * 0.055), 9, 0, 7); g.fill(); }
    tit('#ffffff', '#ff4f6d');
  } else if (festa === 'carnaval') {
    confete(g, w, h, 220);
    g.lineWidth = 6; for (let k = 0; k < 6; k++) { g.strokeStyle = ARCO_IRIS[k]; g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, h * (0.1 + k * 0.06) + Math.sin(x / 40 + k) * 18); g.stroke(); }
    tit('#ffd400', '#ff4fd8');
  } else if (festa === 'pascoa') {
    [[0.2, 0.25, '#ff9fc8', '#fff3a6'], [0.4, 0.2, '#a6e3ff', '#ff7ab8'], [0.6, 0.27, '#ffd166', '#9be37d'], [0.8, 0.2, '#c6a4ff', '#ffffff']].forEach(([x, y, a, b]) => ovoDesenho(g, w * x, h * y, 70, a, b));
    for (let i = 0; i < 40; i++) { g.fillStyle = '#7bc043'; g.fillRect((i * 53) % w, h * 0.42 + (i % 3) * 8, 6, 30); }
    tit('#7f62c4', null);
  } else if (festa === 'junina') {
    for (let i = 0; i < 60; i++) estrela(g, (i * 97) % w, (i * 61) % (h * 0.45), 4, 1.6, 'rgba(255,240,180,.8)');
    bandeirinhas(g, w, h * 0.05, 14); bandeirinhas(g, w, h * 0.2, 12);
    g.fillStyle = '#6b3f22'; g.fillRect(w * 0.42, h * 0.43, w * 0.16, 16); g.save(); brilho(g, '#ff8a1f', 30); g.fillStyle = '#ff8a1f'; g.beginPath(); g.moveTo(w * 0.44, h * 0.43); g.quadraticCurveTo(w * 0.5, h * 0.25, w * 0.56, h * 0.43); g.fill(); g.fillStyle = '#ffd84d'; g.beginPath(); g.moveTo(w * 0.47, h * 0.43); g.quadraticCurveTo(w * 0.5, h * 0.33, w * 0.53, h * 0.43); g.fill(); g.restore();
    tit('#ffd166', '#e63946');
  } else if (festa === 'criancas') {
    for (let i = 0; i < 9; i++) { const x = w * (0.1 + i * 0.1), y = h * (0.15 + (i % 3) * 0.08); g.strokeStyle = '#555'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + 50); g.lineTo(x + 10, y + 140); g.stroke(); g.fillStyle = ARCO_IRIS[i % ARCO_IRIS.length]; g.beginPath(); g.ellipse(x, y, 38, 48, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(x - 12, y - 16, 8, 14, -0.4, 0, 7); g.fill(); }
    tit('#1565c0', null);
  } else {
    g.save(); brilho(g, '#fff3c4', 40); g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(w * 0.75, h * 0.16, 90, 0, 7); g.fill(); g.restore();
    [[0.2, 0.12, 40], [0.38, 0.25, 30], [0.6, 0.08, 26], [0.85, 0.35, 34]].forEach(([x, y, s]) => morcegoDesenho(g, w * x, h * y, s));
    for (let i = 0; i < 5; i++) { const x = w * (0.12 + i * 0.19); g.fillStyle = '#ff8a1f'; g.beginPath(); g.ellipse(x, h * 0.44, 46, 36, 0, 0, 7); g.fill(); g.fillStyle = '#3b2a12'; g.beginPath(); g.arc(x - 14, h * 0.43, 7, 0, 7); g.arc(x + 14, h * 0.43, 7, 0, 7); g.fill(); g.fillStyle = '#5a7a2b'; g.fillRect(x - 4, h * 0.44 - 46, 8, 14); }
    tit('#ff8a1f', '#9b5cff');
  }
}
// letras gordinhas, cada uma de uma cor, com contorno branco (como os letreiros das cabines de pelúcia gigante)
function bolhas(g, txt, x, y, px, larg) {
  g.save(); g.font = '800 ' + px + 'px Fredoka, system-ui, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left';
  const ws = [...txt].map((c) => g.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0), k = larg && tot > larg ? larg / tot : 1;
  g.translate(x - tot * k / 2, y); g.scale(k, 1);
  let cx = 0; const cores = ['#ff6fae', '#ffb02e', '#39d353', '#3aa0ff', '#b06bff', '#ff4f6d'];
  [...txt].forEach((c, i) => { g.lineWidth = px * 0.16; g.strokeStyle = '#ffffff'; g.lineJoin = 'round'; g.strokeText(c, cx, 0); g.fillStyle = cores[i % cores.length]; g.fillText(c, cx, 0); g.lineWidth = px * 0.03; g.strokeStyle = 'rgba(40,20,80,.5)'; g.strokeText(c, cx, 0); cx += ws[i]; });
  g.restore();
}
function nuvem(g, x, y, s) { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, s, 0, 7); g.arc(x + s * 0.9, y + s * 0.15, s * 0.75, 0, 7); g.arc(x - s * 0.9, y + s * 0.2, s * 0.7, 0, 7); g.fill(); }
const GIGANTES = () => tx('GIGANTES', 'GIANTS', 'GIGANTES');
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
      nomeColorido(g, w * 0.7, h * 0.52, '700 64px Fredoka, system-ui, sans-serif', '#39ff6a', '#39ff6a', 560);
    } else if (tema === 'estrelas') {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#24318f'); gr.addColorStop(1, '#141c5c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 160; i++) { g.globalAlpha = 0.3 + (i % 5) * 0.14; estrela(g, (i * 97) % w, (i * 151) % h, 3 + (i % 3) * 2, 1.4, '#fff7c2'); }
      g.globalAlpha = 1;
      [[0.3, 0.22, 0], [0.5, 0.22, 1], [0.7, 0.22, 2], [0.4, 0.42, 1], [0.6, 0.42, 0]].forEach(([x, y, q]) => {
        hexagono(g, x * w, y * h, 95); g.fillStyle = '#3a2f8f'; g.fill(); g.lineWidth = 8; g.strokeStyle = '#7ef9ff'; g.stroke(); insetoIcone(g, x * w, y * h, 110, q);
      });
      texto(g, tx('INSETOS OFICIAIS DA H-rraaa', 'OFFICIAL H-rraaa BUGS', 'INSECTOS OFICIALES DE H-rraaa'), w / 2, h * 0.6, '700 46px Fredoka, system-ui, sans-serif', 'rgba(255,255,255,.75)', null, w * 0.92);
    } else if (tema === 'festas') { fundoFesta(g, w, h);
    } else if (tema === 'gigantes') {   // céu clarinho com nuvens e estrelas, letreiro de letras gordinhas
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9fd3ff'); gr.addColorStop(1, '#e6d9ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      [[0.2, 0.12, 50], [0.75, 0.08, 40], [0.5, 0.42, 46], [0.12, 0.45, 36], [0.88, 0.38, 42]].forEach(([x, y, r]) => nuvem(g, w * x, h * y, r));
      for (let i = 0; i < 40; i++) estrela(g, (i * 97) % w, (i * 151) % (h * 0.6), 7 + (i % 3) * 3, 3, 'rgba(255,255,255,.85)');
      bolhas(g, GIGANTES(), w / 2, h * 0.26, 130, w * 0.9);
    } else if (tema === 'bichos') {   // parede clara de pet shop, com patinhas e uma janelinha de luzes do fliperama
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f4efe6'); gr.addColorStop(1, '#ddd3c4'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 18; i++) patinha(g, 80 + (i * 173) % (w - 160), 90 + (i * 97) % (h * 0.55), 22 + (i % 3) * 6, 'rgba(160,130,100,.25)', i * 0.7);
      g.fillStyle = '#2a2f3a'; g.fillRect(w * 0.55, h * 0.12, w * 0.32, h * 0.26);
      for (let i = 0; i < 26; i++) { g.fillStyle = ['#ff4fd8', '#7ef9ff', '#ffd400', '#39ff6a'][i % 4]; g.globalAlpha = 0.5; g.beginPath(); g.arc(w * 0.57 + (i * 37) % (w * 0.28), h * 0.15 + (i * 53) % (h * 0.2), 6 + (i % 3) * 4, 0, 7); g.fill(); }
      g.globalAlpha = 1; g.strokeStyle = '#c9ced6'; g.lineWidth = 12; g.strokeRect(w * 0.55, h * 0.12, w * 0.32, h * 0.26);
      texto(g, tx('BICHOS DE VERDADE', 'REAL ANIMALS', 'ANIMALES DE VERDAD'), w * 0.3, h * 0.24, '700 50px Fredoka, system-ui, sans-serif', '#a07850', null, w * 0.48);
    } else {
      for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.fillStyle = ((x + y) / 64) % 2 ? '#fff3df' : '#ffe0b8'; g.fillRect(x, y, 64, 64); }
      g.fillStyle = '#2a1a12'; g.fillRect(w * 0.14, h * 0.1, w * 0.72, h * 0.42); g.strokeStyle = '#c98b4a'; g.lineWidth = 14; g.strokeRect(w * 0.14, h * 0.1, w * 0.72, h * 0.42);
      texto(g, tx('CARDÁPIO', 'MENU', 'CARTA'), w / 2, h * 0.16, '700 56px Fredoka, system-ui, sans-serif', '#ffd166');
      for (let i = 0; i < 3; i++) { burguerIcone(g, w * (0.3 + i * 0.2), h * 0.3, 90); texto(g, [tx('X-SALADA', 'SALAD', 'ENSALADA'), tx('X-BACON', 'BACON', 'BEICON'), tx('DUPLO', 'DOUBLE', 'DOBLE')][i], w * (0.3 + i * 0.2), h * 0.42, '600 30px Fredoka, system-ui, sans-serif', '#ffffff', null, w * 0.18); }
      g.save(); brilho(g, '#ff7ab8', 14); g.strokeStyle = '#ff7ab8'; g.lineWidth = 6; g.strokeRect(w * 0.1, h * 0.06, w * 0.8, h * 0.5); g.restore();
    }
  });
}
function placaDe(tema) {
  return textura(1024, 256, (g, w, h) => {
    if (tema === 'telefone') { g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); nomeColorido(g, w / 2, h / 2 + 6, '800 150px Fredoka, system-ui, sans-serif', '#111', null, w * 0.7); estrela(g, 90, h / 2, 50, 22, '#c8102e'); estrela(g, w - 90, h / 2, 50, 22, '#c8102e'); }
    else if (tema === 'neon') { g.fillStyle = '#050505'; g.fillRect(0, 0, w, h); nomeColorido(g, w / 2, h / 2 + 6, '800 150px Fredoka, system-ui, sans-serif', '#c6ffd4', '#39ff6a', w * 0.9); }
    else if (tema === 'estrelas') { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2b3aa0'); gr.addColorStop(1, '#101a4d'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) estrela(g, (i * 137) % w, (i * 71) % h, 6, 2.5, 'rgba(255,240,180,.7)'); nomeColorido(g, w / 2, h / 2 + 6, '800 150px Fredoka, system-ui, sans-serif', '#ffd166', '#ff9f1c', w * 0.9); }
    else if (tema === 'festas') { const T = TEMAS_FESTA[festa]; g.fillStyle = T.escuro; g.fillRect(0, 0, w, h); if (festa === 'carnaval') confete(g, w, h, 60); if (festa === 'junina') bandeirinhas(g, w, 0, 12); nomeColorido(g, w / 2, h / 2 + 10, '800 140px Fredoka, system-ui, sans-serif', T.texto, T.neon, w * 0.62); const ic = [...(window.Festas ? window.Festas.LISTA[festa].ico : '🎉🎉')]; texto(g, ic[0], 110, h / 2 + 8, '100px system-ui, sans-serif', '#fff'); texto(g, ic[ic.length - 1], w - 110, h / 2 + 8, '100px system-ui, sans-serif', '#fff'); }
    else if (tema === 'gigantes') { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#bfe3ff'); gr.addColorStop(1, '#9fd3ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 24; i++) estrela(g, (i * 137) % w, (i * 71) % h, 8, 3, 'rgba(255,255,255,.8)'); bolhas(g, GIGANTES(), w * 0.36, h / 2 + 6, 120, w * 0.6); nomeColorido(g, w * 0.8, h / 2 + 6, '800 80px Fredoka, system-ui, sans-serif', '#5b3fa8', null, w * 0.3); }
    else if (tema === 'bichos') { g.fillStyle = '#f4f6f8'; g.fillRect(0, 0, w, h); nomeColorido(g, w / 2, h / 2 + 6, '800 150px Fredoka, system-ui, sans-serif', '#4a3a2c', null, w * 0.66); patinha(g, 110, h / 2, 46, '#b5652e', -0.3); patinha(g, w - 110, h / 2, 46, '#1d1715', 0.3); }
    else { g.fillStyle = '#d62839'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { g.fillStyle = (x / 64) % 2 ? '#fff' : '#d62839'; g.fillRect(x, h - 40, 64, 40); } nomeColorido(g, w / 2, h / 2 - 12, '800 140px Fredoka, system-ui, sans-serif', '#ffd166', '#7a1020', w * 0.6); burguerIcone(g, 110, h / 2, 110); burguerIcone(g, w - 110, h / 2, 110); }
  });
}
function laterais(tema) {   // a placa "TELEFONE" das laterais da cabine
  return textura(512, 128, (g, w, h) => { g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); texto(g, tx('TELEFONE', 'TELEPHONE', 'TELÉFONO'), w / 2, h / 2 + 4, '800 78px Fredoka, system-ui, sans-serif', '#111', null, w * 0.92); });
}
function frenteBase(tema) {
  return textura(1024, 1024, (g, w, h) => {
    const T = tema === 'festas' ? TEMAS_FESTA[festa] : TEMAS[tema];
    g.fillStyle = T.corpo; g.fillRect(0, 0, w, h);
    if (tema === 'telefone') { bandeira(g, 40, 520, 230, 250); bandeira(g, w - 270, 520, 230, 250); }
    if (tema === 'neon') { g.save(); brilho(g, '#39ff6a', 22); g.strokeStyle = '#39ff6a'; g.lineWidth = 12; g.strokeRect(40, 40, w - 80, h - 80); g.restore(); nomeColorido(g, w * 0.62, h * 0.28, '800 120px Fredoka, system-ui, sans-serif', '#39ff6a', '#39ff6a', 500); }
    if (tema === 'estrelas') { for (let i = 0; i < 80; i++) estrela(g, (i * 97) % w, (i * 151) % h, 6 + (i % 3) * 3, 2.6, 'rgba(255,240,180,.8)'); nomeColorido(g, w * 0.62, h * 0.28, '800 120px Fredoka, system-ui, sans-serif', '#ffd166', '#ff9f1c', 500); }
    if (tema === 'bichos') { for (let i = 0; i < 10; i++) patinha(g, 480 + (i * 131) % 500, 520 + (i * 89) % 420, 26, 'rgba(120,100,80,.3)', i); nomeColorido(g, w * 0.62, h * 0.28, '800 120px Fredoka, system-ui, sans-serif', '#4a3a2c', null, 500); }
    if (tema === 'gigantes') { for (let k = 0; k < 6; k++) { g.strokeStyle = ARCO_IRIS[k]; g.lineWidth = 26; g.beginPath(); g.arc(w * 0.72, h + 60, 420 - k * 26, Math.PI, 2 * Math.PI); g.stroke(); } bolhas(g, GIGANTES(), w * 0.66, h * 0.26, 110, 560); }
    if (tema === 'festas') { if (festa === 'carnaval' || festa === 'criancas') confete(g, w, h, 120); if (festa === 'natal') for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc((i * 97) % w, (i * 151) % h, 4 + (i % 3) * 2, 0, 7); g.fill(); } if (festa === 'junina') bandeirinhas(g, w, 520, 10); if (festa === 'bruxas') morcegoDesenho(g, w * 0.7, h * 0.7, 60); texto(g, tituloFesta(), w * 0.66, h * 0.28, '800 74px Fredoka, system-ui, sans-serif', T.texto, T.neon, 560); }
    if (tema === 'lanchonete') { for (let y = 640; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.fillStyle = ((x + y) / 64) % 2 ? '#fff' : '#111'; g.fillRect(x, y, 64, 64); } nomeColorido(g, w * 0.62, h * 0.28, '800 120px Fredoka, system-ui, sans-serif', '#ffd166', '#7a1020', 500); }
    // portinha do prêmio (embaixo do buraco, à esquerda)
    const px = 50, py = 120, pw = 330, ph = 330;
    g.fillStyle = tema === 'lanchonete' || tema === 'bichos' || tema === 'gigantes' ? '#fff3df' : tema === 'telefone' ? '#a00d24' : '#0b0b0b'; g.fillRect(px - 14, py - 14, pw + 28, ph + 28);
    g.fillStyle = '#050505'; g.fillRect(px, py, pw, ph * 0.62);
    if (tema === 'telefone') for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#fff' : '#111'; g.fillRect(px + i * pw / 6, py + ph * 0.66 + j * 28, pw / 6, 28); }
    texto(g, tx('PRÊMIO', 'PRIZE', 'PREMIO'), px + pw / 2, py + ph * 0.9, '800 64px Fredoka, system-ui, sans-serif', tema === 'neon' ? '#39ff6a' : tema === 'estrelas' ? '#ffd166' : tema === 'lanchonete' ? '#d62839' : tema === 'bichos' || tema === 'gigantes' ? '#4a3a2c' : tema === 'festas' ? TEMAS_FESTA[festa].texto : '#ffffff');
  });
}

/* ---------- a menininha das máquinas gigantes (dono, 20/Nov/2026: "pra você ver o tanto que é gigante") ----------
   Uma criança de uns 1,15 m de pé ao lado da cabine, desenho próprio (vestido, rabo de cavalo, tênis). Na introdução ela
   acena para a câmera, vira para a máquina e aponta lá para cima; depois fica olhando a máquina. Nunca na frente do vidro. */
function criarMenina(altura) {
  const g = new THREE.Group(), mt = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75 });
  const PELE = mt('#f2c4a0'), CABELO = mt('#5a3420'), VESTIDO = mt('#ff6fae'), BRANCO = mt('#ffffff'), TENIS = mt('#3a7bd5'), ESCURO = mt('#1b1512'), ROSA = mt('#ff9fb8');
  const peca = (pai, geo, mat, p, e, r) => { const m = new THREE.Mesh(geo, mat); m.position.set(...p); if (e) m.scale.set(...e); if (r) m.rotation.set(...r); m.castShadow = true; pai.add(m); return m; };
  const bola = new THREE.SphereGeometry(1, 18, 14), caps = new THREE.CapsuleGeometry(1, 1, 6, 12), cil = new THREE.CylinderGeometry(1, 1, 1, 18);
  for (const x of [-0.045, 0.045]) {
    peca(g, caps, PELE, [x, 0.25, 0], [0.034, 0.15, 0.034]);
    peca(g, cil, BRANCO, [x, 0.1, 0], [0.037, 0.1, 0.037]);
    peca(g, new THREE.BoxGeometry(1, 1, 1), TENIS, [x, 0.03, 0.025], [0.07, 0.055, 0.13]);
  }
  peca(g, new THREE.CylinderGeometry(0.075, 0.2, 0.36, 22), VESTIDO, [0, 0.58, 0]);
  peca(g, cil, VESTIDO, [0, 0.79, 0], [0.082, 0.15, 0.07]);
  peca(g, new THREE.TorusGeometry(0.16, 0.012, 6, 24), BRANCO, [0, 0.41, 0], null, [Math.PI / 2, 0, 0]);   // barrado
  peca(g, cil, PELE, [0, 0.88, 0], [0.028, 0.05, 0.028]);
  const cabeca = new THREE.Group(); cabeca.position.set(0, 0.95, 0); g.add(cabeca);
  peca(cabeca, bola, PELE, [0, 0, 0], [0.1, 0.1, 0.095]);
  peca(cabeca, bola, CABELO, [0, 0.018, -0.014], [0.106, 0.104, 0.1]);
  peca(cabeca, bola, CABELO, [0, 0.06, 0.05], [0.08, 0.035, 0.05], [0.4, 0, 0]);   // franja
  peca(cabeca, bola, CABELO, [0, 0.03, -0.13], [0.05, 0.075, 0.05], [-0.5, 0, 0]);   // rabo de cavalo
  peca(cabeca, bola, ROSA, [0, 0.075, -0.1], [0.04, 0.025, 0.025]);   // lacinho
  for (const x of [-0.034, 0.034]) { peca(cabeca, bola, ESCURO, [x, 0.0, 0.088], [0.013, 0.017, 0.01]); peca(cabeca, bola, ROSA, [x * 1.6, -0.03, 0.078], [0.016, 0.01, 0.008]); }
  peca(cabeca, new THREE.TorusGeometry(0.022, 0.006, 6, 12, Math.PI), ESCURO, [0, -0.035, 0.09], null, [0, 0, Math.PI]);
  const bracos = [-1, 1].map((sx) => {
    const piv = new THREE.Group(); piv.position.set(sx * 0.1, 0.84, 0); g.add(piv);
    peca(piv, caps, PELE, [0, -0.14, 0], [0.026, 0.11, 0.026]);
    peca(piv, bola, PELE, [0, -0.29, 0], [0.032, 0.032, 0.032]);
    peca(piv, cil, VESTIDO, [0, -0.02, 0], [0.04, 0.06, 0.04]);   // mangas
    piv.rotation.z = sx * 0.12; return piv;
  });
  g.scale.setScalar(altura);
  // t: segundos desde o começo da introdução (null = depois dela); giroMaquina: para onde é a máquina
  function atualizar(t, giroMaquina) {
    const respira = Math.sin(performance.now() / 600) * 0.01;
    if (t != null && t < 1.5) {   // acena para a câmera
      g.rotation.y = 0.35; cabeca.rotation.set(0.05, 0, Math.sin(t * 4) * 0.08);
      bracos[1].rotation.set(0, 0, 2.6 + Math.sin(t * 12) * 0.35); bracos[0].rotation.set(0, 0, -0.12);
    } else if (t != null && t < 2.3) {   // vira para a máquina
      const k = (t - 1.5) / 0.8; g.rotation.y = 0.35 + (giroMaquina - 0.35) * k;
      bracos[1].rotation.set(0, 0, 2.6 * (1 - k) + 0.12 * k); cabeca.rotation.set(-0.45 * k, 0, 0);
    } else if (t != null) {   // aponta lá para cima
      g.rotation.y = giroMaquina; cabeca.rotation.set(-0.5, 0, 0);
      bracos[0].rotation.set(-2.5 + Math.sin(t * 3) * 0.08, 0, -0.12); bracos[1].rotation.set(0, 0, 0.12);
    } else {   // olhando a máquina
      g.rotation.y = giroMaquina; cabeca.rotation.set(-0.4 + respira * 3, 0, 0);
      bracos[0].rotation.set(0, 0, -0.12); bracos[1].rotation.set(0, 0, 0.12);
    }
    g.position.y = g.userData.y0 + respira * altura * 0.3;
  }
  return { g, atualizar };
}
// põe a menininha de pé no chão, ao lado da cabine, olhando para o meio dela
function porMenina(raiz, altura, x, z, alvoX, alvoZ) {
  const m = criarMenina(altura); m.g.position.set(x, -3.3, z); m.g.userData.y0 = -3.3; raiz.add(m.g);
  const giro = Math.atan2(alvoX - x, alvoZ - z);
  return { g: m.g, altura, atualizar: (t) => m.atualizar(t, giro) };
}

/* ---------- a máquina ---------- */
export function montarMaquina(cena, tema, M, op) {
  if (tema === 'festas') festa = (op && TEMAS_FESTA[op.festa]) ? op.festa : 'natal';
  const T = tema === 'festas' ? TEMAS_FESTA[festa] : TEMAS[tema] || TEMAS.telefone, { L, P, A, BX, BZ, AB } = M;
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
  plano(new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.95 }), 60, 40, [L / 2, -3.3, 10], [-Math.PI / 2, 0, 0]);

  /* por dentro: chão (sem o buraco), fundo, laterais, teto com LED */
  const chaoTex = textura(512, 512, (g, w, h) => {
    if (tema === 'lanchonete') { for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.fillStyle = ((x + y) / 64) % 2 ? '#111' : '#f5f5f5'; g.fillRect(x, y, 64, 64); } }
    else if (tema === 'bichos') {   // cobertor fofinho, como o do vídeo dos filhotes
      g.fillStyle = '#efe3cf'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 9000; i++) { const x = (i * 7919) % w, y = (i * 104729) % h, c = 200 + (i * 31) % 50; g.fillStyle = 'rgba(' + c + ',' + (c - 18) + ',' + (c - 45) + ',.55)'; g.beginPath(); g.arc(x, y, 2 + (i % 4), 0, 7); g.fill(); }
    }
    else if (tema === 'gigantes') {   // cobertor de pelúcia lilás
      g.fillStyle = T.chao; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 6000; i++) { const x = (i * 7919) % w, y = (i * 104729) % h; g.fillStyle = i % 3 ? 'rgba(200,185,240,.55)' : 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(x, y, 2 + (i % 4), 0, 7); g.fill(); }
    }
    else if (tema === 'festas' && (festa === 'natal' || festa === 'pascoa')) {   // neve fofinha / gramado
      g.fillStyle = T.chao; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 5000; i++) { const x = (i * 7919) % w, y = (i * 104729) % h; g.fillStyle = festa === 'natal' ? 'rgba(200,215,235,.5)' : 'rgba(90,160,60,.45)'; g.fillRect(x, y, festa === 'natal' ? 4 : 2, festa === 'natal' ? 4 : 7); }
    }
    else if (tema === 'festas') {
      g.fillStyle = T.chao; g.fillRect(0, 0, w, h);
      if (festa === 'carnaval' || festa === 'criancas') confete(g, w, h, 160);
      else for (let i = 0; i < 3000; i++) { g.fillStyle = festa === 'junina' ? 'rgba(150,110,50,.5)' : 'rgba(20,10,30,.35)'; g.fillRect((i * 7919) % w, (i * 104729) % h, 2, festa === 'junina' ? 9 : 3); }   // palha / veludo
    }
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
    plano(matVidro, P, A, [x, A / 2, P / 2], [0, Math.PI / 2, 0]);   // vidro: dá para ver de lado a profundidade da garra
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
  // colunas de lâmpadas redondas que trocam de cor, como as do vídeo do dono (19/Nov/2026)
  const lampadas = [];
  if (tema === 'festas') {
    for (const x of [-C / 2, L + C / 2]) for (let i = 0; i < 11; i++) {
      const mt = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 1.4, roughness: 0.3 });
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), mt); b.position.set(x, 0.4 + i * (A - 0.8) / 10, P + C + 0.06); raiz.add(b); lampadas.push(b);
    }
    // três prêmios da festa sentados em cima do letreiro
    const tipos = (window.Festas ? window.Festas.LISTA[festa].tipos : []);
    [[-0.3, 0], [L / 2, 1], [L + 0.3, 2]].forEach(([x, i]) => { if (!tipos[i * 2]) return; const o = criarPremio(tipos[i * 2]); o.position.set(x, A + 2.15, P / 2 + 0.5); o.scale.setScalar(0.75); o.rotation.y = (1 - i) * 0.4; topo.add(o); });
  }
  if (tema === 'gigantes') {   // pelúcias enormes sentadas em cima da cabine, como nas fotos
    const tipos = MAQUINAS.gigantes.tipos;
    [[-0.1, 0, 0.5], [L / 2, 3, 0], [L + 0.1, 5, -0.5]].forEach(([x, i, giro]) => { const o = criarPremio(tipos[i]); o.position.set(x, A + 2.25, P / 2 + 0.6); o.scale.setScalar(0.85); o.rotation.y = giro; topo.add(o); });
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
  // gigantes (cabine de ~3 m): o controle é pequenininho, do tamanho da mão de uma criança, no canto da frente à direita,
  // e uma menininha fica de pé ao lado, para dar a escala (dono, 20/Nov/2026)
  let menina = null;
  if (tema === 'gigantes') { painel.scale.setScalar(0.4); painel.position.set(L - 1.7, -0.55, P + C + 0.2); menina = porMenina(raiz, 5.3, -2.3, P + 1.2, L / 2, P / 2); }

  /* garra: trilhos, ponte, carrinho, cabo enrolado, cubo e 3 dedos */
  const trilhoY = A - 0.25;
  caixa(matMetal, 0.02, trilhoY - 0.05, 0.1, 0.12, trilhoY + 0.05, P - 0.1);
  caixa(matMetal, L - 0.12, trilhoY - 0.05, 0.1, L - 0.02, trilhoY + 0.05, P - 0.1);
  const ponte = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, L - 0.2, 12), matMetal); ponte.rotation.z = Math.PI / 2; raiz.add(ponte);
  const carrinho = new THREE.Group(); raiz.add(carrinho);
  const cx = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.4, 0.5), matBranco); cx.castShadow = true; carrinho.add(cx);
  const adesivo = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.3), new THREE.MeshBasicMaterial({ map: textura(128, 128, (g) => { g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 128); const gr = g.createLinearGradient(30, 20, 98, 110); ARCO_IRIS.forEach((c, i) => gr.addColorStop(i / (ARCO_IRIS.length - 1), c)); texto(g, 'H', 64, 70, '800 96px Fredoka, system-ui, sans-serif', gr); }) }));
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
  const nDedos = tema === 'gigantes' ? 2 : 3;   // a garra grande das cabines de pelúcia gigante tem dois braços
  garra.scale.setScalar(M.PERNA / 0.9);
  const dedos = Array.from({ length: nDedos }, (_, i) => i).map((i) => {
    const piv = new THREE.Group(); piv.rotation.y = nDedos === 2 ? i * Math.PI : Math.PI / 2 + i * Math.PI * 2 / 3; piv.position.y = -0.12; garra.add(piv);   // dois braços: um de cada lado
    const dobra = new THREE.Group(); dobra.position.x = 0.1; piv.add(dobra);
    const d = new THREE.Mesh(geoDedo, matMetal); d.castShadow = true; if (nDedos === 2) d.scale.set(1.9, 1.15, 1.6); dobra.add(d);   // gigantes: braços largos, em arco
    return dobra;
  });
  // mira: um anel embaixo da garra, em cima do que está no monte (o app liga só no fácil e no médio)
  const mira = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.3, 32), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false }));
  mira.rotation.x = -Math.PI / 2; mira.scale.setScalar(M.PERNA / 0.9); mira.renderOrder = 4; raiz.add(mira);

  /* luzes */
  const amb = new THREE.HemisphereLight('#ffffff', '#3a3344', 1.1); raiz.add(amb);
  const sol = new THREE.DirectionalLight(T.luz, 2.4); sol.position.set(L / 2 + 0.4, A + 6, P / 2 + 1.2); sol.target.position.set(L / 2, 0, P / 2);
  sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); sol.shadow.camera.left = -L * 0.67; sol.shadow.camera.right = L * 0.67; sol.shadow.camera.top = L * 0.67; sol.shadow.camera.bottom = -L * 0.67; sol.shadow.camera.near = 1; sol.shadow.camera.far = 20; sol.shadow.bias = -0.002;
  raiz.add(sol); raiz.add(sol.target);
  const frenteLuz = new THREE.DirectionalLight('#ffffff', 0.9); frenteLuz.position.set(L / 2, 4, P + 8); raiz.add(frenteLuz);
  if (T.neon) { const n = new THREE.PointLight(T.neon, 6, 9, 1.6); n.position.set(L / 2, 2, P + 1.5); raiz.add(n); }

  function desenharLed(t) {
    const g = ledTex.userData.g, w = 1024, h = 128;
    g.fillStyle = '#020302'; g.fillRect(0, 0, w, h);
    const msg = tx('  H-rraaa  ★  PEGUE O SEU BICHINHO  ★  ', '  H-rraaa  ★  GRAB YOUR CRITTER  ★  ', '  H-rraaa  ★  COGE TU PELUCHE  ★  '), larg = msg.length * 46, desl = (t * 140) % larg;
    g.font = '800 92px Fredoka, system-ui, sans-serif'; g.textBaseline = 'middle';
    for (let k = -1; k < 3; k++) { const cores = ['#39ff6a', '#ff4fd8', '#7ef9ff', '#ffd400']; g.fillStyle = cores[(k + 4) % 4]; g.fillText(msg, k * larg - desl, h / 2 + 4); }
    g.fillStyle = 'rgba(0,0,0,.55)'; for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 3, h); for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 3);   // pontinhos de LED
    ledTex.needsUpdate = true;
  }

  return {
    raiz, mira, menina,
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
      lampadas.forEach((b, i) => { const c = b.material.emissive; c.setHSL(((t * 0.25 + Math.floor(i / 11) * 0.5 + (i % 11) * 0.04) % 1), 1, 0.55); b.material.color.copy(c); });
      if (extra.mira) { mira.visible = true; mira.position.set(gr.x, extra.mira + 0.03, gr.z); mira.material.opacity = 0.35 + Math.sin(t * 5) * 0.2; } else mira.visible = false;
    }
  };
}

/* ---------- a máquina da Tesoura (tesoura.js): cabine alta e escura, janela com neon verde de cantos redondos, um boneco
   grande pendurado por um fio, a tesoura num trilho, alçapão que abre embaixo e um botão redondo grande (como na foto do
   dono, 19/Nov/2026, com desenho próprio: parede de azulejo com corações e o nosso letreiro) ----------
   As medidas (MEDIDAS_TESOURA) servem para a câmera do app; o meio da cabine é x = L/2 e o fio fica em z = P/2. */
export const MEDIDAS_TESOURA = { L: 4.4, P: 3, A: 7.4, BX: 4.4, BZ: 3 };
export function montarTesoura(cena) {
  const { L, P, A } = MEDIDAS_TESOURA, CX = L / 2, Z = P / 2, PISO = 1.75, YS = 6.0;
  const raiz = new THREE.Group(); cena.add(raiz);
  const preto = new THREE.MeshStandardMaterial({ color: '#0d0d10', roughness: 0.5, metalness: 0.2 });
  const metal = new THREE.MeshStandardMaterial({ color: '#d9dde4', roughness: 0.22, metalness: 0.9 });
  const verde = new THREE.MeshStandardMaterial({ color: '#39ff6a', emissive: '#39ff6a', emissiveIntensity: 2.2, roughness: 0.3 });
  const vidro = new THREE.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.1, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide });
  const caixa = (mat, x0, y0, z0, x1, y1, z1) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); raiz.add(m); return m; };
  // sala atrás
  const sala = textura(1024, 512, (g, w, h) => tijolos(g, w, h, '#1b1f1e', '#0a0c0b', '#2c3230')); sala.wrapS = sala.wrapT = THREE.RepeatWrapping; sala.repeat.set(4, 2);
  const fundoSala = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshStandardMaterial({ map: sala, roughness: 0.9 })); fundoSala.position.set(CX, 4, -6); raiz.add(fundoSala);
  const chaoSala = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.95 })); chaoSala.rotation.x = -Math.PI / 2; chaoSala.position.set(CX, -3.3, 10); raiz.add(chaoSala);
  // parede do fundo: azulejo branco com corações, arabesco e o nome
  const azulejo = textura(512, 1024, (g, w, h) => {
    g.fillStyle = '#f7f7fb'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a8496'; g.lineWidth = 2;
    for (let x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    [[0.15, 0.12, 30], [0.8, 0.1, 26], [0.88, 0.2, 18], [0.1, 0.26, 18]].forEach(([x, y, s]) => coracaoNeon(g, w * x, h * y, s, '#a89ccf'));
    g.strokeStyle = '#6b6080'; g.lineWidth = 5; g.beginPath(); g.arc(w / 2, h * 0.62, w * 0.42, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(w / 2, h * 0.5, w * 0.33, 0, 7); g.fill(); g.strokeStyle = '#3aa0ff'; g.lineWidth = 10; g.stroke();
    nomeColorido(g, w / 2, h * 0.5, '800 96px Fredoka, system-ui, sans-serif', '#5b3fa8', null, w * 0.6);
  });
  const parede = new THREE.Mesh(new THREE.PlaneGeometry(L, A - PISO), new THREE.MeshStandardMaterial({ map: azulejo, roughness: 0.6 })); parede.position.set(CX, (A + PISO) / 2, 0); raiz.add(parede);
  // corpo: laterais, teto, base, piso (alçapão em duas tampas que abrem para baixo)
  caixa(preto, -0.4, -3.3, -0.3, 0, A + 1.6, P + 0.3); caixa(preto, L, -3.3, -0.3, L + 0.4, A + 1.6, P + 0.3);
  caixa(preto, -0.4, A, -0.3, L + 0.4, A + 1.6, P + 0.3); caixa(preto, -0.4, -3.3, -0.3, L + 0.4, PISO - 0.2, P + 0.3);
  const matPiso = new THREE.MeshStandardMaterial({ color: '#2a2a33', roughness: 0.7 });
  const tampas = [-1, 1].map((s) => {
    const piv = new THREE.Group(); piv.position.set(s < 0 ? 0 : L, PISO, Z); raiz.add(piv);
    const tp = new THREE.Mesh(new THREE.BoxGeometry(L / 2, 0.08, P), matPiso); tp.position.set(-s * L / 4, 0, 0); tp.receiveShadow = true; piv.add(tp);
    return { piv, s };
  });
  // vidro da frente e a janela com neon verde de cantos redondos
  const vid = new THREE.Mesh(new THREE.PlaneGeometry(L, A - PISO), vidro); vid.position.set(CX, (A + PISO) / 2, P + 0.31); raiz.add(vid);
  const forma = new THREE.Shape(), rx = L / 2 - 0.15, ry = (A - PISO) / 2 - 0.1, cy = (A + PISO) / 2, rr = 1.2;
  forma.moveTo(-rx + rr, -ry); forma.lineTo(rx - rr, -ry); forma.quadraticCurveTo(rx, -ry, rx, -ry + rr); forma.lineTo(rx, ry - rr); forma.quadraticCurveTo(rx, ry, rx - rr, ry);
  forma.lineTo(-rx + rr, ry); forma.quadraticCurveTo(-rx, ry, -rx, ry - rr); forma.lineTo(-rx, -ry + rr); forma.quadraticCurveTo(-rx, -ry, -rx + rr, -ry);
  const pts = forma.getSpacedPoints(160).map((p) => new THREE.Vector3(p.x, p.y, 0));
  const tubo = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 200, 0.07, 8, true), verde); tubo.position.set(CX, cy, P + 0.34); raiz.add(tubo);
  const moldura = textura(512, 1024, (g, w, h) => {   // frente preta com cantoneiras de neon verde
    g.fillStyle = '#0d0d10'; g.fillRect(0, 0, w, h); g.save(); brilho(g, '#39ff6a', 18); g.strokeStyle = '#39ff6a'; g.lineWidth = 10;
    for (const [x, y, sx, sy] of [[30, 30, 1, 1], [w - 30, 30, -1, 1], [30, h - 30, 1, -1], [w - 30, h - 30, -1, -1]]) { g.beginPath(); g.moveTo(x, y + sy * 110); g.lineTo(x, y); g.lineTo(x + sx * 110, y); g.moveTo(x + sx * 30, y + sy * 60); g.lineTo(x + sx * 60, y + sy * 30); g.stroke(); }
    g.restore();
  });
  const frente = new THREE.Mesh(new THREE.PlaneGeometry(L + 0.8, PISO - 0.2 + 3.3), new THREE.MeshStandardMaterial({ map: moldura, roughness: 0.5 })); frente.position.set(CX, (PISO - 0.2 - 3.3) / 2, P + 0.31); raiz.add(frente);
  const placa = new THREE.Mesh(new THREE.PlaneGeometry(L + 0.8, 1.5), new THREE.MeshStandardMaterial({ map: textura(1024, 340, (g, w, h) => { g.fillStyle = '#0d0d10'; g.fillRect(0, 0, w, h); nomeColorido(g, w / 2, h / 2, '800 150px Fredoka, system-ui, sans-serif', '#c6ffd4', '#39ff6a', w * 0.8); }), emissive: '#ffffff', emissiveIntensity: 0.15 }));
  placa.position.set(CX, A + 0.8, P + 0.31); raiz.add(placa);
  // botão redondo grande (aceso), entrada de ficha e visor, na frente de baixo
  const botao = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.18, 32), new THREE.MeshStandardMaterial({ color: '#ff3b5c', emissive: '#ff3b5c', emissiveIntensity: 1.6, roughness: 0.25 }));
  botao.rotation.x = Math.PI / 2; botao.position.set(L - 0.9, 0.55, P + 0.4); raiz.add(botao);
  const aroB = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.06, 10, 32), new THREE.MeshStandardMaterial({ color: '#3a7bd5', emissive: '#3a7bd5', emissiveIntensity: 1.5 })); aroB.position.set(L - 0.9, 0.55, P + 0.36); raiz.add(aroB);
  caixa(new THREE.MeshStandardMaterial({ color: '#f0a020', roughness: 0.4, metalness: 0.5 }), L - 1.15, -0.6, P + 0.3, L - 0.65, -0.05, P + 0.36);
  const visorTex = textura(512, 128, () => {});
  const visor = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.38), new THREE.MeshBasicMaterial({ map: visorTex })); visor.position.set(0.95, 0.55, P + 0.33); raiz.add(visor);
  // portinha do prêmio, embaixo
  const porta = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.2), new THREE.MeshStandardMaterial({ map: textura(512, 280, (g, w, h) => { g.fillStyle = '#050505'; g.fillRect(0, 0, w, h); g.strokeStyle = '#39ff6a'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); texto(g, tx('PRÊMIO', 'PRIZE', 'PREMIO'), w / 2, h / 2, '800 80px Fredoka, system-ui, sans-serif', '#39ff6a', '#39ff6a'); }), roughness: 0.5 }));
  porta.position.set(CX, -1.9, P + 0.32); raiz.add(porta);
  // gancho no teto e o fio (o pedaço de cima fica; o de baixo vai com o boneco)
  caixa(metal, CX - 0.6, A - 0.12, Z - 0.06, CX + 0.6, A - 0.04, Z + 0.06);
  const matFio = new THREE.MeshStandardMaterial({ color: '#f4efe6', roughness: 0.8 });
  const fioCima = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 8), matFio), fioBaixo = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 8), matFio);
  raiz.add(fioCima); raiz.add(fioBaixo);
  // trilho e tesoura: duas lâminas que se cruzam no pino, cabos coloridos à esquerda; a origem é o ponto de corte
  caixa(metal, 0.15, YS + 0.78, Z - 0.65, L - 0.15, YS + 0.9, Z - 0.5);
  const tesoura = new THREE.Group(); tesoura.scale.setScalar(1.6); raiz.add(tesoura);
  const carro = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.2), new THREE.MeshStandardMaterial({ color: '#3a3f4a', roughness: 0.5, metalness: 0.6 })); carro.position.set(-0.45, 0.42, -0.37); tesoura.add(carro);
  const haste = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.05), metal); haste.position.set(-0.45, 0.2, -0.2); tesoura.add(haste);
  const laminas = [1, -1].map((s) => {
    const piv = new THREE.Group(); piv.position.set(-0.3, 0, 0.03 * s); tesoura.add(piv);
    const lam = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.07, 0.025), metal); lam.position.set(0.36, 0, 0); lam.castShadow = true; piv.add(lam);
    const ponta = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 8), metal); ponta.rotation.z = -Math.PI / 2; ponta.position.set(0.8, 0, 0); piv.add(ponta);
    const cabo = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 8, 18), new THREE.MeshStandardMaterial({ color: s > 0 ? '#e63946' : '#3a7bd5', roughness: 0.4 })); cabo.position.set(-0.22, 0.04 * s, 0); piv.add(cabo);
    return { piv, s };
  });
  const pino = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 10), metal); pino.rotation.x = Math.PI / 2; pino.position.set(-0.3, 0, 0); tesoura.add(pino);
  // luzes
  raiz.add(new THREE.HemisphereLight('#ffffff', '#3a3344', 1.15));
  const sol = new THREE.DirectionalLight('#ffffff', 2.2); sol.position.set(CX + 0.5, A + 5, Z + 3); sol.target.position.set(CX, 2, Z); sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024);
  sol.shadow.camera.left = -4; sol.shadow.camera.right = 4; sol.shadow.camera.top = 6; sol.shadow.camera.bottom = -4; raiz.add(sol); raiz.add(sol.target);
  const luzVerde = new THREE.PointLight('#39ff6a', 4, 8, 1.6); luzVerde.position.set(CX, cy, P + 1.5); raiz.add(luzVerde);
  const fl = new THREE.DirectionalLight('#ffffff', 0.8); fl.position.set(CX, 4, P + 8); raiz.add(fl);

  let boneco = null, bonecoDe = null;
  const menina = porMenina(raiz, 5.4, -1.3, P + 0.9, CX, Z);   // a escala: uma criança ao lado da cabine (dono, 20/Nov/2026)
  function fio(m, x, y0, y1, grosso) { const l = Math.max(0.01, y0 - y1); m.position.set(x, (y0 + y1) / 2, Z); m.scale.set(grosso, l, grosso); m.visible = l > 0.02; }
  return {
    raiz, menina, alvo: new THREE.Vector3(CX, 3.4, Z),
    visor(fichas, tempo, ganhos) {
      const g = visorTex.userData.g; g.fillStyle = '#0a1a3a'; g.fillRect(0, 0, 512, 128);
      g.font = '700 54px Fredoka, system-ui, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left';
      g.fillStyle = '#7ef9ff'; g.fillText('🪙' + fichas, 20, 66); g.fillStyle = '#ffd166'; g.fillText('🧸' + ganhos, 190, 66);
      if (tempo != null) { g.fillStyle = tempo <= 5 ? '#ff4f6d' : '#39ff6a'; g.fillText('⏱️' + tempo, 350, 66); }
      visorTex.needsUpdate = true;
    },
    atualizar(seg, t, extra) {
      const p = t.premio, fx = CX + t.fioX();
      // o boneco da vez (um novo aparece pendurado quando o anterior cai)
      if (bonecoDe !== p) { if (boneco) raiz.remove(boneco); boneco = criarPremio(p.tipo); boneco.scale.setScalar(1.35); raiz.add(boneco); bonecoDe = p; }
      const solto = p.fiapos === 0, topo = p.y + 1.3;
      boneco.position.set(fx, p.y, Z); boneco.rotation.z = solto ? boneco.rotation.z : (t.fioX() - p.base) * -0.8;
      boneco.visible = p.y > -2.4 && !p.ganho;
      const grosso = 0.016 + 0.01 * Math.max(1, p.fiapos);   // o fio afina a cada "quase"
      if (solto) { fio(fioCima, fx, A - 0.1, YS, grosso); fio(fioBaixo, fx, YS - 0.05 - (p.ganho ? 99 : (t.alto - p.y)), topo, grosso); }
      else { fio(fioCima, fx, A - 0.1, YS + 0.02, grosso); fio(fioBaixo, fx, YS + 0.02, topo, grosso); }
      // tesoura: anda pelo trilho; aberta, e fecha no corte
      tesoura.position.set(CX + t.x, YS, Z + 0.06);
      const ang = t.fase === 'cortar' ? 0.38 * Math.max(0, 1 - t._f / 0.18) : t.fase === 'andar' ? 0.3 + Math.sin(seg * 14) * 0.08 : 0.38;
      laminas.forEach((l) => { l.piv.rotation.z = l.s * ang; });
      // alçapão
      tampas.forEach((tp) => { tp.piv.rotation.z = tp.s * t.porta * 1.4; });
      botao.position.z = P + (extra.apertado ? 0.34 : 0.4);
      botao.material.emissiveIntensity = t.fase === 'mirar' ? 1.6 + Math.sin(seg * 6) * 0.8 : extra.apertado ? 2.6 : 0.5;
    }
  };
}
