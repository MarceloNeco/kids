/* H-rraaa (pasta a-garra) — telas, controles, câmera 3D, fichas, coleção e fim da partida.
   A máquina por dentro é a maquina.js (window.Maquina); os prêmios, a premios3d.js; as máquinas, a cenario3d.js; os efeitos,
   a som.js (window.Som). Aqui só junta tudo. Com ?teste aparece window.GarraDebug (usado pelos testes no navegador);
   ?semente=N repete a mesma máquina. Versão: APP_VERSION aqui = VERSAO no sw.js = primeira entrada do versoes.json. */
import * as THREE from './libs/three.module.js';
import { MAQUINAS, NOMES, criarPremio, animar } from './premios3d.js';
import { montarMaquina } from './cenario3d.js';

const APP_VERSION = '0.4.1', APP_DATA = ['14/Nov/2026', 'Nov/14/2026', '14/nov/2026'];
const $ = (id) => document.getElementById(id);
const BUSCA = location.search;
const TESTE = /[?&]teste\b/.test(BUSCA);
const SEMENTE_URL = (BUSCA.match(/[?&]semente=(\d+)/) || [])[1];
const calmo = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const Maquina = window.Maquina, Som = window.Som, MED = Maquina.medidas;
const IDS = Object.keys(MAQUINAS), NIVEIS = ['facil', 'medio', 'dificil'];
// trilha: músicas alegres de instrumentos de verdade que já moram na Bagunçolândia e na Purpurina (créditos em CREDITOS.md)
const KM = 'Kevin MacLeod', CC = 'CC BY 4.0', PD = 'domínio público (CC0)';
const MUSICAS = [
  { a: '../baguncolandia/musicas/my-giant-bunny-friend.mp3', t: 'My Giant Bunny Friend', au: 'Bryan Teoh', lic: PD },
  { a: '../baguncolandia/musicas/spring-chicken.mp3', t: 'Spring Chicken', au: 'Bryan Teoh', lic: PD },
  { a: '../baguncolandia/musicas/funshine.mp3', t: 'Funshine', au: KM, lic: PD },
  { a: '../baguncolandia/musicas/city-sunshine.mp3', t: 'City Sunshine', au: KM, lic: PD },
  { a: '../baguncolandia/musicas/silly-boy.mp3', t: 'Silly Boy', au: 'Rafael Krux', lic: PD },
  { a: '../baguncolandia/musicas/llama-in-pajama.mp3', t: 'Llama in Pajama', au: 'Rafael Krux', lic: PD },
  { a: '../baguncolandia/musicas/ukulele-song.mp3', t: 'Ukulele Song', au: 'Rafael Krux', lic: PD },
  { a: '../purpurina/musicas/boogie-party.mp3', t: 'Boogie Party', au: KM, lic: CC },
  { a: '../purpurina/musicas/got-funk.mp3', t: 'Got Funk', au: KM, lic: CC },
  { a: '../purpurina/musicas/c-funk.mp3', t: 'C-Funk', au: KM, lic: CC },
  { a: '../purpurina/musicas/club-seamus.mp3', t: 'Club Seamus', au: KM, lic: CC },
  { a: '../purpurina/musicas/funky-one.mp3', t: 'Funky One', au: KM, lic: CC }
];

/* ---------- preferências, coleção, recordes e o contador da máquina (no aparelho) ---------- */
const CH_PREF = 'bolinho:a-garra:pref', CH_COL = 'bolinho:a-garra:colecao', CH_REC = 'bolinho:a-garra:recordes', CH_CONTA = 'bolinho:a-garra:contador';
const lerJSON = (k, pad) => { try { const v = JSON.parse(localStorage.getItem(k)); return v && typeof v === 'object' ? v : pad; } catch (e) { return pad; } };
const gravarJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem espaço: segue sem guardar */ } };
const pref = Object.assign({ maquina: 'telefone', nivel: 'facil', efeitos: true }, lerJSON(CH_PREF, {}));
delete pref.lingua;   // o idioma agora vem só da estante (../idioma.js), não fica mais nas preferências do jogo
if (!MAQUINAS[pref.maquina]) pref.maquina = 'telefone';
if (!NIVEIS.includes(pref.nivel)) pref.nivel = 'facil';
const salvarPref = () => gravarJSON(CH_PREF, pref);
// colecao[tipo] = quantos; contador[maquina-nivel] = tentativas desde o último prêmio (a máquina "lembra", como a de verdade)
const colecao = lerJSON(CH_COL, {}), recordes = lerJSON(CH_REC, {}), contador = lerJSON(CH_CONTA, {});

// idioma: o escolhido na estante (../idioma.js): 'pt', 'en' ou 'es'
const lingua = () => (window.BolinhoIdioma ? window.BolinhoIdioma.atual() : 'pt');
const IDX = { pt: 0, en: 1, es: 2 };
const t = (pt, en, es) => { const l = lingua(); return l === 'en' ? en : l === 'es' && es != null ? es : pt; };
const nome = (tipo) => { const n = NOMES[tipo] || [tipo, tipo, tipo]; return t(n[0], n[1], n[2]); };
const LOGO = 'H-rraaa';   // o nome do jogo (dono, 14/Nov/2026), igual nos três idiomas; o H vai colorido
const todosDe = (id) => MAQUINAS[id].tipos.concat([MAQUINAS[id].raro]);
function traduzir() {
  const l = lingua(), i = IDX[l];
  document.documentElement.lang = l === 'en' ? 'en' : l === 'es' ? 'es' : 'pt-BR';
  document.querySelectorAll('[data-t]').forEach((el) => { const p = el.getAttribute('data-t').split('|'); el.textContent = p[i] != null ? p[i] : p[0]; });
  document.querySelectorAll('[data-rotulo]').forEach((el) => { const p = el.getAttribute('data-rotulo').split('|'); el.setAttribute('aria-label', p[i] != null ? p[i] : p[0]); });
  // o nome na tela (uma letra por pedacinho: o H com as cores do arco-íris, o traço em amarelo)
  const logo = $('logo'); logo.setAttribute('aria-label', LOGO); logo.textContent = '';
  [...LOGO].forEach((c, k) => { const s = document.createElement('span'); if (c === '-') s.className = 'sep'; else if (!k) s.className = 'h'; s.textContent = c; logo.appendChild(s); });
  document.title = LOGO + ' — Bolinho de Chuva · SolverONE';
  $('versao').textContent = t('Versão ', 'Version ', 'Versión ') + APP_VERSION + ' · ' + APP_DATA[i];
  pintarMenu();
  if (telaAtual === 'colecao') pintarColecao();
}

let telaAtual = 'menu';
function mostrar(id) {
  document.querySelectorAll('.tela').forEach((s) => s.classList.toggle('ativa', s.id === id));
  telaAtual = id;
  document.body.classList.toggle('jogando', id === 'jogo');
}

/* ---------- menu ---------- */
function marcar(grupo, attr, valor) { document.querySelectorAll('#' + grupo + ' [' + attr + ']').forEach((b) => b.setAttribute('aria-checked', String(b.getAttribute(attr) === valor))); }
const quantos = (id) => todosDe(id).filter((k) => colecao[k] > 0).length;
function pintarMenu() {
  marcar('maquinas', 'data-maquina', pref.maquina); marcar('niveis', 'data-nivel', pref.nivel);
  IDS.forEach((id) => { const n = quantos(id); document.querySelector('[data-col="' + id + '"]').textContent = n ? '🧸 ' + n + '/' + todosDe(id).length : ''; });
  const total = IDS.reduce((s, id) => s + quantos(id), 0), max = IDS.reduce((s, id) => s + todosDe(id).length, 0);
  $('colecaoConta').textContent = total ? total + '/' + max : '';
}
document.querySelectorAll('#maquinas [data-maquina]').forEach((b) => b.addEventListener('click', () => { pref.maquina = b.getAttribute('data-maquina'); salvarPref(); pintarMenu(); Som.toque(); }));
document.querySelectorAll('#niveis [data-nivel]').forEach((b) => b.addEventListener('click', () => { pref.nivel = b.getAttribute('data-nivel'); salvarPref(); pintarMenu(); Som.toque(); }));
if (window.BolinhoIdioma) window.BolinhoIdioma.aoMudar(() => traduzir());   // trocaram o idioma na estante (outra aba)
function pintarEfeitos() { $('btEfeitos').textContent = pref.efeitos ? '🔊' : '🔈'; $('btEfeitos').setAttribute('aria-pressed', String(!!pref.efeitos)); Som.ligar(pref.efeitos); }
$('btEfeitos').addEventListener('click', () => { pref.efeitos = !pref.efeitos; salvarPref(); pintarEfeitos(); Som.toque(); });
$('btAjuda').addEventListener('click', () => { const a = $('ajuda'); a.hidden = !a.hidden; $('btAjuda').setAttribute('aria-expanded', String(!a.hidden)); });
function telaCheia() {   // tela cheia no celular e no tablet (no botão de começar, como os outros jogos)
  try {
    const el = document.documentElement, pedir = el.requestFullscreen || el.webkitRequestFullscreen;
    if (pedir && matchMedia('(pointer: coarse)').matches && !document.fullscreenElement) { const p = pedir.call(el); if (p && p.catch) p.catch(() => {}); }
  } catch (e) { /* sem tela cheia */ }
}
$('btJogar').addEventListener('click', () => { Som.acordar(); telaCheia(); entrar('jogo'); novaPartida(); });
$('btColecao').addEventListener('click', () => { Som.toque(); entrar('colecao'); colecaoAba = pref.maquina; pintarColecao(); });
$('btColecaoJogar').addEventListener('click', () => { Som.acordar(); mostrar('jogo'); novaPartida(); });

/* ---------- telas de dentro e Voltar do celular ---------- */
let empurrado = false;
function entrar(id) { mostrar(id); if (!empurrado) { try { history.pushState({ garra: 1 }, ''); empurrado = true; } catch (e) { /* sem histórico */ } } }
function irMenu() { fecharFim(); parar(); m = null; mostrar('menu'); pintarMenu(); }
window.addEventListener('popstate', () => { empurrado = false; if (telaAtual !== 'menu') irMenu(); });
function voltarMenu() { if (empurrado) history.back(); else irMenu(); }
// navegação padrão (../navegacao.js): 🏠 Início = voltar ao menu (o mesmo do Voltar do celular), 🚪 Saída
if (window.BolinhoNav) window.BolinhoNav.iniciar({ jogo: 'a-garra', noInicio: () => telaAtual === 'menu', irParaInicio: voltarMenu,
  emAndamento: () => telaAtual === 'jogo' && !!m && m.fase !== 'fim' && m.fichas < m.cfg.fichas });

/* ---------- 3D: renderizador, cena, câmera ---------- */
const cv = $('tela');
let render = null;
try { render = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); } catch (e) { render = null; }
if (render) {
  render.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  render.shadowMap.enabled = true; render.shadowMap.type = THREE.PCFSoftShadowMap;
  render.toneMapping = THREE.ACESFilmicToneMapping; render.toneMappingExposure = 1.05;
}
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
const VISTAS = [{ yaw: 0, pitch: 0.42 }, { yaw: 0, pitch: 1.2 }, { yaw: 1.5, pitch: 0.28 }];   // frente (um pouco de cima), de cima, bem de lado
const GIRO = 1.65;   // até onde a câmera gira para cada lado (um pouco mais que de lado, para ver a profundidade da garra)
let cam = { yaw: 0, pitch: 0.42, zoom: 1, vista: 0 }, camAlvo = new THREE.Vector3(MED.L / 2, 2.2, MED.P / 2);
let cena = null, maq = null, objetos = [], m = null, raycaster = new THREE.Raycaster();
let proximoDesenho = 0, desenhouAntes = false;   // aparelho lento: espera antes de desenhar de novo (ver no fim de quadro())
let porta = null, avisoT = 0, ultimoQuadro = 0, fichasIni = 0, fimT = null, velocidade = 1, apertando = { dx: 0, dz: 0 }, botaoApertado = 0;
const chaveConta = () => pref.maquina + '-' + pref.nivel;

function limparCena() {
  if (!cena) return;
  cena.traverse((o) => {
    if (o.isMesh) {
      if (o.geometry && !o.geometry.userData.compartilhado) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((mt) => { if (mt && !mt.userData.compartilhado) { if (mt.map) mt.map.dispose(); mt.dispose(); } });
    }
  });
  cena = null; maq = null; objetos = [];
}
function novaPartida() {
  fecharFim();
  if (!render) { mostrar('semTresD'); $('semTresD').hidden = false; return; }
  limparCena();
  const def = MAQUINAS[pref.maquina];
  m = Maquina.nova({ nivel: pref.nivel, tipos: def.tipos, raro: def.raro, vivos: !!def.vivos, andam: !!def.andam, qtdFator: def.andam ? 0.32 : 1, raioFator: def.andam ? 1.12 : 1,
    semente: SEMENTE_URL ? +SEMENTE_URL : undefined, semGanhar: contador[chaveConta()] || 0 });
  cena = new THREE.Scene(); cena.background = new THREE.Color('#0b0a14'); cena.fog = new THREE.Fog('#0b0a14', 22, 45);
  maq = montarMaquina(cena, pref.maquina, MED);
  objetos = m.premios.map((p) => { const o = criarPremio(p.tipo); o.userData.id = p.id; cena.add(o); return o; });
  fichasIni = m.fichas; porta = null; fimT = null;
  $('infoTempo').hidden = !m.cfg.tempo;
  medir(); cam = Object.assign({}, VISTAS[0], { zoom: camera.aspect > 1.2 ? 0.8 : 1, vista: 0 });   // deitado: um pouco mais perto
  pintarBarra();
  aviso(t('Leve a garra e aperte PEGAR!', 'Move the claw and press GRAB!', '¡Mueve la garra y pulsa COGER!'), 2.4);
}
function parar() { Som.motor(false); if (m) { m.mover(0, 0); m.irPara(null); } apertando = { dx: 0, dz: 0 }; }
function pintarBarra() {
  if (!m) return;
  $('fichas').textContent = m.fichas; $('ganhos').textContent = m.ganhos.length;
  const s = Math.ceil(m.tempo); $('tempo').textContent = s;
  $('infoTempo').classList.toggle('pouco', !!m.cfg.tempo && m.fase === 'mirar' && s <= 5);
  $('btPegar').disabled = m.fase !== 'mirar';
}
function aviso(txt, seg) { $('aviso').textContent = txt; $('aviso').classList.add('ver'); avisoT = seg || 1.6; }

function medir() {
  const r = $('palco').getBoundingClientRect(), W = Math.max(1, r.width), H = Math.max(1, r.height);
  if (render) render.setSize(W, H, false);
  camera.aspect = W / H; camera.updateProjectionMatrix();
}
function posicionarCamera() {
  // distância para a máquina inteira caber (largura ou altura), vezes o zoom; com zoom, a câmera chega perto da garra
  const meiaV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), meiaH = meiaV * camera.aspect;
  const dist = Math.max(4.4 / meiaH, 5.6 / meiaV) * cam.zoom;
  const segue = m ? Math.max(0, Math.min(1, (1 - cam.zoom) / 0.5)) * 0.85 : 0;
  const alvo = new THREE.Vector3(MED.L / 2, 2.4, MED.P / 2);
  if (m && segue) alvo.lerp(new THREE.Vector3(m.garra.x, Math.max(1.2, m.garra.y - 1.5), m.garra.z), segue);
  camAlvo.lerp(alvo, 0.12);
  const cp = Math.cos(cam.pitch);
  camera.position.set(camAlvo.x + Math.sin(cam.yaw) * cp * dist, camAlvo.y + Math.sin(cam.pitch) * dist, camAlvo.z + Math.cos(cam.yaw) * cp * dist);
  camera.lookAt(camAlvo);
}
$('btCamera').addEventListener('click', () => { cam.vista = (cam.vista + 1) % VISTAS.length; Object.assign(cam, VISTAS[cam.vista]); Som.toque();
  aviso([t('🎥 De frente', '🎥 Front', '🎥 De frente'), t('🎥 De cima', '🎥 Top', '🎥 Desde arriba'), t('🎥 De lado: veja a profundidade da garra', '🎥 Side: check the claw depth', '🎥 De lado: mira la profundidad de la garra')][cam.vista], 1.6); });
const zoomEm = (k) => { cam.zoom = Math.max(0.42, Math.min(1.35, cam.zoom * k)); };
$('btMais').addEventListener('click', () => zoomEm(1 / 1.25));
$('btMenos').addEventListener('click', () => zoomEm(1.25));

/* ---------- controles: setas (segurar), PEGAR, dedo na máquina (tocar = mirar, arrastar = girar, pinça = zoom), teclado ---------- */
function moverPor() { if (m && m.fase === 'mirar') m.mover(apertando.dx, apertando.dz); }
document.querySelectorAll('.seta').forEach((bt) => {
  const dx = +bt.getAttribute('data-dx'), dz = +bt.getAttribute('data-dz');
  const solta = () => { if (!bt.classList.contains('apertado')) return; bt.classList.remove('apertado'); if (dx) apertando.dx = 0; if (dz) apertando.dz = 0; moverPor(); };
  bt.addEventListener('pointerdown', (e) => {
    e.preventDefault(); if (!m || m.fase !== 'mirar') return;
    try { bt.setPointerCapture(e.pointerId); } catch (x) { /* sem captura */ }
    bt.classList.add('apertado'); Som.acordar(); if (dx) apertando.dx = dx; if (dz) apertando.dz = dz; moverPor();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => bt.addEventListener(ev, solta));
  bt.addEventListener('click', (e) => { if (e.detail === 0 && m && m.fase === 'mirar') m.irPara(m.garra.x + dx * 0.4, m.garra.z + dz * 0.4); });   // teclado: um passinho
  bt.addEventListener('contextmenu', (e) => e.preventDefault());
});
function pegar() { if (m && m.pegar()) { Som.motor(false); apertando = { dx: 0, dz: 0 }; document.querySelectorAll('.seta.apertado').forEach((b) => b.classList.remove('apertado')); botaoApertado = 0.25; pintarBarra(); } }
$('btPegar').addEventListener('click', () => { Som.acordar(); pegar(); });
const dedos = new Map();
let gesto = null;
cv.addEventListener('pointerdown', (e) => {
  e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) { /* sem captura */ }
  dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (dedos.size === 1) gesto = { tipo: 'toque', x0: e.clientX, y0: e.clientY, yaw: cam.yaw, pitch: cam.pitch };
  else if (dedos.size === 2) { const [a, b] = [...dedos.values()]; gesto = { tipo: 'pinca', d0: Math.hypot(a.x - b.x, a.y - b.y), zoom: cam.zoom }; }
});
cv.addEventListener('pointermove', (e) => {
  if (!dedos.has(e.pointerId)) return;
  dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (!gesto) return;
  if (gesto.tipo === 'pinca' && dedos.size === 2) { const [a, b] = [...dedos.values()]; cam.zoom = Math.max(0.42, Math.min(1.35, gesto.zoom * gesto.d0 / Math.max(20, Math.hypot(a.x - b.x, a.y - b.y)))); return; }
  const dx = e.clientX - gesto.x0, dy = e.clientY - gesto.y0;
  if (gesto.tipo === 'toque' && Math.hypot(dx, dy) > 12) gesto.tipo = 'girar';
  if (gesto.tipo === 'girar') { cam.yaw = Math.max(-GIRO, Math.min(GIRO, gesto.yaw - dx * 0.007)); cam.pitch = Math.max(0.05, Math.min(1.35, gesto.pitch + dy * 0.005)); }
});
function soltarDedo(e) {
  if (!dedos.has(e.pointerId)) return;
  dedos.delete(e.pointerId);
  if (gesto && gesto.tipo === 'toque' && e.type === 'pointerup') mirarNoToque(e.clientX, e.clientY);
  if (!dedos.size) gesto = null; else if (gesto && gesto.tipo === 'pinca') gesto = { tipo: 'nada' };
}
cv.addEventListener('pointerup', soltarDedo); cv.addEventListener('pointercancel', soltarDedo);
cv.addEventListener('wheel', (e) => { e.preventDefault(); zoomEm(e.deltaY > 0 ? 1.1 : 1 / 1.1); }, { passive: false });
// tocar num prêmio (ou no chão) leva a garra até lá
function mirarNoToque(x, y) {
  if (!m || m.fase !== 'mirar') return;
  const r = cv.getBoundingClientRect();
  raycaster.setFromCamera(new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1), camera);
  const vivos = objetos.filter((o) => o.visible);
  const hit = raycaster.intersectObjects(vivos, true)[0];
  let ponto = null;
  if (hit) { let o = hit.object; while (o && !o.userData.premio) o = o.parent; ponto = o ? o.position : hit.point; }
  else { const p = new THREE.Vector3(); if (raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -1), p)) ponto = p; }
  if (ponto) { Som.acordar(); Som.toque(); m.irPara(ponto.x, ponto.z); }
}
const teclas = {};
const TECLAS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
window.addEventListener('keydown', (e) => {
  if (telaAtual !== 'jogo' || !m || !$('fim').hidden) return;
  const k = TECLAS[e.key];
  if (k) { e.preventDefault(); if (!teclas[e.key]) { teclas[e.key] = true; if (k[0]) apertando.dx = k[0]; if (k[1]) apertando.dz = k[1]; moverPor(); } return; }
  if (e.key === ' ' || (e.key === 'Enter' && document.activeElement === document.body)) { e.preventDefault(); pegar(); }
});
window.addEventListener('keyup', (e) => { const k = TECLAS[e.key]; if (k && teclas[e.key]) { teclas[e.key] = false; if (k[0]) apertando.dx = 0; if (k[1]) apertando.dz = 0; moverPor(); } });

/* ---------- o que a máquina contou ---------- */
function eventos() {
  while (m.eventos.length) {
    const ev = m.eventos.shift();
    if (ev.tipo === 'ficha') { Som.ficha(); setTimeout(() => Som.descer(), 120); }
    else if (ev.tipo === 'tique') Som.tique();
    else if (ev.tipo === 'pegou') { Som.fechar(); Som.pegou(); aviso(ev.premio === MAQUINAS[pref.maquina].raro ? t('⭐ Pegou o dourado!', '⭐ Got the golden one!', '⭐ ¡Has cogido el dorado!') : t('Pegou! Segura, garra!', 'Got it! Hold on, claw!', '¡Lo has cogido! ¡Aguanta, garra!'), 1.4); }
    else if (ev.tipo === 'raspou') { Som.fechar(); Som.errou(); aviso(t('Quase! Mire no meio.', 'So close! Aim at the middle.', '¡Casi! Apunta al centro.'), 1.8); }
    else if (ev.tipo === 'errou') { Som.fechar(); Som.errou(); aviso(t('Não pegou nada…', 'Nothing this time…', 'Esta vez no ha cogido nada…'), 1.6); }
    else if (ev.tipo === 'escorregou') { Som.escorregou(); aviso(t('Ih, a garra soltou!', 'Oops, the claw let go!', '¡Uy, la garra lo ha soltado!'), 1.8); }
    else if (ev.tipo === 'pulo') Som.pulo && Som.pulo();
    else if (ev.tipo === 'ganhou') ganhou(ev.premio);
    else if (ev.tipo === 'fim') { Som.motor(false); fimT = 1.2; }
  }
  contador[chaveConta()] = m.semGanhar; gravarJSON(CH_CONTA, contador);
}
function ganhou(tipo) {
  const raro = tipo === MAQUINAS[pref.maquina].raro;
  Som.ganhou(raro);
  colecao[tipo] = (colecao[tipo] || 0) + 1; gravarJSON(CH_COL, colecao);
  porta = { tipo, t: 0, obj: null };
  $('ganhouImg').src = miniatura(tipo);
  $('ganhouNome').textContent = (raro ? '⭐ ' : '🎉 ') + nome(tipo) + '!';
  const gb = $('ganhou'); gb.hidden = false; gb.style.animation = 'none'; void gb.offsetWidth; gb.style.animation = '';
  clearTimeout(ganhou.tm); ganhou.tm = setTimeout(() => { gb.hidden = true; }, 1800);
  if (window.Trilha) { window.Trilha.volume(0.35); setTimeout(() => window.Trilha.volume(null), 2200); }
}

/* ---------- miniaturas dos prêmios (fim, coleção, aviso de prêmio), feitas uma vez e guardadas ---------- */
const minis = {};
let mini = null;
function miniatura(tipo) {
  if (minis[tipo]) return minis[tipo];
  if (!mini) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    try { mini = { r: new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true, preserveDrawingBuffer: true }), cena: new THREE.Scene(), cam: new THREE.PerspectiveCamera(30, 1, 0.1, 20) }; }
    catch (e) { return ''; }
    mini.r.setSize(256, 256, false); mini.r.toneMapping = THREE.ACESFilmicToneMapping;
    mini.cena.add(new THREE.HemisphereLight('#ffffff', '#554466', 1.7));
    const d = new THREE.DirectionalLight('#ffffff', 2.2); d.position.set(2, 4, 5); mini.cena.add(d);
    mini.cam.position.set(0, 1.1, 5.2); mini.cam.lookAt(0, 0, 0);
  }
  const o = criarPremio(tipo); o.rotation.y = MAQUINAS.bichos.tipos.includes(tipo.replace(/-dourad[oa]$/, '')) || /^salsicha/.test(tipo) ? 0.6 : -0.35; if (/joaninha|abelha|besouro|lagarta|libelula|formiga|vagalume|borboleta/.test(tipo)) o.rotation.x = 0.5;
  mini.cena.add(o); mini.r.render(mini.cena, mini.cam); minis[tipo] = mini.r.domElement.toDataURL('image/png'); mini.cena.remove(o);
  return minis[tipo];
}

/* ---------- fim da partida ---------- */
const estrelasDe = (n) => (n === 0 ? 0 : n >= 3 ? 3 : n);
function abrirFim() {
  const n = m.ganhos.length, e = estrelasDe(n), chave = chaveConta();
  if (n > (recordes[chave] || 0)) { recordes[chave] = n; gravarJSON(CH_REC, recordes); }
  $('fimTitulo').textContent = m.esvaziou ? t('Você esvaziou a máquina!', 'You emptied the machine!', '¡Has vaciado la máquina!') : n ? t('Acabaram as fichas!', 'Out of tokens!', '¡Se han acabado las fichas!') : t('Quase! A garra é difícil mesmo…', 'So close! The claw is tricky…', '¡Casi! Esta garra es muy difícil…');
  $('fimEstrelas').textContent = '★★★'.slice(0, e) + '☆☆☆'.slice(0, 3 - e);
  $('fimEstrelas').setAttribute('aria-label', t(e + ' estrelas', e + ' stars', e + ' estrellas'));
  const caixa = $('fimPremios'); caixa.textContent = '';
  m.ganhos.forEach((tipo) => { const i = document.createElement('img'); i.src = miniatura(tipo); i.alt = nome(tipo); caixa.appendChild(i); });
  const usadas = fichasIni - m.fichas;
  $('fimTexto').textContent = n
    ? t('Você pegou ' + n + (n === 1 ? ' prêmio' : ' prêmios') + ' com ' + usadas + (usadas === 1 ? ' ficha.' : ' fichas.'), 'You got ' + n + (n === 1 ? ' prize' : ' prizes') + ' with ' + usadas + (usadas === 1 ? ' token.' : ' tokens.'),
      'Has conseguido ' + n + (n === 1 ? ' premio' : ' premios') + ' con ' + usadas + (usadas === 1 ? ' ficha.' : ' fichas.'))
    : t('Na máquina de verdade também é assim: a garra só vem forte de vez em quando. Tente de novo!', 'Real machines are like this too: the claw is only strong once in a while. Try again!', 'En las máquinas de verdad también pasa: la garra solo viene fuerte de vez en cuando. ¡Inténtalo otra vez!');
  $('fim').hidden = false;
  Som.fim(e);
  setTimeout(() => $('btDeNovo').focus(), 50);
}
function fecharFim() { $('fim').hidden = true; }
$('btDeNovo').addEventListener('click', () => novaPartida());
$('btFimColecao').addEventListener('click', () => { fecharFim(); parar(); m = null; colecaoAba = pref.maquina; mostrar('colecao'); pintarColecao(); });
$('btFimMenu').addEventListener('click', voltarMenu);

/* ---------- coleção: uma aba por máquina ---------- */
let colecaoAba = pref.maquina;
function pintarColecao() {
  const abas = $('abas'); abas.textContent = '';
  IDS.forEach((id) => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(id === colecaoAba)); b.setAttribute('data-aba', id);
    b.textContent = t(MAQUINAS[id].nome[0], MAQUINAS[id].nome[1], MAQUINAS[id].nome[2]) + ' ' + quantos(id) + '/' + todosDe(id).length;
    b.addEventListener('click', () => { colecaoAba = id; Som.toque(); pintarColecao(); });
    abas.appendChild(b);
  });
  const p = $('prateleira'); p.textContent = '';
  todosDe(colecaoAba).forEach((tipo) => {
    const q = colecao[tipo] || 0, d = document.createElement('div');
    d.className = 'item' + (q ? '' : ' falta');
    const img = document.createElement('img'); img.src = miniatura(tipo); img.alt = q ? nome(tipo) : '?';
    const n = document.createElement('div'); n.className = 'nome'; n.textContent = q ? nome(tipo) : '?';
    const k = document.createElement('div'); k.className = 'qtd'; k.textContent = q ? '× ' + q : '';
    d.append(img, n, k); p.appendChild(d);
  });
  const n = quantos(colecaoAba), tot = todosDe(colecaoAba).length;
  $('colecaoResumo').textContent = n === tot ? t('Coleção completa! 🎉', 'Collection complete! 🎉', '¡Colección completa! 🎉') : t('Você tem ' + n + ' de ' + tot, 'You have ' + n + ' of ' + tot, 'Tienes ' + n + ' de ' + tot);
}

/* ---------- a cada quadro ---------- */
function quadro(agora) {
  requestAnimationFrame(quadro);
  const dt = Math.min(1, ultimoQuadro ? (agora - ultimoQuadro) / 1000 : 0.016); ultimoQuadro = agora;   // até 1 s: aparelho lento não vira câmera lenta
  if (telaAtual !== 'jogo' || !m || !cena) return;
  const seg = agora / 1000;
  // aparelho lento (poucos quadros por segundo): o jogo anda em passinhos, no tempo certo, sem câmera lenta
  for (let resta = dt * (TESTE ? velocidade : 1); resta > 1e-4; resta -= 0.05) m.passo(Math.min(0.05, resta));
  eventos();
  const anda = (m.fase === 'mirar' && Math.hypot(m.garra.vx, m.garra.vz) > 0.05) || m.fase === 'levar';
  Som.motor(anda);
  if (avisoT > 0) { avisoT -= dt; if (avisoT <= 0) $('aviso').classList.remove('ver'); }
  if (fimT != null) { fimT -= dt; if (fimT <= 0) { fimT = null; abrirFim(); } }
  botaoApertado = Math.max(0, botaoApertado - dt);
  // prêmios: posição e giro da física, olhos piscando, asas batendo, vivos se mexendo
  const vivos = !!MAQUINAS[pref.maquina].vivos, escala = MAQUINAS[pref.maquina].andam ? 1.4 : 1;
  m.premios.forEach((p, i) => {
    const o = objetos[i];
    o.visible = !(p.ganho && p.y < -p.r * 1.4);
    if (!o.visible) return;
    // os bichos de verdade aparecem maiores que a bola da física (são compridos), mas a bola continua cabendo no buraco
    o.position.set(p.x, p.y + (escala > 1 ? p.r * 0.12 : 0), p.z); o.quaternion.set(p.q[0], p.q[1], p.q[2], p.q[3]); o.scale.setScalar(p.r * escala);
    if (!calmo) animar(o, seg, vivos && !p.preso, p.preso, p.passeio > 0);
  });
  // o prêmio ganho aparece na portinha da frente
  if (porta) {
    porta.t += dt;
    if (!porta.obj) { porta.obj = criarPremio(porta.tipo); cena.add(porta.obj); }
    const k = Math.min(1, porta.t / 0.4), pulo = Math.abs(Math.sin(porta.t * 6)) * Math.max(0, 1 - porta.t / 2) * 0.3;
    porta.obj.position.set(0.75, -1.15 + pulo, MED.P + 0.7); porta.obj.scale.setScalar(0.35 * k + 0.01); porta.obj.rotation.y = Math.sin(porta.t * 2) * 0.5;
    if (porta.t > 3.5) { cena.remove(porta.obj); porta = null; }
  }
  // mira (fácil e médio): o anel fica em cima do que está debaixo da garra
  let mira = null;
  if (m.fase === 'mirar' && m.nivel !== 'dificil') {
    mira = 0.01;
    m.premios.forEach((p) => { if (!p.ganho && Math.hypot(p.x - m.garra.x, p.z - m.garra.z) < p.r * 0.8) mira = Math.max(mira, p.y + p.r * 0.92); });
  }
  maq.atualizar(seg, m.garra, { dx: m.fase === 'mirar' ? apertando.dx : 0, dz: m.fase === 'mirar' ? apertando.dz : 0, podePegar: m.fase === 'mirar', apertado: botaoApertado > 0, mira });
  if (!quadro.visorT || seg - quadro.visorT > 0.25) { quadro.visorT = seg; maq.visor(m.fichas, m.cfg.tempo ? Math.ceil(m.tempo) : null, m.ganhos.length); }
  pintarBarra();
  posicionarCamera();
  // mostrar o 3D é o mais pesado. Num aparelho lento (o quadro que desenhou levou mais de 80 ms até o próximo), espera
  // o mesmo tanto antes de desenhar de novo: a física e os toques continuam no tempo certo e a página não trava (no
  // celular comum, com placa de vídeo, nada muda)
  if (desenhouAntes && dt > 0.08) proximoDesenho = agora + dt * 1000;
  desenhouAntes = false;
  if (agora >= proximoDesenho) { render.render(cena, camera); desenhouAntes = true; }
}

/* ---------- instalar, service worker e começo ---------- */
let pedidoInstalar = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); pedidoInstalar = e; $('btInstalar').hidden = false; });
$('btInstalar').addEventListener('click', () => { if (!pedidoInstalar) return; pedidoInstalar.prompt(); pedidoInstalar.userChoice.then(() => { pedidoInstalar = null; $('btInstalar').hidden = true; }); });
if ('serviceWorker' in navigator && location.protocol !== 'file:' && !TESTE) navigator.serviceWorker.register('sw.js').catch(() => { /* sem modo offline */ });
window.addEventListener('resize', () => { if (telaAtual === 'jogo') medir(); });
if (window.ResizeObserver) new ResizeObserver(() => { if (telaAtual === 'jogo') medir(); }).observe($('palco'));
document.addEventListener('visibilitychange', () => { if (document.hidden) parar(); });

function comecar() {
  if (window.SolverRecursos && !window.SolverRecursos.ligado('a-garra', true)) { mostrar('desligado'); $('desligado').hidden = false; traduzir(); return; }
  pintarEfeitos(); traduzir();
  if (window.Trilha) window.Trilha.iniciar({ jogo: 'a-garra', creditos: 'CREDITOS.md', volume: 0.45, musicas: MUSICAS });
  requestAnimationFrame(quadro);
}
comecar();

if (TESTE) window.GarraDebug = {
  pronto: true, versao: APP_VERSION,
  estado() {
    if (!m) return { tela: telaAtual };
    return { tela: telaAtual, fase: m.fase, fichas: m.fichas, tempo: m.tempo, nivel: m.nivel, maquina: pref.maquina, x: m.garra.x, z: m.garra.z, ganhos: m.ganhos.slice(),
      semGanhar: m.semGanhar, fim: !$('fim').hidden, premios: m.premios.filter((p) => !p.ganho).length };
  },
  // ponto da tela (px da página) de um ponto da máquina
  tela(x, y, z) { const v = new THREE.Vector3(x, y, z).project(camera), r = cv.getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height }; },
  maisAlto() { const l = m.premios.filter((p) => !p.ganho && !(p.x < MED.BX && p.z > MED.P - MED.BZ)).sort((a, b) => (b.y + b.r) - (a.y + a.r)); return l[0] && { x: l[0].x, y: l[0].y, z: l[0].z, r: l[0].r, tipo: l[0].tipo }; },
  forte(v) { m.cfg.sempreForte = !!v; },
  fichas(n) { m.fichas = n; },
  irPara(x, z) { m.irPara(x, z); },
  velocidade(v) { velocidade = v; },
  camera() { return Object.assign({}, cam); },
  colecao() { return Object.assign({}, colecao); }
};

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
if (/[?&]instalar\b/.test(location.search) && location.protocol !== 'file:') {
  const s = document.createElement('script');
  s.src = '../instalar.js';
  s.setAttribute('data-nome', 'H-rraaa'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
}
