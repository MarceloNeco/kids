/* Jogoteca — Sudoku 9×9 (pendência 69, dono 19/Nov/2026).
   Gerador próprio com solução ÚNICA: monta uma grade completa sorteada (busca com volta atrás, ordem embaralhada) e tira
   números em pares simétricos enquanto o solucionador (que conta soluções até 2) achar uma solução só.
   Pistas por nível: fácil 40–45, médio 32–35, difícil 26–29. Tudo em DOM + CSS (um <style id="jt-sudoku-css">,
   classes .jt-sud-*), sem imagem e sem rede. A lógica pura fica em "logica" para os testes no Node.
   Partida em andamento: ctx.gravar('partida-<nível>'); melhor tempo (sem dicas): ctx.gravar('melhor-<nível>'). */
(function () {
  'use strict';

  /* ================= lógica pura ================= */
  var FAIXA = { facil: [40, 45], medio: [32, 35], dificil: [26, 29] };
  var BITS = [];   // quantos bits ligados em cada máscara de 10 bits (candidatos 1..9 nos bits 1..9)
  (function () { for (var b = 0; b < 1024; b++) { var c = 0, x = b; while (x) { c += x & 1; x >>= 1; } BITS[b] = c; } })();
  var LIN = [], COL = [], CX = [], VIZ = [];
  (function () {
    var i, j;
    for (i = 0; i < 81; i++) { LIN[i] = Math.floor(i / 9); COL[i] = i % 9; CX[i] = Math.floor(LIN[i] / 3) * 3 + Math.floor(COL[i] / 3); }
    for (i = 0; i < 81; i++) {
      VIZ[i] = [];
      for (j = 0; j < 81; j++) if (j !== i && (LIN[j] === LIN[i] || COL[j] === COL[i] || CX[j] === CX[i])) VIZ[i].push(j);
    }
  })();
  // as 27 unidades (9 linhas, 9 colunas, 9 quadrados), cada uma com as 9 casas
  var UNIDADES = (function () {
    var u = [], k, i;
    for (k = 0; k < 27; k++) u.push([]);
    for (i = 0; i < 81; i++) { u[LIN[i]].push(i); u[9 + COL[i]].push(i); u[18 + CX[i]].push(i); }
    return u;
  })();

  // sorteador com semente (xorshift32): a mesma semente dá sempre o mesmo sudoku
  function sorteador(semente) {
    var x = (semente >>> 0) ^ 0x9E3779B9;
    if (!x) x = 0x6D2B79F5;
    function passo() {
      x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
      return x / 4294967296;
    }
    for (var k = 0; k < 12; k++) passo();   // aquece: sementes vizinhas (1, 2, 3…) dão começos bem diferentes
    return passo;
  }
  function embaralhar(a, rnd) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function zeros(n) { var a = []; for (var i = 0; i < n; i++) a.push(0); return a; }
  function agora() { return Date.now(); }

  /* Busca com volta atrás sobre máscaras de bits, sempre pela casa com menos candidatos.
     Mexe em g (fica preenchida se achar até "limite"); rnd embaralha a ordem dos candidatos (para gerar). */
  function busca(g, rnd, limite, aoAchar) {
    var lin = zeros(9), col = zeros(9), cx = zeros(9), i;
    for (i = 0; i < 81; i++) {
      if (!g[i]) continue;
      var m = 1 << g[i];
      if ((lin[LIN[i]] | col[COL[i]] | cx[CX[i]]) & m) return 0;   // grade já em conflito
      lin[LIN[i]] |= m; col[COL[i]] |= m; cx[CX[i]] |= m;
    }
    var cont = 0;
    function rec() {
      var melhor = -1, mm = 0, mn = 10, k, m, n;
      for (k = 0; k < 81; k++) {
        if (g[k]) continue;
        m = ~(lin[LIN[k]] | col[COL[k]] | cx[CX[k]]) & 1022;
        n = BITS[m];
        if (!n) return false;
        if (n < mn) { mn = n; mm = m; melhor = k; if (n === 1) break; }
      }
      if (melhor < 0) { cont++; if (aoAchar) aoAchar(g); return cont >= limite; }
      var cands = [];
      for (n = 1; n <= 9; n++) if (mm & (1 << n)) cands.push(n);
      if (rnd) embaralhar(cands, rnd);
      var L = LIN[melhor], C = COL[melhor], X = CX[melhor];
      for (k = 0; k < cands.length; k++) {
        var bit = 1 << cands[k];
        g[melhor] = cands[k]; lin[L] |= bit; col[C] |= bit; cx[X] |= bit;
        if (rec()) return true;
        g[melhor] = 0; lin[L] &= ~bit; col[C] &= ~bit; cx[X] &= ~bit;
      }
      return false;
    }
    rec();
    return cont;
  }
  function contarSolucoes(grade, limite) { return busca(grade.slice(), null, limite || 2); }
  function resolver(grade) {
    var s = null;
    busca(grade.slice(), null, 1, function (g) { s = g.slice(); });
    return s;
  }
  // o número n pode ir na casa i sem repetir na linha, na coluna e no quadrado?
  function valido(grade, i, n) {
    for (var k = 0; k < 20; k++) if (grade[VIZ[i][k]] === n) return false;
    return true;
  }
  // grade completa e certa pelas regras (cada unidade com 1..9)
  function solucaoValida(grade) {
    if (!grade || grade.length !== 81) return false;
    for (var u = 0; u < 27; u++) {
      var visto = 0;
      for (var k = 0; k < 9; k++) { var v = grade[UNIDADES[u][k]]; if (!(v >= 1 && v <= 9) || visto & (1 << v)) return false; visto |= 1 << v; }
    }
    return true;
  }
  function contarPistas(g) { var n = 0; for (var i = 0; i < 81; i++) if (g[i]) n++; return n; }

  /* gerar(nivel, semente) → { pistas: [81] (0 = vazia), solucao: [81], quantas }.
     Tira números (pares simétricos primeiro, depois soltos) até o alvo sorteado na faixa do nível; se a grade não
     chegar à faixa, tenta outra. Teto de tempo: 1,2 s (fica com a melhor tentativa). */
  function gerar(nivel, semente) {
    var faixa = FAIXA[nivel] || FAIXA.facil;
    if (semente == null) semente = Math.floor(Math.random() * 4294967295);
    var rnd = sorteador(semente);
    var alvo = faixa[0] + Math.floor(rnd() * (faixa[1] - faixa[0] + 1));
    var inicio = agora(), melhor = null, tent, i, k;
    for (tent = 0; tent < 40; tent++) {
      var sol = zeros(81);
      busca(sol, rnd, 1);
      var g = sol.slice(), pistas = 81;
      var pares = [];
      for (i = 0; i <= 40; i++) pares.push(i);
      embaralhar(pares, rnd);
      for (k = 0; k < pares.length && pistas > alvo; k++) {
        i = pares[k];
        var j = 80 - i, dois = i !== j && pistas - 2 >= alvo, a = g[i], b = g[j];
        g[i] = 0; if (dois) g[j] = 0;
        if (contarSolucoes(g, 2) === 1) pistas -= dois ? 2 : 1;
        else { g[i] = a; g[j] = b; }
      }
      if (pistas > alvo) {   // segunda volta: casas soltas
        var soltas = [];
        for (i = 0; i < 81; i++) if (g[i]) soltas.push(i);
        embaralhar(soltas, rnd);
        for (k = 0; k < soltas.length && pistas > alvo; k++) {
          i = soltas[k]; var v = g[i]; g[i] = 0;
          if (contarSolucoes(g, 2) === 1) pistas--; else g[i] = v;
        }
      }
      var res = { pistas: g, solucao: sol, quantas: pistas };
      if (pistas <= faixa[1]) return res;
      if (!melhor || pistas < melhor.quantas) melhor = res;
      if (agora() - inicio > 1200) break;
    }
    return melhor;
  }

  var logica = { FAIXA: FAIXA, gerar: gerar, resolver: resolver, contarSolucoes: contarSolucoes, valido: valido,
    solucaoValida: solucaoValida, contarPistas: contarPistas, sorteador: sorteador, UNIDADES: UNIDADES };

  /* ================= visual ================= */
  var CSS = [
    '.jt-sud{position:absolute;inset:0;overflow:hidden;display:grid;justify-content:center;align-content:center;gap:var(--gap);padding:var(--pad);box-sizing:border-box;',
    '  font-family:inherit;color:#fff;-webkit-user-select:none;user-select:none}',
    '.jt-sud.jt-sud-empe{grid-template-columns:var(--lado);grid-template-rows:auto var(--lado) var(--tecla) auto;grid-template-areas:"info" "tab" "teclas" "ferr"}',
    '.jt-sud.jt-sud-deitado{grid-template-columns:var(--lado) var(--painel);grid-template-rows:1fr auto auto auto 1fr;height:auto;',
    '  grid-template-areas:"tab ." "tab info" "tab teclas" "tab ferr" "tab .";column-gap:calc(var(--gap) * 2)}',
    '.jt-sud-deitado .jt-sud-tab{grid-row:1 / 6;align-self:center}',
    /* placa: pílulas de tempo, recorde e dicas */
    '.jt-sud-info{grid-area:info;display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:calc(15px * var(--esc));font-weight:600}',
    '.jt-sud-pilula{display:inline-flex;align-items:center;gap:.35em;padding:.28em .8em;border-radius:999px;background:rgba(255,255,255,.12);',
    '  border:1.5px solid rgba(255,255,255,.22);white-space:nowrap;font-variant-numeric:tabular-nums}',
    '.jt-sud-pilula b{font-weight:700;color:#fff}',
    '.jt-sud-pilula.jt-sud-ouro b{color:#ffd65c}',
    /* tabuleiro: papel azulado, linhas grossas a cada 3 */
    '.jt-sud-tab{grid-area:tab;width:var(--lado);height:var(--lado);box-sizing:border-box;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);',
    '  gap:var(--grossa);padding:var(--grossa);border-radius:calc(var(--cel) * .2);background:#26387f;',
    '  box-shadow:0 0 0 calc(var(--grossa) * .8) rgba(255,255,255,.14),0 16px 36px rgba(0,0,0,.42)}',
    '.jt-sud-cx{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:1px;background:#bccbeb;overflow:hidden}',
    '.jt-sud-cx:nth-child(1){border-top-left-radius:calc(var(--cel) * .12)}.jt-sud-cx:nth-child(3){border-top-right-radius:calc(var(--cel) * .12)}',
    '.jt-sud-cx:nth-child(7){border-bottom-left-radius:calc(var(--cel) * .12)}.jt-sud-cx:nth-child(9){border-bottom-right-radius:calc(var(--cel) * .12)}',
    '.jt-sud-cel{position:relative;min-width:0;min-height:0;overflow:hidden;display:flex;align-items:center;justify-content:center;cursor:pointer;',
    '  background:#f5f8ff;background-image:linear-gradient(160deg,#fbfcff 0%,#eef3fd 100%);transition:background-color .12s}',
    '.jt-sud-cel.jt-sud-viz{background:#e0e9fb;background-image:none}',
    '.jt-sud-cel.jt-sud-igual{background:#c6d9ff;background-image:none}',
    '.jt-sud-cel.jt-sud-erro{background:#ffe1e5;background-image:none}',
    '.jt-sud-cel.jt-sud-sel{background:#fff1a3;background-image:none;box-shadow:inset 0 0 0 calc(var(--grossa) * .8) #f0bf2c}',
    '.jt-sud-v{position:relative;z-index:1;font-size:calc(var(--cel) * .62);line-height:1;font-weight:500;color:#1f6dff}',
    '.jt-sud-dado .jt-sud-v{color:#1a2a5e;font-weight:600}',
    '.jt-sud-dica .jt-sud-v{color:#7b4bd6;font-weight:600}',
    '.jt-sud-erro .jt-sud-v{color:#e0283c}',
    '.jt-sud-igual .jt-sud-v,.jt-sud-sel .jt-sud-v{font-weight:700}',
    '.jt-sud-notas{position:absolute;inset:6%;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);',
    '  font-size:calc(var(--cel) * .25);line-height:1;color:#5b6b98;font-weight:500;text-align:center;align-items:center}',
    '.jt-sud-notas span.jt-sud-nota-igual{color:#fff;background:#3f7cff;border-radius:30%}',
    '.jt-sud-luz{position:absolute;inset:0;opacity:0;pointer-events:none;background:radial-gradient(circle,#fff6c4 0%,#ffd24d 70%,#ffbf1f 100%)}',
    '.jt-sud-luz.jt-sud-onda{animation:jt-sud-onda .62s ease-out both}',
    '.jt-sud-luz.jt-sud-calma{animation:jt-sud-pisca .45s linear both}',
    '.jt-sud-v.jt-sud-pop{animation:jt-sud-pop .22s ease-out}',
    '@keyframes jt-sud-onda{0%{opacity:0;transform:scale(.4)}35%{opacity:.95;transform:scale(1)}100%{opacity:0;transform:scale(1)}}',
    '@keyframes jt-sud-pisca{0%{opacity:0}40%{opacity:.6}100%{opacity:0}}',
    '@keyframes jt-sud-pop{0%{transform:scale(.5);opacity:.3}65%{transform:scale(1.18);opacity:1}100%{transform:scale(1)}}',
    /* teclado de números */
    '.jt-sud-teclas{grid-area:teclas;display:grid;gap:var(--gt)}',
    '.jt-sud-empe .jt-sud-teclas{grid-template-columns:repeat(9,1fr);height:var(--tecla)}',
    '.jt-sud-deitado .jt-sud-teclas{grid-template-columns:repeat(3,1fr);grid-auto-rows:var(--tecla)}',
    '.jt-sud-num{position:relative;border:0;padding:0;border-radius:calc(var(--tecla) * .2);min-width:0;',
    '  font-size:var(--fnum);font-weight:600;line-height:1;color:#1d3584;',
    '  background:linear-gradient(180deg,#ffffff 0%,#e4ecfc 100%);box-shadow:0 4px 0 #8aa1d6,0 8px 14px rgba(0,0,0,.25);transition:transform .08s,opacity .2s}',
    '.jt-sud-empe .jt-sud-num{border-radius:12px}',
    '.jt-sud-num:active{transform:translateY(3px);box-shadow:0 1px 0 #8aa1d6,0 3px 6px rgba(0,0,0,.25)}',
    '.jt-sud-num small{position:absolute;top:.3em;right:.45em;font-size:calc(var(--fnum) * .34);font-weight:600;color:#7d8dbb}',
    '.jt-sud-empe .jt-sud-num small{top:auto;bottom:.35em;right:0;left:0;text-align:center}',
    '.jt-sud-num.jt-sud-marcado{box-shadow:0 0 0 3px #ffcf4a,0 4px 0 #8aa1d6,0 8px 14px rgba(0,0,0,.25)}',
    '.jt-sud-num.jt-sud-feito{opacity:.28;box-shadow:none;background:#c9d4ee}',
    '.jt-sud-rascunho .jt-sud-num{color:#5b6b98;font-weight:500}',
    '.jt-sud-num:focus-visible,.jt-sud-fer:focus-visible,.jt-sud-bt:focus-visible{outline:3px solid #ffcf4a;outline-offset:2px}',
    /* ferramentas */
    '.jt-sud-ferr{grid-area:ferr;display:grid;grid-template-columns:repeat(4,1fr);gap:var(--gt)}',
    '.jt-sud-fer{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.15em;min-width:0;',
    '  height:var(--ferr);padding:0 2px;border-radius:16px;border:1.5px solid rgba(255,255,255,.35);background:rgba(255,255,255,.12);color:#fff}',
    '.jt-sud-fer:active{transform:translateY(2px)}',
    '.jt-sud-fer i{font-style:normal;font-size:calc(21px * var(--esc));line-height:1}',
    '.jt-sud-fer span{font-size:calc(12.5px * var(--esc));font-weight:600;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}',
    '.jt-sud-compacto .jt-sud-fer span{display:none}',
    '.jt-sud-fer[aria-pressed="true"]{color:#3a2300;border-color:#ffe07a;background:linear-gradient(180deg,#ffe07a 0%,#ffcf4a 50%,#ff9d2e 100%);box-shadow:0 3px 0 #b45d0c}',
    '.jt-sud-fer b{position:absolute;top:-6px;right:-4px;min-width:20px;height:20px;padding:0 5px;box-sizing:border-box;border-radius:999px;',
    '  background:#7b4bd6;color:#fff;font-size:12px;line-height:20px;box-shadow:0 2px 4px rgba(0,0,0,.35)}',
    /* aviso e véu de "Continuar" */
    '.jt-sud-aviso{position:absolute;left:50%;bottom:calc(var(--pad) + 8px);z-index:6;transform:translate(-50%,8px);opacity:0;pointer-events:none;',
    '  max-width:90%;padding:10px 18px;border-radius:999px;background:#1b2550;border:2px solid rgba(255,255,255,.3);',
    '  box-shadow:0 8px 22px rgba(0,0,0,.45);font-size:16px;font-weight:600;text-align:center;transition:opacity .2s,transform .2s}',
    '.jt-sud-aviso.jt-sud-ver{opacity:1;transform:translate(-50%,0)}',
    '.jt-sud-veu{position:absolute;inset:0;z-index:8;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(4,6,30,.62)}',
    '.jt-sud-caixa{width:min(420px,100%);box-sizing:border-box;padding:20px 18px 18px;border-radius:24px;text-align:center;display:flex;flex-direction:column;gap:12px;',
    '  background:linear-gradient(180deg,#2a3a8f,#20165a);border:2px solid rgba(255,255,255,.3);box-shadow:0 16px 40px rgba(0,0,0,.5)}',
    '.jt-sud-caixa h3{margin:0;font-size:24px;color:#ffcf4a}',
    '.jt-sud-caixa p{margin:0;font-size:17px;line-height:1.35}',
    '.jt-sud-bt{min-height:52px;border:0;border-radius:999px;font-size:20px;font-weight:700;color:#3a2300;',
    '  background:linear-gradient(180deg,#ffe07a 0%,#ffcf4a 45%,#ff9d2e 100%);box-shadow:0 5px 0 #b45d0c,0 10px 22px rgba(0,0,0,.35)}',
    '.jt-sud-bt.jt-sud-bt2{min-height:46px;font-size:17px;color:#fff;background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.4);box-shadow:none}',
    '.jt-sud-bt:active{transform:translateY(3px)}',
    '@media (prefers-reduced-motion:reduce){.jt-sud-luz.jt-sud-onda{animation:jt-sud-pisca .45s linear both}.jt-sud-v.jt-sud-pop{animation:none}}'
  ].join('\n');
  function injetarCSS() {
    if (document.getElementById('jt-sudoku-css')) return;
    var s = document.createElement('style');
    s.id = 'jt-sudoku-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function relogio(s) {
    var h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = s % 60;
    return (h ? h + ':' + (m < 10 ? '0' : '') : '') + (m < 10 && !h ? '0' : '') + m + ':' + (ss < 10 ? '0' : '') + ss;
  }

  var acabouDeParar = false;   // parar() e iniciar() no mesmo instante = 🔄 Recomeçar ou "Jogar de novo": partida nova

  /* ================= o jogo na tela ================= */
  function iniciar(palco, ctx) {
    var t = ctx.t, nivel = FAIXA[ctx.nivel] ? ctx.nivel : 'facil', calmo = !!ctx.calmo;
    var CH = 'partida-' + nivel, CH_MELHOR = 'melhor-' + nivel;
    var recomeco = acabouDeParar;
    injetarCSS();

    var E = null, hist = [], rascunho = false, fim = false, mostrarErros = false, veu = null;
    var relogioId = 0, timers = [], avisoId = 0;
    var melhor = ctx.ler(CH_MELHOR);
    if (typeof melhor !== 'number') melhor = null;

    /* ---- montar a tela ---- */
    var raiz = el('div', 'jt-sud jt-sud-empe');
    var info = el('div', 'jt-sud-info');
    var pTempo = el('span', 'jt-sud-pilula', '⏱ <b>00:00</b>');
    var pMelhor = el('span', 'jt-sud-pilula jt-sud-ouro', '🏆 <b>—</b>');
    var pDicas = el('span', 'jt-sud-pilula', '💡 <b>0</b>');
    pTempo.title = t('Tempo', 'Time', 'Tiempo');
    pMelhor.title = t('Melhor tempo sem dicas', 'Best time without hints', 'Mejor tiempo sin pistas');
    pDicas.title = t('Dicas usadas', 'Hints used', 'Pistas usadas');
    info.appendChild(pTempo); info.appendChild(pMelhor); info.appendChild(pDicas);

    var tab = el('div', 'jt-sud-tab');
    tab.setAttribute('role', 'grid'); tab.setAttribute('aria-label', 'Sudoku');
    var caixas = [], cels = [], i, n;
    for (i = 0; i < 9; i++) { caixas.push(el('div', 'jt-sud-cx')); tab.appendChild(caixas[i]); }
    for (i = 0; i < 81; i++) {
      var c = el('div', 'jt-sud-cel');
      c.setAttribute('role', 'gridcell'); c.setAttribute('data-i', i);
      c.luz = el('span', 'jt-sud-luz'); c.v = el('span', 'jt-sud-v'); c.notas = el('span', 'jt-sud-notas');
      c.notasN = [];
      for (n = 1; n <= 9; n++) { var sn = el('span'); c.notasN.push(sn); c.notas.appendChild(sn); }
      c.appendChild(c.luz); c.appendChild(c.v); c.appendChild(c.notas);
      cels.push(c);
    }
    // cada quadrado recebe as suas 9 casas na ordem de leitura
    for (i = 0; i < 81; i++) caixas[CX[i]].appendChild(cels[i]);

    var teclas = el('div', 'jt-sud-teclas'), nums = [];
    for (n = 1; n <= 9; n++) {
      var b = el('button', 'jt-sud-num', n + '<small></small>');
      b.type = 'button'; b.setAttribute('data-n', n);
      nums.push(b); teclas.appendChild(b);
    }
    var ferr = el('div', 'jt-sud-ferr');
    function ferramenta(icone, rotulo, id) {
      var f = el('button', 'jt-sud-fer', '<i aria-hidden="true">' + icone + '</i><span>' + rotulo + '</span>');
      f.type = 'button'; f.setAttribute('data-f', id); f.setAttribute('aria-label', rotulo); f.title = rotulo;
      ferr.appendChild(f); return f;
    }
    var btRasc = ferramenta('✏️', t('Rascunho', 'Notes', 'Borrador'), 'rascunho');
    var btApagar = ferramenta('⌫', t('Apagar', 'Erase', 'Borrar'), 'apagar');
    var btDesfazer = ferramenta('↶', t('Desfazer', 'Undo', 'Deshacer'), 'desfazer');
    var btDica = ferramenta('💡', t('Dica', 'Hint', 'Pista'), 'dica');
    btRasc.setAttribute('aria-pressed', 'false');
    var aviso = el('div', 'jt-sud-aviso'); aviso.setAttribute('role', 'status');

    raiz.appendChild(info); raiz.appendChild(tab); raiz.appendChild(teclas); raiz.appendChild(ferr); raiz.appendChild(aviso);
    palco.appendChild(raiz);

    /* ---- tamanhos: em pé (grade em cima, teclado embaixo) ou deitado (grade à esquerda, teclado à direita) ---- */
    function medir() {
      var W = palco.clientWidth, H = palco.clientHeight;
      if (!W || !H) return;
      var grande = W >= 900 && H >= 600, pad = grande ? 24 : 10, gap = grande ? 16 : 8;
      var deitado = W > H * 1.1, lado, painel = 0, tecla, gt, esc, fnum, ferrH;
      if (deitado) {
        lado = Math.floor(Math.min(H - 2 * pad, W - 2 * pad - 2 * gap - 230, 960));
        painel = Math.floor(Math.min(W - 2 * pad - 2 * gap - lado, Math.max(230, lado * 0.95), 520));
        esc = Math.max(0.85, Math.min(lado / 400, 1.7));
        gt = Math.round(6 * Math.max(1, esc));
        var kw = (painel - 2 * gt) / 3, infoH = 15 * esc * 1.8 + 6;
        ferrH = 58 * esc;
        tecla = Math.floor(Math.min(kw * 0.8, (lado - infoH - ferrH - 3 * gap - 2 * gt) / 3));
        fnum = Math.min(tecla * 0.55, kw * 0.45);
      } else {
        esc = W < 360 ? 0.9 : Math.max(1, Math.min((W - 2 * pad) / 420, 1.5));   // tablet em pé: letras maiores
        gt = W < 360 ? 4 : Math.round(5 * esc);
        ferrH = 58 * esc;
        var fixo = 2 * pad + 36 * esc + ferrH + 3 * gap;
        lado = Math.floor(Math.min(W - 2 * pad, 720));
        var kw2 = (lado - 8 * gt) / 9;
        tecla = Math.min(H - fixo - lado, kw2 * 1.7, 84);
        if (tecla < 46) { tecla = 46; lado = Math.floor(Math.min(lado, H - fixo - tecla)); kw2 = (lado - 8 * gt) / 9; }
        else if (H - fixo - lado - tecla > 60) { tecla = Math.min(kw2 * 2, 92); ferrH = 68; }   // celular comprido: teclas maiores
        tecla = Math.floor(tecla);
        fnum = Math.min(tecla * 0.5, kw2 * 0.78);
      }
      raiz.className = 'jt-sud ' + (deitado ? 'jt-sud-deitado' : 'jt-sud-empe') + (rascunho ? ' jt-sud-rascunho' : '') +
        ((deitado ? painel : lado) / 4 < 64 ? ' jt-sud-compacto' : '');
      var st = raiz.style;
      st.setProperty('--pad', pad + 'px'); st.setProperty('--gap', gap + 'px'); st.setProperty('--gt', gt + 'px');
      st.setProperty('--lado', lado + 'px'); st.setProperty('--painel', painel + 'px');
      st.setProperty('--cel', (lado / 9).toFixed(2) + 'px'); st.setProperty('--grossa', Math.max(2, Math.round(lado / 120)) + 'px');
      st.setProperty('--tecla', tecla + 'px'); st.setProperty('--ferr', Math.round(ferrH) + 'px'); st.setProperty('--fnum', Math.round(fnum) + 'px'); st.setProperty('--esc', esc.toFixed(3));
    }

    /* ---- desenhar o estado ---- */
    function contagem() {
      var conta = zeros(10);
      for (var k = 0; k < 81; k++) if (E.val[k]) conta[E.val[k]]++;
      return conta;
    }
    function errado(k) { return E.val[k] && !E.pistas[k] && E.val[k] !== E.sol[k]; }
    function pintar() {
      if (!E) return;
      var s = E.sel, vs = E.val[s], k, m;
      for (k = 0; k < 81; k++) {
        var c = cels[k], v = E.val[k], cl = 'jt-sud-cel';
        if (E.pistas[k]) cl += ' jt-sud-dado'; else if (E.dica[k]) cl += ' jt-sud-dica'; else if (v) cl += ' jt-sud-meu';
        if (k === s) cl += ' jt-sud-sel';
        else if (vs && v === vs) cl += ' jt-sud-igual';
        else if (LIN[k] === LIN[s] || COL[k] === COL[s] || CX[k] === CX[s]) cl += ' jt-sud-viz';
        if (errado(k) && (nivel !== 'dificil' || mostrarErros)) cl += ' jt-sud-erro';
        if (c.className !== cl) c.className = cl;
        var txt = v ? String(v) : '';
        if (c.v.textContent !== txt) c.v.textContent = txt;
        var nt = v ? 0 : E.notas[k];
        if (c.ultNotas !== nt || c.ultVs !== vs) {
          for (m = 1; m <= 9; m++) {
            var tem = nt & (1 << m);
            c.notasN[m - 1].textContent = tem ? m : '';
            c.notasN[m - 1].className = tem && m === vs ? 'jt-sud-nota-igual' : '';
          }
          c.ultNotas = nt; c.ultVs = vs;
        }
        c.setAttribute('aria-label', t('Linha ', 'Row ', 'Fila ') + (LIN[k] + 1) + ', ' + t('coluna ', 'column ', 'columna ') + (COL[k] + 1) + ': ' + (v || t('vazia', 'empty', 'vacía')));
      }
      var conta = contagem();
      for (m = 1; m <= 9; m++) {
        var bt = nums[m - 1], resta = 9 - conta[m];
        var clb = 'jt-sud-num' + (resta <= 0 ? ' jt-sud-feito' : '') + (vs === m && resta > 0 ? ' jt-sud-marcado' : '');
        if (bt.className !== clb) bt.className = clb;
        bt.lastChild.textContent = resta > 0 ? resta : '';
        bt.setAttribute('aria-label', m + ' (' + t('faltam ', 'left: ', 'faltan ') + Math.max(0, resta) + ')');
      }
      btRasc.setAttribute('aria-pressed', String(rascunho));
      raiz.classList.toggle('jt-sud-rascunho', rascunho);
      btDica.innerHTML = '<i aria-hidden="true">💡</i><span>' + t('Dica', 'Hint', 'Pista') + '</span>' + (E.dicas ? '<b>' + E.dicas + '</b>' : '');
      pintarInfo();
    }
    function pintarInfo() {
      if (!E) return;
      pTempo.lastChild.textContent = relogio(E.tempo);
      pMelhor.lastChild.textContent = melhor != null ? relogio(melhor) : '—';
      pDicas.lastChild.textContent = E.dicas;
    }
    function avisar(texto) {
      aviso.textContent = texto; aviso.classList.add('jt-sud-ver');
      clearTimeout(avisoId); avisoId = setTimeout(function () { aviso.classList.remove('jt-sud-ver'); }, 2800);
    }
    function brilhar(lista, passo) {
      for (var k = 0; k < lista.length; k++) {
        var luz = cels[lista[k]].luz, cls = calmo ? 'jt-sud-calma' : 'jt-sud-onda';
        luz.className = 'jt-sud-luz'; void luz.offsetWidth;
        luz.style.animationDelay = calmo ? '0ms' : (k * passo) + 'ms';
        luz.className = 'jt-sud-luz ' + cls;
      }
    }
    function pular(k) {
      if (calmo) return;
      var v = cels[k].v; v.classList.remove('jt-sud-pop'); void v.offsetWidth; v.classList.add('jt-sud-pop');
    }

    /* ---- guardar ---- */
    function salvar() { if (E && !fim) ctx.gravar(CH, E); }
    function partidaNova() {
      var g = gerar(nivel);
      E = { nivel: nivel, pistas: g.pistas, sol: g.solucao, val: g.pistas.slice(), notas: zeros(81), dica: zeros(81), tempo: 0, dicas: 0, sel: 0 };
      for (var k = 0; k < 81; k++) if (!E.pistas[k]) { E.sel = k; break; }
      hist = []; fim = false; mostrarErros = false; rascunho = false;
      salvar(); medir(); pintar();
    }
    function salvoBom(s) {
      if (!s || typeof s !== 'object' || s.nivel !== nivel) return false;
      var campos = ['pistas', 'sol', 'val', 'notas', 'dica'];
      for (var k = 0; k < campos.length; k++) if (!s[campos[k]] || s[campos[k]].length !== 81) return false;
      return solucaoValida(s.sol) && typeof s.tempo === 'number';
    }

    /* ---- jogadas ---- */
    function registrar(lista) {
      var foto = [];
      for (var k = 0; k < lista.length; k++) foto.push({ i: lista[k], v: E.val[lista[k]], n: E.notas[lista[k]] });
      hist.push(foto);
      if (hist.length > 400) hist.shift();
    }
    function fixa(k) { return !!(E.pistas[k] || E.dica[k]); }
    function escrever(nn) {
      if (!E || fim || veu) return;
      var k = E.sel;
      if (fixa(k)) { ctx.som('toque'); return; }
      if (rascunho) {
        if (E.val[k]) { avisar(t('Apague o número para fazer anotações.', 'Erase the number to add notes.', 'Borra el número para tomar notas.')); return; }
        registrar([k]); E.notas[k] ^= (1 << nn);
        ctx.som('toque'); salvar(); pintar(); return;
      }
      var muda = [k], bit = 1 << nn, p;
      for (p = 0; p < 20; p++) if (E.notas[VIZ[k][p]] & bit) muda.push(VIZ[k][p]);
      registrar(muda);
      mostrarErros = false;
      if (E.val[k] === nn) { E.val[k] = 0; ctx.som('toque'); }
      else {
        E.val[k] = nn; E.notas[k] = 0;
        for (p = 0; p < 20; p++) E.notas[VIZ[k][p]] &= ~bit;
        ctx.som(nivel !== 'dificil' && nn !== E.sol[k] ? 'erro' : 'toque');
        pular(k);
      }
      salvar(); pintar();
      if (E.val[k]) depoisDeEscrever(k);
    }
    function apagar() {
      if (!E || fim || veu) return;
      var k = E.sel;
      if (fixa(k) || (!E.val[k] && !E.notas[k])) return;
      registrar([k]); E.val[k] = 0; E.notas[k] = 0; mostrarErros = false;
      ctx.som('toque'); salvar(); pintar();
    }
    function desfazer() {
      if (!E || fim || veu) return;
      var foto = hist.pop();
      if (!foto) { avisar(t('Nada para desfazer.', 'Nothing to undo.', 'Nada que deshacer.')); return; }
      for (var k = 0; k < foto.length; k++) {
        if (fixa(foto[k].i)) continue;   // casa que virou dica fica como está
        E.val[foto[k].i] = foto[k].v; E.notas[foto[k].i] = foto[k].n;
      }
      E.sel = foto[0].i; mostrarErros = false;
      ctx.som('toque'); salvar(); pintar();
    }
    function alternarRascunho() {
      if (!E || fim || veu) return;
      rascunho = !rascunho; ctx.som('toque'); pintar();
    }
    function darDica() {
      if (!E || fim || veu) return;
      var k = E.sel, cand = [], p;
      if (fixa(k) || E.val[k] === E.sol[k]) {
        for (p = 0; p < 81; p++) if (!fixa(p) && E.val[p] !== E.sol[p]) cand.push(p);
        if (!cand.length) return;
        k = cand[Math.floor(Math.random() * cand.length)];
      }
      var bit = 1 << E.sol[k];
      E.val[k] = E.sol[k]; E.notas[k] = 0; E.dica[k] = 1; E.dicas++; E.sel = k; mostrarErros = false;
      for (p = 0; p < 20; p++) E.notas[VIZ[k][p]] &= ~bit;
      ctx.som('certo'); pular(k); salvar(); pintar();
      depoisDeEscrever(k);
    }
    // linha, coluna ou quadrado completos (sem repetir) ganham uma onda de luz; grade cheia: confere o fim
    function depoisDeEscrever(k) {
      var unid = [LIN[k], 9 + COL[k], 18 + CX[k]], completou = false;
      var cheia = true, p;
      for (p = 0; p < 81; p++) if (!E.val[p]) { cheia = false; break; }
      if (cheia) { conferirFim(); return; }
      for (var u = 0; u < 3; u++) {
        var lista = UNIDADES[unid[u]], visto = 0, ok = true;
        for (p = 0; p < 9; p++) { var v = E.val[lista[p]]; if (!v || (visto & (1 << v))) { ok = false; break; } visto |= 1 << v; }
        if (ok) { completou = true; brilhar(lista, 45); }
      }
      if (completou) ctx.som('certo');
    }
    function conferirFim() {
      var erros = 0;
      for (var p = 0; p < 81; p++) if (E.val[p] !== E.sol[p]) erros++;
      if (!erros) { vitoria(); return; }
      mostrarErros = true; pintar(); ctx.som('erro');
      avisar(erros === 1 ? t('Quase! Um número está errado (em vermelho).', 'Almost! One number is wrong (in red).', '¡Casi! Hay un número mal (en rojo).')
        : t('Quase! ' + erros + ' números estão errados (em vermelho).', 'Almost! ' + erros + ' numbers are wrong (in red).', '¡Casi! Hay ' + erros + ' números mal (en rojo).'));
    }
    function vitoria() {
      fim = true; rascunho = false;
      var recorde = false, tempo = E.tempo, dicas = E.dicas;
      if (!dicas && (melhor == null || tempo < melhor)) { recorde = true; melhor = tempo; ctx.gravar(CH_MELHOR, tempo); }
      ctx.gravar(CH, null);
      pintar();
      var todas = [];
      for (var d = 0; d < 17; d++) for (var p = 0; p < 81; p++) if (LIN[p] + COL[p] === d) todas.push(p);
      brilhar(todas, 9);
      var tt = relogio(tempo);
      timers.push(setTimeout(function () {
        ctx.venceu(
          'Sudoku completo em ' + tt + '!' + (recorde ? ' 🏆 Novo recorde!' : '') + (dicas ? ' Dicas usadas: ' + dicas + '.' : ' Sem nenhuma dica!'),
          'Sudoku solved in ' + tt + '!' + (recorde ? ' 🏆 New record!' : '') + (dicas ? ' Hints used: ' + dicas + '.' : ' Not a single hint!'),
          '¡Sudoku resuelto en ' + tt + '!' + (recorde ? ' 🏆 ¡Nuevo récord!' : '') + (dicas ? ' Pistas usadas: ' + dicas + '.' : ' ¡Sin ninguna pista!'));
      }, calmo ? 350 : 1300));
    }

    /* ---- toque e teclado ---- */
    tab.addEventListener('click', function (e) {
      if (!E || fim || veu) return;
      var alvo = e.target;
      while (alvo && alvo !== tab && !alvo.getAttribute('data-i')) alvo = alvo.parentNode;
      if (!alvo || alvo === tab) return;
      E.sel = +alvo.getAttribute('data-i'); pintar();
    });
    teclas.addEventListener('click', function (e) {
      var alvo = e.target;
      while (alvo && alvo !== teclas && !alvo.getAttribute('data-n')) alvo = alvo.parentNode;
      if (alvo && alvo !== teclas) escrever(+alvo.getAttribute('data-n'));
    });
    btRasc.addEventListener('click', alternarRascunho);
    btApagar.addEventListener('click', apagar);
    btDesfazer.addEventListener('click', desfazer);
    btDica.addEventListener('click', darDica);

    function janelaDaCasca() {
      var a = document.getElementById('ajuda'), f = document.getElementById('fim');
      return !!((a && !a.hidden) || (f && !f.hidden));
    }
    var CODIGOS = { 37: 'ArrowLeft', 38: 'ArrowUp', 39: 'ArrowRight', 40: 'ArrowDown', 8: 'Backspace', 46: 'Delete', 78: 'n' };
    function noTeclado(e) {
      if (!E || fim || veu || janelaDaCasca() || e.altKey) return;
      var k = e.key, cod = e.keyCode || 0;
      if (!k || k === 'Unidentified') k = CODIGOS[cod] || (cod >= 48 && cod <= 57 ? String(cod - 48) : cod >= 96 && cod <= 105 ? String(cod - 96) : '');
      if ((e.ctrlKey || e.metaKey) && (k === 'z' || k === 'Z')) { desfazer(); e.preventDefault(); return; }
      if (e.ctrlKey || e.metaKey) return;
      var r = LIN[E.sel], c = COL[E.sel];
      if (k === 'ArrowUp' || k === 'Up') r = (r + 8) % 9;
      else if (k === 'ArrowDown' || k === 'Down') r = (r + 1) % 9;
      else if (k === 'ArrowLeft' || k === 'Left') c = (c + 8) % 9;
      else if (k === 'ArrowRight' || k === 'Right') c = (c + 1) % 9;
      else if (/^[1-9]$/.test(k)) { escrever(+k); e.preventDefault(); return; }
      else if (k === 'Backspace' || k === 'Delete' || k === 'Del' || k === '0') { apagar(); e.preventDefault(); return; }
      else if (k === 'n' || k === 'N') { alternarRascunho(); e.preventDefault(); return; }
      else return;
      E.sel = r * 9 + c; pintar(); e.preventDefault();
    }
    document.addEventListener('keydown', noTeclado);
    window.addEventListener('resize', medir);
    window.addEventListener('orientationchange', medir);

    /* ---- relógio: só corre com a partida à vista ---- */
    relogioId = setInterval(function () {
      if (!E || fim || veu || document.hidden || janelaDaCasca()) return;
      E.tempo++; pintarInfo();
      if (E.tempo % 5 === 0) salvar();
    }, 1000);

    /* ---- começo: continuar a partida guardada ou começar outra ---- */
    function perguntarContinuar(s) {
      E = s; hist = []; fim = false; medir(); pintar();
      var cheias = 0;
      for (var k = 0; k < 81; k++) if (s.val[k]) cheias++;
      veu = el('div', 'jt-sud-veu');
      var cx = el('div', 'jt-sud-caixa');
      cx.setAttribute('role', 'dialog'); cx.setAttribute('aria-modal', 'true');
      var h = el('h3'); h.textContent = t('Continuar a partida?', 'Continue your game?', '¿Seguir la partida?');
      var p = el('p');
      p.textContent = t('Você parou em ' + relogio(s.tempo) + ', com ' + cheias + ' de 81 casas preenchidas.',
        'You stopped at ' + relogio(s.tempo) + ', with ' + cheias + ' of 81 squares filled.',
        'Lo dejaste en ' + relogio(s.tempo) + ', con ' + cheias + ' de 81 casillas rellenas.');
      var b1 = el('button', 'jt-sud-bt'), b2 = el('button', 'jt-sud-bt jt-sud-bt2');
      b1.type = b2.type = 'button';
      b1.textContent = t('▶ Continuar', '▶ Continue', '▶ Seguir');
      b2.textContent = t('✨ Nova partida', '✨ New game', '✨ Nueva partida');
      b1.setAttribute('data-acao', 'continuar'); b2.setAttribute('data-acao', 'nova');
      cx.appendChild(h); cx.appendChild(p); cx.appendChild(b1); cx.appendChild(b2); veu.appendChild(cx);
      raiz.appendChild(veu);
      function fechar() { if (veu && veu.parentNode) veu.parentNode.removeChild(veu); veu = null; }
      b1.addEventListener('click', function () { ctx.som('toque'); fechar(); pintar(); });
      b2.addEventListener('click', function () { ctx.som('toque'); fechar(); partidaNova(); });
      timers.push(setTimeout(function () { try { b1.focus(); } catch (e) {} }, 30));
    }
    var salvo = ctx.ler(CH);
    if (recomeco) { ctx.gravar(CH, null); salvo = null; }
    if (salvoBom(salvo)) perguntarContinuar(salvo); else partidaNova();

    var api = {
      parar: function () {
        salvar();
        clearInterval(relogioId); clearTimeout(avisoId);
        for (var k = 0; k < timers.length; k++) clearTimeout(timers[k]);
        document.removeEventListener('keydown', noTeclado);
        window.removeEventListener('resize', medir);
        window.removeEventListener('orientationchange', medir);
        acabouDeParar = true;
        setTimeout(function () { acabouDeParar = false; }, 0);
      }
    };
    if (ctx.teste) api.estado = function () {
      return { sel: E.sel, val: E.val.slice(), sol: E.sol.slice(), pistas: E.pistas.slice(), notas: E.notas.slice(), tempo: E.tempo,
        dicas: E.dicas, rascunho: rascunho, fim: fim, continuar: !!veu };
    };
    return api;
  }

  var jogo = {
    id: 'sudoku',
    logica: logica,
    ajuda: function (t) {
      return '<p>' + t('Preencha a grade para que cada linha, cada coluna e cada quadrado 3×3 tenha os números de 1 a 9, sem repetir.',
        'Fill the grid so that every row, every column and every 3×3 box has the numbers 1 to 9, with no repeats.',
        'Rellena la cuadrícula para que cada fila, cada columna y cada cuadro de 3×3 tenga los números del 1 al 9, sin repetir.') + '</p>' +
        '<p>' + t('Toque numa casa e depois num número. ✏️ Rascunho escreve anotações pequenas; ⌫ apaga; ↶ desfaz; 💡 Dica põe o número certo numa casa.',
        'Tap a square, then a number. ✏️ Notes writes small pencil marks; ⌫ erases; ↶ undoes; 💡 Hint puts the right number in a square.',
        'Toca una casilla y luego un número. ✏️ Borrador escribe notas pequeñas; ⌫ borra; ↶ deshace; 💡 Pista pone el número correcto en una casilla.') + '</p>' +
        '<p>' + t('No fácil e no médio, o número errado fica vermelho na hora. No difícil, só no fim.',
        'On Easy and Medium a wrong number turns red right away. On Hard, only at the end.',
        'En fácil y medio, el número equivocado se pone rojo al momento. En difícil, solo al final.') + '</p>' +
        '<p>' + t('Teclado ou controle da TV: as setas andam, 1 a 9 escrevem, 0 ou Backspace apagam, N liga o rascunho.',
        'Keyboard or TV remote: arrows move, 1 to 9 write, 0 or Backspace erase, N turns notes on and off.',
        'Teclado o mando de la tele: las flechas mueven, del 1 al 9 escriben, 0 o Retroceso borran, N activa el borrador.') + '</p>' +
        '<p>' + t('A partida fica guardada no aparelho: ao voltar, toque em ▶ Continuar. O 🏆 é o melhor tempo sem dicas.',
        'Your game is saved on this device: when you come back, tap ▶ Continue. 🏆 is your best time without hints.',
        'La partida se guarda en el dispositivo: al volver, toca ▶ Seguir. El 🏆 es tu mejor tiempo sin pistas.') + '</p>';
    },
    iniciar: iniciar
  };

  if (typeof window !== 'undefined') (window.JogotecaJogos = window.JogotecaJogos || []).push(jogo);
  if (typeof module !== 'undefined' && module.exports) module.exports = jogo;
})();
