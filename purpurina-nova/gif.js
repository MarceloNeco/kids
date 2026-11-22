/* Purpurina Nova Era — GIF do desfile e da Baladinha (dono, 22/Nov/2026: "função pra gerar um GIF com o desfile ou a
   baladinha e compartilhar, por exemplo WhatsApp").
   Tudo no aparelho, sem internet e sem biblioteca de fora:
   1. gravar: enquanto a cena roda, 10 vezes por segundo, guarda uma "foto" de cada camada da cena — cada desenho SVG
      (como texto, com as cores que o CSS dá a ele) e cada <canvas> (fogos) — com a posição e a transparência dela.
      As sombras coloridas da Baladinha usam o desenho da própria dançarina (data-de / data-id), pintado da cor da luz.
   2. montar: depois de gravar, desenha cada quadro num canvas pequeno (360 de largura).
   3. codificar: transforma os quadros num GIF animado que se repete (cada quadro com as suas 256 cores, escolhidas por
      "corte na mediana", e compressão LZW, como manda o formato GIF89a).
   PurpurinaGif.gravar(palco, { ms, fps, largura, andamento(0..1) }) → Promise<Blob image/gif>
   PurpurinaGif.codificar([ImageData], atrasoCentesimos) → Blob (usado também nos testes) */
(function (raiz) {
  'use strict';

  // ---------- cores: corte na mediana (até 256 cores por quadro) ----------
  function paleta(px, n) {
    var amostra = [], passo = Math.max(1, Math.floor(px.length / 4 / 60000));
    for (var i = 0; i < px.length; i += 4 * passo) amostra.push((px[i] << 16) | (px[i + 1] << 8) | px[i + 2]);
    var caixas = [amostra];
    function faixa(cx) {
      var mn = [255, 255, 255], mx = [0, 0, 0];
      for (var k = 0; k < cx.length; k++) { var c = cx[k], r = c >> 16, g = (c >> 8) & 255, b = c & 255;
        if (r < mn[0]) mn[0] = r; if (r > mx[0]) mx[0] = r; if (g < mn[1]) mn[1] = g; if (g > mx[1]) mx[1] = g; if (b < mn[2]) mn[2] = b; if (b > mx[2]) mx[2] = b; }
      var d = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]], canal = d[0] >= d[1] && d[0] >= d[2] ? 0 : d[1] >= d[2] ? 1 : 2;
      return { canal: canal, tam: d[canal] };
    }
    while (caixas.length < n) {
      var melhor = -1, nota = 0, info = null;
      for (var j = 0; j < caixas.length; j++) { if (caixas[j].length < 2) continue; var f = faixa(caixas[j]), v = f.tam * Math.sqrt(caixas[j].length); if (v > nota) { nota = v; melhor = j; info = f; } }
      if (melhor < 0 || nota === 0) break;
      var sh = info.canal === 0 ? 16 : info.canal === 1 ? 8 : 0, cx = caixas[melhor];
      cx.sort(function (a, b) { return ((a >> sh) & 255) - ((b >> sh) & 255); });
      var meio = cx.length >> 1;
      caixas.splice(melhor, 1, cx.slice(0, meio), cx.slice(meio));
    }
    var pal = [];
    caixas.forEach(function (cx) {
      if (!cx.length) return;
      var r = 0, g = 0, b = 0; for (var k = 0; k < cx.length; k++) { r += cx[k] >> 16; g += (cx[k] >> 8) & 255; b += cx[k] & 255; }
      pal.push([Math.round(r / cx.length), Math.round(g / cx.length), Math.round(b / cx.length)]);
    });
    while (pal.length < 256) pal.push([0, 0, 0]);
    return pal;
  }
  function indices(px, pal) {
    var memo = new Int16Array(32768).fill(-1), out = new Uint8Array(px.length / 4);
    for (var i = 0, p = 0; i < px.length; i += 4, p++) {
      var r = px[i], g = px[i + 1], b = px[i + 2], ch = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3), m = memo[ch];
      if (m < 0) {
        var best = 0, bd = 1e9;
        for (var k = 0; k < pal.length; k++) { var dr = pal[k][0] - r, dg = pal[k][1] - g, db = pal[k][2] - b, d = dr * dr * 2 + dg * dg * 4 + db * db * 3; if (d < bd) { bd = d; best = k; } }
        m = memo[ch] = best;
      }
      out[p] = m;
    }
    return out;
  }

  // ---------- compressão LZW do GIF (código mínimo 8 bits, até 12 bits) ----------
  function lzw(idx) {
    var saida = [], bloco = [], acum = 0, nbits = 0, tam = 9, CLEAR = 256, FIM = 257, prox = 258, dic = new Map();
    function poe(cod) {
      acum |= cod << nbits; nbits += tam;
      while (nbits >= 8) { bloco.push(acum & 255); acum >>>= 8; nbits -= 8; if (bloco.length === 255) { saida.push(255); Array.prototype.push.apply(saida, bloco); bloco = []; } }
    }
    poe(CLEAR);
    var w = idx[0];
    for (var i = 1; i < idx.length; i++) {
      var k = idx[i], chave = (w << 8) | k, achou = dic.get(chave);
      if (achou !== undefined) { w = achou; continue; }
      poe(w);
      if (prox < 4096) { dic.set(chave, prox++); if (prox > (1 << tam) && tam < 12) tam++; }
      else { poe(CLEAR); dic = new Map(); prox = 258; tam = 9; }
      w = k;
    }
    poe(w); poe(FIM);
    if (nbits > 0) { bloco.push(acum & 255); if (bloco.length === 255) { saida.push(255); Array.prototype.push.apply(saida, bloco); bloco = []; } }
    if (bloco.length) { saida.push(bloco.length); Array.prototype.push.apply(saida, bloco); }
    saida.push(0);
    return new Uint8Array(saida);
  }

  function Codificador(w, h, atraso) {
    var partes = [], cab = [];
    function txt(s) { for (var i = 0; i < s.length; i++) cab.push(s.charCodeAt(i)); }
    function u16(v) { cab.push(v & 255, (v >> 8) & 255); }
    txt('GIF89a'); u16(w); u16(h); cab.push(0x00, 0, 0);   // sem paleta global (cada quadro traz a sua)
    cab.push(0x21, 0xFF, 11); txt('NETSCAPE2.0'); cab.push(3, 1, 0, 0, 0);   // repete para sempre
    partes.push(new Uint8Array(cab));
    return {
      quadro: function (img) {
        var pal = paleta(img.data, 256), ix = indices(img.data, pal), c = [];
        c.push(0x21, 0xF9, 4, 0x04, atraso & 255, (atraso >> 8) & 255, 0, 0);   // tempo de cada quadro (centésimos)
        c.push(0x2C, 0, 0, 0, 0, w & 255, w >> 8, h & 255, h >> 8, 0x87);       // quadro inteiro, com paleta própria de 256
        pal.forEach(function (p) { c.push(p[0], p[1], p[2]); });
        c.push(8);
        partes.push(new Uint8Array(c), lzw(ix));
      },
      fim: function () { partes.push(new Uint8Array([0x3B])); return new Blob(partes, { type: 'image/gif' }); }
    };
  }
  function codificar(quadros, atraso) {
    var g = Codificador(quadros[0].width, quadros[0].height, atraso || 10);
    quadros.forEach(function (q) { g.quadro(q); });
    return g.fim();
  }

  // ---------- gravar a cena ----------
  var SER = typeof XMLSerializer !== 'undefined' ? new XMLSerializer() : null;
  function opacidade(el, ate) { var o = 1; for (var e = el; e && e !== ate.parentNode; e = e.parentNode) { if (e.nodeType === 1) o *= parseFloat(getComputedStyle(e).opacity || 1); } return o; }
  function semTamanho(s) { return s.replace(/^<svg\b([^>]*)>/, function (m, at) { return '<svg' + at.replace(/\s(width|height|style)="[^"]*"/g, '') + '>'; }); }
  // camada de cenário: as cores vêm do CSS (luz da Baladinha, refletores do desfile) — vão para dentro do desenho
  function comCores(el) {
    var cl = el.cloneNode(true), vivos = el.querySelectorAll('[class]'), copias = cl.querySelectorAll('[class]');
    for (var i = 0; i < vivos.length; i++) { var cs = getComputedStyle(vivos[i]); copias[i].style.fill = cs.fill; copias[i].style.opacity = cs.opacity; copias[i].style.animation = 'none'; }
    return SER.serializeToString(cl);
  }
  function foto(palco) {
    var R = palco.getBoundingClientRect(), itens = [];
    Array.prototype.forEach.call(palco.querySelectorAll('svg, canvas'), function (el) {
      if (el.tagName.toLowerCase() === 'svg' && el.parentNode && el.parentNode.closest && el.parentNode.closest('svg')) return;
      if (!el.getClientRects().length) return;
      var cs = getComputedStyle(el); if (cs.visibility === 'hidden') return;
      var a = opacidade(el, palco); if (a < 0.02) return;
      var r = el.getBoundingClientRect(), x = r.left - R.left, y = r.top - R.top, w = r.width, h = r.height;
      // camadas que ocupam o palco inteiro (podem girar ou deslizar): o tamanho é o do palco, só o deslize conta
      if (el.classList.contains('bal-camada') || el.closest('.cena-desfile')) {
        var m = cs.transform && cs.transform !== 'none' ? new DOMMatrix(cs.transform) : null;
        var pr = el.parentNode.getBoundingClientRect();
        x = pr.left - R.left + (m ? m.e : 0); y = pr.top - R.top + (m ? m.f : 0); w = el.clientWidth || pr.width; h = el.clientHeight || pr.height;
        if (el.classList.contains('teto-show')) { var rt = el.getBoundingClientRect(); x = rt.left - R.left; y = rt.top - R.top; w = rt.width; h = rt.height; }
      }
      var it = { x: x, y: y, w: w, h: h, a: a };
      if (el.tagName.toLowerCase() === 'canvas') {
        var c2 = document.createElement('canvas'); c2.width = Math.min(el.width, 480); c2.height = Math.round(c2.width * el.height / Math.max(1, el.width));
        c2.getContext('2d').drawImage(el, 0, 0, c2.width, c2.height); it.canvas = c2;
      } else {
        var sombra = el.closest('[data-de]'), dona = el.closest('[data-id]');
        if (sombra) { it.de = sombra.getAttribute('data-de'); it.cor = getComputedStyle(sombra).color; }
        else {
          it.svg = semTamanho(el.querySelector('[class^="pp-"], .rig-cabeca') ? SER.serializeToString(el) : comCores(el));
          if (dona) it.id = dona.getAttribute('data-id');
        }
      }
      itens.push(it);
    });
    return { w: R.width, h: R.height, fundo: getComputedStyle(palco).backgroundColor, itens: itens };
  }
  function imagem(svg, w, h) {
    return new Promise(function (ok) {
      var s = svg.replace(/^<svg/, '<svg width="' + Math.max(1, Math.round(w)) + '" height="' + Math.max(1, Math.round(h)) + '"');
      var url = URL.createObjectURL(new Blob([s], { type: 'image/svg+xml' })), img = new Image();
      img.onload = function () { ok(img); URL.revokeObjectURL(url); };
      img.onerror = function () { ok(null); URL.revokeObjectURL(url); };
      img.src = url;
    });
  }
  function montar(f, W, H) {
    var esc = W / f.w, porId = {};
    return Promise.all(f.itens.map(function (it) {
      if (!it.svg) return Promise.resolve(null);
      return imagem(it.svg, it.w * esc * 1.5, it.h * esc * 1.5).then(function (img) { it.img = img; if (it.id) porId[it.id] = it; return img; });
    })).then(function () {
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      var c = cv.getContext('2d'); c.fillStyle = f.fundo && f.fundo !== 'rgba(0, 0, 0, 0)' ? f.fundo : '#12031f'; c.fillRect(0, 0, W, H);
      f.itens.forEach(function (it) {
        c.globalAlpha = it.a;
        var x = it.x * esc, y = it.y * esc, w = it.w * esc, h = it.h * esc;
        if (it.canvas) c.drawImage(it.canvas, x, y, w, h);
        else if (it.img) c.drawImage(it.img, x, y, w, h);
        else if (it.de && porId[it.de] && porId[it.de].img) {
          // sombra colorida: o desenho da dançarina, pintado inteiro da cor da luz
          var t = document.createElement('canvas'); t.width = Math.max(1, Math.round(w)); t.height = Math.max(1, Math.round(h));
          var tc = t.getContext('2d'); tc.drawImage(porId[it.de].img, 0, 0, t.width, t.height);
          tc.globalCompositeOperation = 'source-in'; tc.fillStyle = it.cor || '#f0f'; tc.fillRect(0, 0, t.width, t.height);
          c.drawImage(t, x, y, w, h);
        }
      });
      c.globalAlpha = 1;
      f.itens.forEach(function (it) { it.img = null; it.svg = null; });   // libera a memória do quadro
      return c.getImageData(0, 0, W, H);
    });
  }
  function gravar(palco, op) {
    op = op || {};
    var ms = op.ms || 3000, fps = op.fps || 10, W = op.largura || 360, fotos = [], andamento = op.andamento || function () {};
    return new Promise(function (ok, erro) {
      if (!SER || !raiz.DOMMatrix) { erro(new Error('sem suporte')); return; }
      var ini = performance.now(), n = Math.round(ms / 1000 * fps);
      (function tirar(k) {
        if (k >= n) return processar();
        try { fotos.push(foto(palco)); } catch (e) { erro(e); return; }
        andamento(0.4 * (k + 1) / n);
        var alvo = ini + (k + 1) * 1000 / fps;
        setTimeout(function () { tirar(k + 1); }, Math.max(0, alvo - performance.now()));
      })(0);
      function processar() {
        var H = Math.round(W * fotos[0].h / fotos[0].w / 2) * 2, g = Codificador(W, H, Math.round(100 / fps)), i = 0;
        (function prox() {
          if (i >= fotos.length) { ok(g.fim()); return; }
          montar(fotos[i], W, H).then(function (img) {
            g.quadro(img); fotos[i] = null; i++; andamento(0.4 + 0.6 * i / fotos.length);
            setTimeout(prox, 0);   // deixa a tela respirar entre um quadro e outro
          }).catch(erro);
        })();
      }
    });
  }

  var API = { gravar: gravar, codificar: codificar, paleta: paleta, lzw: lzw };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  raiz.PurpurinaGif = API;
})(typeof window !== 'undefined' ? window : this);
