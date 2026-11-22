// Alinhamento e "realismo" dos bichinhos — teste OBRIGATÓRIO (dono, 22/Nov/2026: "tem que colocar um teste obrigatório de ver
// o realismo dos bichinhos, alinhamento dos corpos, das cabeças. Não pode deixar nada desalinhado").
// Desenha CADA bichinho, em pé e de 4 patas, sem nada, com CADA roupa, com CADA parte de baixo (sozinha e com uma parte de
// cima), com CADA acessório (e a preguiça pendurada no galho) e, nos bichinhos de forma mais diferente (urso, preguiça de braço
// comprido, pinguim largo; ovelha, girafa e elefante de 4 patas), TODA parte de cima com TODA parte de baixo; e olha a imagem
// pronta, pixel a pixel:
//   1. uma peça só: cabeça, corpo, orelhas, patas, rabo, roupa e acessório ligados (nada solto ou flutuando);
//   2. apoiado no chão: o ponto mais baixo encosta no chão (nem flutua, nem afunda);
//   3. nada cortado: tudo dentro da imagem (0 a 300 de largura);
//   4. em pé: cabeça, corpo e pés no mesmo eixo; 4 patas: as patas de cada par na mesma linha do chão.
// Efeito que de propósito fica no ar (brilhinho de varinha, estrelinha) leva a classe "ma-efeito" e não conta como peça.
// Rodar da raiz do repositório kids: node --test meu-amiguinho/teste/alinhamento.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { chromium } = require('playwright');
const dir = path.join(__dirname, '..');

// roda no navegador: desenha numa caixa maior que a vista e mede as peças
function medirNoNavegador() {
  window.medirAmiguinho = async function (a, op) {
    op = op || {};
    const A = window.AmiguinhoArte, X0 = -40, Y0 = -24, W = 380, H = 396;
    let svg = A.svg(a, { id: 'z', viewBox: [X0, Y0, W, H], largura: W, altura: H, pose: op.pose });
    svg = svg.replace('<defs>', '<style>.ma-efeito{display:none}</style><defs>');
    const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await img.decode();
    const cv = window._cvA || (window._cvA = document.createElement('canvas')); cv.width = W; cv.height = H;
    const cx = cv.getContext('2d', { willReadFrequently: true }); cx.clearRect(0, 0, W, H); cx.drawImage(img, 0, 0, W, H);
    const d = cx.getImageData(0, 0, W, H).data, N = W * H, m = new Uint8Array(N);
    for (let i = 0; i < N; i++) m[i] = d[i * 4 + 3] > 60 ? 1 : 0;   // a sombra do chão (16 %) não conta
    const lab = new Int32Array(N), comp = [], pilha = []; let k = 0, baixo = -1e9, fora = 0;
    for (let i = 0; i < N; i++) if (m[i]) { const x = i % W + X0, y = ((i / W) | 0) + Y0; if (y > baixo) baixo = y; if (x < 0 || x >= 300) fora++; }
    for (let i = 0; i < N; i++) if (m[i] && !lab[i]) {
      k++; let area = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; pilha.push(i); lab[i] = k;
      while (pilha.length) {
        const j = pilha.pop(); area++; const x = j % W, y = (j / W) | 0;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        if (x > 0 && m[j - 1] && !lab[j - 1]) { lab[j - 1] = k; pilha.push(j - 1); }
        if (x < W - 1 && m[j + 1] && !lab[j + 1]) { lab[j + 1] = k; pilha.push(j + 1); }
        if (y > 0 && m[j - W] && !lab[j - W]) { lab[j - W] = k; pilha.push(j - W); }
        if (y < H - 1 && m[j + W] && !lab[j + W]) { lab[j + W] = k; pilha.push(j + W); }
      }
      comp.push({ area, caixa: [x0 + X0, y0 + Y0, x1 + X0, y1 + Y0] });
    }
    comp.sort((p, q) => q.area - p.area);
    return { soltos: comp.slice(1).filter((c) => c.area >= 10).map((c) => c.caixa), baixo, fora };
  };
}

test('alinhamento: todo bichinho × corpo × roupa × parte de baixo × acessório é uma peça só, apoiada no chão, inteira na imagem e no eixo', { timeout: 900000 }, async () => {
  const b = await chromium.launch();
  try {
    const pg = await b.newPage();
    await pg.setContent('<html><body></body></html>');
    for (const f of ['dados.js', 'arte.js', 'regras.js']) await pg.addScriptTag({ path: path.join(dir, f) });
    await pg.addScriptTag({ content: '(' + medirNoNavegador.toString() + ')()' });
    const r = await pg.evaluate(async () => {
      const D = window.AmiguinhoDados, A = window.AmiguinhoArte, R = window.AmiguinhoRegras, ruins = [];
      const cimas = D.ROUPAS.filter((x) => x.grupo === 'cima').map((x) => x.id), baixos = D.BAIXOS.map((x) => x.id);
      const TODAS = { 'urso/pe': 1, 'preguica/pe': 1, 'pinguim/pe': 1, 'ovelha/q': 1, 'girafa/q': 1, 'elefante/q': 1 };
      let n = 0;
      for (const b of D.BASES) for (const corpo of b.corpos) {
        const casos = [[null, null, null]]
          .concat(D.ROUPAS.filter((x) => x.id !== 'nenhuma').map((x) => [x.id, null, null]))
          .concat(D.ACESS.map((x) => [null, x.id, null]));
        if (b.id === 'preguica' && corpo === 'pe') casos.push([null, null, 'pendurada']);
        baixos.forEach((bx, i) => { casos.push([null, null, null, bx]); casos.push([cimas[i % cimas.length], null, null, bx]); });
        if (TODAS[b.id + '/' + corpo]) for (const ro of cimas) for (const bx of baixos) casos.push([ro, null, null, bx]);
        for (const [ro, ac, pose, bx] of casos) {
          const a = R.novo(b.id); R.escolherCorpo(a, corpo);
          if (ro) R.vestir(a, ro);
          if (bx && !R.vestirBaixo(a, bx)) continue;   // parte de baixo que esse corpo não usa
          if (ac && !R.porAcess(a, ac)) continue;   // acessório que esse corpo não usa
          const g = A.geo(a.base, a.corpo, pose, a), m = await window.medirAmiguinho(a, { pose });
          const nome = b.id + '/' + corpo + (ro ? ' roupa ' + ro : '') + (bx ? ' parte de baixo ' + bx : '') + (ac ? ' acessório ' + ac : '') + (pose ? ' ' + pose : '');
          const erros = [];
          if (m.soltos.length) erros.push('peça solta em ' + m.soltos.map((c) => '[' + c.join(',') + ']').join(' '));
          if (m.fora) erros.push(m.fora + ' px cortados fora da imagem');
          if (!pose) {
            if (m.baixo < g.chao - 6) erros.push('flutua: ponto mais baixo ' + m.baixo + ', chão ' + g.chao);
            if (m.baixo > g.chao + 16) erros.push('afunda: ponto mais baixo ' + m.baixo + ', chão ' + g.chao);
          }
          if (corpo === 'pe' && !ro && !ac && !pose) {
            if (Math.abs(g.cab.x - 150) > 1) erros.push('cabeça fora do eixo (x ' + g.cab.x + ')');
            if (Math.abs((g.pe[0][0] + g.pe[1][0]) / 2 - 150) > 1 || g.pe[0][1] !== g.pe[1][1]) erros.push('pés fora do eixo ou desnivelados');
          }
          if (corpo === 'q' && !ac) {
            const p = g.pernas;
            if (p[0][1][1] !== p[1][1][1] || p[2][1][1] !== p[3][1][1]) erros.push('patas do mesmo par desniveladas');
          }
          n++;
          if (erros.length) ruins.push(nome + ': ' + erros.join('; '));
        }
      }
      return { n, ruins };
    });
    assert.ok(r.n > 8000, 'poucos casos desenhados: ' + r.n);
    assert.deepEqual(r.ruins.slice(0, 40), [], r.ruins.length + ' desenhos desalinhados (mostrando até 40)');
  } finally { await b.close(); }
});
