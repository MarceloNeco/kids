/* Meu Pequeno Amiguinho (pasta meu-amiguinho) — telas, etapas da oficina, máquina de fofura, voz, caixinha-casinha, certidão e coleção.
   Dados em dados.js (AmiguinhoDados), desenho em arte.js (AmiguinhoArte), regras e coleção em regras.js (AmiguinhoRegras),
   sons e vozes em voz.js (AmiguinhoVoz), pelúcia viva em vivo.js (AmiguinhoVivo). Com ?teste aparece window.AmiguinhoDebug.
   Versão: APP_VERSION aqui = VERSAO no sw.js = primeira entrada do versoes.json.
   Histórico: cada tela de dentro (cada etapa também) é uma entrada; o Voltar do celular volta uma etapa. */
(function () {
  'use strict';
  var APP_VERSION = '0.2.0', APP_DATA = '22/Nov/2026';
  var D = window.AmiguinhoDados, A = window.AmiguinhoArte, R = window.AmiguinhoRegras, V = window.AmiguinhoVoz, VIVO = window.AmiguinhoVivo;
  var $ = function (id) { return document.getElementById(id); };
  var TESTE = /[?&]teste\b/.test(location.search);
  var calmo = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  // trilha: ukulele, assobio e piano bem fofinhos, com instrumentos de verdade, que já moram na Bagunçolândia e na Rabiscolândia (créditos em CREDITOS.md)
  var B = '../baguncolandia/musicas/', RB = '../rabiscolandia/musicas/', KM = 'Kevin MacLeod', CC0 = 'CC0 1.0', CC = 'CC BY 4.0';
  var MUSICAS = [
    { a: B + 'llama-in-pajama.mp3', t: 'Llama in Pajama', au: 'Rafael Krux', lic: CC0 },
    { a: B + 'happy-whistling-ukulele.mp3', t: 'Happy Whistling Ukulele', au: 'Rafael Krux', lic: CC0 },
    { a: B + 'ukulele-song.mp3', t: 'Ukulele Song', au: 'Rafael Krux', lic: CC0 },
    { a: B + 'my-giant-bunny-friend.mp3', t: 'My Giant Bunny Friend', au: 'Bryan Teoh', lic: CC0 },
    { a: B + 'spring-chicken.mp3', t: 'Spring Chicken', au: 'Bryan Teoh', lic: CC0 },
    { a: B + 'funshine.mp3', t: 'Funshine', au: KM, lic: CC0 },
    { a: B + 'city-sunshine.mp3', t: 'City Sunshine', au: KM, lic: CC0 },
    { a: B + 'hippety-hop.mp3', t: 'Hippety Hop', au: 'Alexander Nakarada', lic: CC0 },
    { a: RB + 'music-to-delight.mp3', t: 'Music to Delight', au: KM, lic: CC },
    { a: RB + 'life-of-riley.mp3', t: 'Life of Riley', au: KM, lic: CC },
    { a: RB + 'carpe-diem.mp3', t: 'Carpe Diem', au: KM, lic: CC }
  ];

  /* ---------- guardado no aparelho ---------- */
  var CH_PREF = 'bolinho:meu-amiguinho:pref', CH_RASC = 'bolinho:meu-amiguinho:rascunho';
  function lerJSON(k, pad) { try { var v = JSON.parse(localStorage.getItem(k)); return v && typeof v === 'object' ? v : pad; } catch (e) { return pad; } }
  function gravarJSON(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var pref = { efeitos: lerJSON(CH_PREF, {}).efeitos !== false };   // (preferências antigas com "nivel" são só ignoradas)
  function salvarPref() { gravarJSON(CH_PREF, pref); }
  var col = R.Colecao();

  /* ---------- idioma ---------- */
  var lingua = window.BolinhoIdioma ? BolinhoIdioma.atual() : 'pt';
  var IDX = { pt: 0, en: 1, es: 2 };
  function li() { return IDX[lingua] || 0; }
  function t(pt, en, es) { return lingua === 'en' ? en : lingua === 'es' ? es : pt; }
  function tr(arr) { return arr ? (arr[li()] != null ? arr[li()] : arr[0]) : ''; }
  function dataTexto(iso) {   // PT 22/Nov/2026 · EN Nov/22/2026 · ES 22/nov/2026
    var M = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], ME = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], MS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    var p = String(iso || R.hoje()).split('-'), m = (+p[1] || 1) - 1, d = +p[2] || 1;
    return t(d + '/' + M[m] + '/' + p[0], ME[m] + '/' + d + '/' + p[0], d + '/' + MS[m] + '/' + p[0]);
  }
  function traduzir() {
    document.documentElement.lang = t('pt-BR', 'en-US', 'es-ES');
    document.title = t('Meu Pequeno Amiguinho', 'My Little Buddy', 'Mi Pequeño Amiguito') + ' — ' + t('Bolinho de Chuva', 'Rainy Day Donuts', 'Buñuelos de Lluvia') + ' · SolverONE';
    function parte(el, at) { var p = el.getAttribute(at).split('|'); return p[li()] != null ? p[li()] : p[0]; }
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = parte(el, 'data-t'); });
    document.querySelectorAll('[data-rotulo]').forEach(function (el) { el.setAttribute('aria-label', parte(el, 'data-rotulo')); });
    $('versao').textContent = t('Versão ', 'Version ', 'Versión ') + APP_VERSION + ' · ' + dataTexto('2026-11-22');
    pintarMenu();
    if (tela === 'oficina') pintarOficina(); else if (tela === 'amigo') pintarAmigo(); else if (tela === 'colecao') pintarColecao();
  }
  if (window.BolinhoIdioma) BolinhoIdioma.aoMudar(function (c) { lingua = c; traduzir(); });

  /* ---------- avisos ---------- */
  var avisoT = 0;
  function avisar(txt, ms) { var a = $('aviso'); a.textContent = txt; a.hidden = false; clearTimeout(avisoT); avisoT = setTimeout(function () { a.hidden = true; }, ms || 2200); }

  /* ---------- telas e histórico ---------- */
  var tela = 'menu', pilha = [], depoisDoMenu = null;
  var amigo = null, etapa = 0, encheuAgora = false, mostrado = null;
  function mostrar(id) {
    document.querySelectorAll('.tela').forEach(function (s) { s.classList.toggle('ativa', s.id === id); });
    tela = id; document.body.setAttribute('data-tela', id);
  }
  function ir(view) { pilha.push(view); try { history.pushState({ ma: pilha.length }, ''); } catch (e) {} abrir(view); }
  function abrir(view) {
    V.calar();
    if (!view || view.tela === 'menu') { mostrar('menu'); pintarMenu(); return; }
    if (view.tela === 'oficina') { if (!amigo) { amigo = R.novo(); } etapa = view.etapa || 0; mostrar('oficina'); pintarOficina(); return; }
    if (view.tela === 'amigo') { mostrado = col.obter(view.id) || mostrado; if (!mostrado) { voltarMenu(); return; } mostrar('amigo'); pintarAmigo(); return; }
    if (view.tela === 'colecao') { mostrar('colecao'); pintarColecao(); }
  }
  window.addEventListener('popstate', function (ev) {
    var st = ev.state || {}, n = st.ma || 0;
    if (n > pilha.length) n = pilha.length;
    pilha.length = n;
    abrir(pilha[n - 1] || { tela: 'menu' });
    if (n === 0 && depoisDoMenu) { var f = depoisDoMenu; depoisDoMenu = null; setTimeout(f, 0); }
  });
  function voltarMenu(depois) {
    if (pilha.length) { depoisDoMenu = depois || null; history.go(-pilha.length); }
    else { abrir({ tela: 'menu' }); if (depois) depois(); }
  }
  if (window.BolinhoNav) BolinhoNav.iniciar({ jogo: 'meu-amiguinho', noInicio: function () { return tela === 'menu'; }, irParaInicio: function () { voltarMenu(); },
    emAndamento: function () { return tela === 'oficina'; } });

  /* ---------- começo ---------- */
  function pintarMenu() {
    $('btEfeitos').textContent = pref.efeitos ? '🔊' : '🔇';
    var lista = col.listar();
    $('nColecao').textContent = String(lista.length);
    $('btContinuar').hidden = !lerJSON(CH_RASC, null);
    var est = $('estante'), mostrar3 = lista.slice(0, 3);
    if (mostrar3.length < 3) mostrar3.splice(1, 0, (function () { var x = R.novo('urso'); R.porAcess(x, 'laco'); return x; })());
    est.innerHTML = mostrar3.map(function (x, i) { return '<div class="na-estante">' + A.svg(x, { id: 'es' + i }) + '</div>'; }).join('');
  }
  function comecar() {
    V.acordar();
    amigo = R.novo(); encheuAgora = false;
    guardarRascunho();
    ir({ tela: 'oficina', etapa: 0 });
  }
  $('btCriar').addEventListener('click', comecar);
  $('btContinuar').addEventListener('click', function () {
    var r = lerJSON(CH_RASC, null), a = r && R.validar(r.amigo);
    if (!a) { comecar(); return; }
    amigo = a; encheuAgora = true;   // rascunho antigo com nivel/enc: esses campos são ignorados
    ir({ tela: 'oficina', etapa: r.etapa || 0 });
  });
  $('btColecao').addEventListener('click', function () { V.toque(); ir({ tela: 'colecao' }); });
  $('btEfeitos').addEventListener('click', function () { pref.efeitos = !pref.efeitos; V.ligar(pref.efeitos); salvarPref(); pintarMenu(); V.toque(); });
  $('btAjuda').addEventListener('click', function () { $('ajuda').hidden = false; $('btFecharAjuda').focus(); });
  $('btFecharAjuda').addEventListener('click', function () { $('ajuda').hidden = true; $('btAjuda').focus(); });
  V.ligar(pref.efeitos);
  function guardarRascunho() { gravarJSON(CH_RASC, amigo ? { amigo: amigo, etapa: etapa } : null); }

  /* ---------- a oficina ---------- */
  var vOf = null;   // a pelúcia viva da oficina
  function atualizarPelucia() {
    var caixa = $('pelucia'), a = amigo;
    if (etapa === 2 && !encheuAgora) a = Object.assign({}, amigo, { fofura: 6 });   // começa murchinha, encostada no bico
    if (!vOf) vOf = VIVO.criar(caixa, a, { id: 'of', danca: true, rotulo: t('Seu amiguinho', 'Your buddy', 'Tu amiguito') });
    else vOf.trocar(a);
    guardarRascunho();
  }
  function pintarOficina() {
    var E = D.ETAPAS[etapa];
    $('seloNum').textContent = String(etapa + 1);
    $('etTitulo').textContent = tr(E.titulo);
    $('etSub').textContent = tr(E.sub);
    $('etConta').textContent = t((etapa + 1) + '\u00a0de\u00a07', (etapa + 1) + '\u00a0of\u00a07', (etapa + 1) + '\u00a0de\u00a07');   // "5 de 7" não se separa na quebra de linha
    var pts = $('pontos'); pts.innerHTML = '';
    D.ETAPAS.forEach(function (x, i) { var l = document.createElement('li'); l.className = i === etapa ? 'atual' : i < etapa ? 'feito' : ''; pts.appendChild(l); });
    $('btProximo').hidden = etapa === 6;
    $('oficina').setAttribute('data-etapa', E.id);
    $('maquina').hidden = etapa !== 2; $('medidor').hidden = etapa !== 2;
    if (etapa === 2) { if (!$('maquina').firstChild) $('maquina').innerHTML = A.maquina({ id: 'mq' }); pintarMedidor(); }
    $('fala').hidden = true;
    if (pintarOficina.etapa !== etapa) { tomAberto = null; grupoRoupa = null; pintarOficina.etapa = etapa; }
    atualizarPelucia();
    $('painel').scrollTop = 0;
    PAINEL[E.id](); depoisDoPainel();
    if (E.id === 'bicho') mostrarFala(falaBase());
  }
  function irEtapa(n) { if (n < 0 || n > 6 || n === etapa) return; V.toque(); ir({ tela: 'oficina', etapa: n }); }
  $('btProximo').addEventListener('click', function () { irEtapa(etapa + 1); });
  $('btVoltar').addEventListener('click', function () { V.toque(); history.back(); });
  $('btPronto').addEventListener('click', function () { terminar(); });
  $('pontos').addEventListener('click', function (e) { var l = e.target.closest('li'); if (!l) return; irEtapa([].indexOf.call(l.parentNode.children, l)); });
  $('pelucia').addEventListener('click', function () { if (vOf) { vOf.tocar(); V.pop(); } });

  // o balão aparece embaixo do bichinho, some sozinho (5 s) e fecha num toque (dono, 22/Nov/2026: "o escrito tampa toda a cabeça")
  function mostrarFala(txt, ms) { var f = $('fala'); f.textContent = txt; f.hidden = !txt; clearTimeout(mostrarFala.t); if (txt) mostrarFala.t = setTimeout(function () { f.hidden = true; }, ms || 5000); }
  function falaBase() { var b = D.base[amigo.base]; return tr(b.apelido) + ': ' + tr(b.frase); }

  // pedaços de painel
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function linha(rotulo, roda) { var l = el('div', 'linha'); if (rotulo) l.appendChild(el('span', 'rot', rotulo)); var r = el('div', 'roda' + (roda ? ' ' + roda : '')); r.setAttribute('role', 'radiogroup'); r.setAttribute('aria-label', rotulo || ''); l.appendChild(r); return { l: l, r: r }; }
  function opc(conteudo, sel, rotulo, dados) {
    var b = el('button', 'opc' + (sel ? ' sel' : ''), conteudo); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(!!sel));
    if (rotulo) { b.setAttribute('aria-label', rotulo); b.title = rotulo; }
    Object.keys(dados || {}).forEach(function (k) { b.dataset[k] = dados[k]; });
    return b;
  }
  function amostraCor(hex) { return '<i class="amostra" style="background:' + hex + '"></i>'; }
  function amostraPelo(p) { return '<i class="amostra" style="background:' + (p.grad ? 'linear-gradient(135deg,' + p.grad.join(',') + ')' : p.cor) + '"></i>'; }
  function rolarAteSel(caixa) { var s = caixa.querySelector('.sel'); if (s && caixa.scrollWidth > caixa.clientWidth) caixa.scrollLeft = Math.max(0, s.offsetLeft - caixa.offsetLeft - caixa.clientWidth / 2 + s.offsetWidth / 2); }
  /* barra de tom (dono, 22/Nov/2026: "assim como no Purpurina, aquele botão de arrastar… mais escuro, mais claro, com vários
     tons"): aparece embaixo das bolinhas depois de tocar numa cor (do pelo, da roupa, da parte de baixo ou do acessório);
     arrastando, o amiguinho muda na hora; o fundo mostra o degradê do claro ao escuro daquela cor. */
  var tomAberto = null;   // 'pelo' | 'roupa' | 'baixo' | 'acess:<id>'
  function linhaTom(parte, id, hex) {
    var l = el('div', 'linha-tom'), rot = t('Mais claro ou mais escuro', 'Lighter or darker', 'Más claro o más oscuro');
    l.appendChild(el('span', 'rot rot-tom', rot));
    $('painel').classList.add('com-tom');
    var b = el('label', 'barra', '<span class="barra-ponta" aria-hidden="true">☀️</span><input type="range" min="-100" max="100" step="1"><span class="barra-ponta" aria-hidden="true">🌙</span>');
    var r = b.querySelector('input'), raf = 0;
    r.value = String(Math.round(R.tomDe(amigo, parte, id) * 100));
    r.setAttribute('aria-label', rot); r.dataset.tom = parte;
    r.style.background = 'linear-gradient(90deg, ' + A.comTom(hex, -1) + ', ' + hex + ', ' + A.comTom(hex, 1) + ')';
    r.addEventListener('input', function () {
      R.tom(amigo, parte, +r.value / 100, id);
      if (!raf) raf = requestAnimationFrame(function () { raf = 0; if (vOf) vOf.trocar(amigo); });
    });
    r.addEventListener('change', function () { guardarRascunho(); });
    l.appendChild(b);
    return l;
  }
  var cacheMini = {};
  function mini(chave, f) { if (!cacheMini[chave]) cacheMini[chave] = f(); return cacheMini[chave]; }

  /* Miniatura que MOSTRA o acessório (dono, 22/Nov/2026: "a mochila é só o ursinho de frente"): desenha o bichinho com e
     sem a peça, acha as partes novas do desenho, dá zoom nelas (pés para sapatos, cabeça para laços e óculos, mão para
     bolsas…) e, se a peça fica escondida atrás do corpo (mochila nas costas), mostra a peça sozinha, inteira, como na
     vitrine da loja. Vale para qualquer acessório novo do dados.js/arte.js, sem lista fixa aqui. */
  var medidor = null;
  function folhas(svg) {   // as formas desenhadas (sem os <defs>), na ordem
    return [].filter.call(svg.querySelectorAll('*'), function (e) { return !e.firstElementChild && !e.closest('defs, clipPath, mask, pattern, linearGradient, radialGradient, title'); });
  }
  function chaveFolha(e) {   // a forma sem os ids (os ids dos degradês mudam quando entra uma peça nova)
    var k = e.tagName;
    [].slice.call(e.attributes).map(function (at) { return at.name === 'id' ? '' : at.name + '=' + at.value.replace(/url\(#[^)]*\)/g, 'url()').replace(/^#.*/, '#'); }).sort().forEach(function (x) { k += '|' + x; });
    return k;
  }
  function miniDoAcess(a, id, cor, idSvg) {
    var it = D.acess[id]; if (!it) return '';
    var b = Object.assign({}, a, { acess: {}, roupa: 'nenhuma', baixo: null, corAcess: {}, tom: a.tom && a.tom.pelo ? { pelo: a.tom.pelo } : undefined });
    b.acess[it.caixa] = id; if (cor) b.corAcess[id] = cor;
    if (b.corpo === 'q' && it.so === 'pe') b.corpo = 'pe';
    var com = A.svg(b, { id: idSvg }), sem = A.svg(Object.assign({}, b, { acess: {} }), { id: idSvg + 's' });
    if (!medidor) { medidor = el('div'); medidor.setAttribute('aria-hidden', 'true'); medidor.style.cssText = 'position:fixed;left:-2000px;top:0;width:300px;height:396px;visibility:hidden;pointer-events:none'; document.body.appendChild(medidor); }
    medidor.innerHTML = sem + com;
    var svgs = medidor.querySelectorAll('svg'), vSem = svgs[0], vCom = svgs[1];
    [vSem, vCom].forEach(function (v) { v.style.cssText = 'position:absolute;left:0;top:0;width:300px;height:396px'; v.setAttribute('viewBox', '0 -24 300 396'); });
    var conta = {};
    folhas(vSem).forEach(function (e) { var k = chaveFolha(e); conta[k] = (conta[k] || 0) + 1; });
    var todas = folhas(vCom), novas = [];
    todas.forEach(function (e) { var k = chaveFolha(e); if (conta[k]) conta[k]--; else novas.push(e); });
    var puro = !Object.keys(conta).some(function (k) { return conta[k] > 0; });   // a peça só acrescentou (não mudou a pose)
    var o = vCom.getBoundingClientRect();
    function caixa(e) { var r = e.getBoundingClientRect(); return { x: r.left - o.left, y: r.top - o.top - 24, w: r.width, h: r.height }; }
    var cxs = novas.map(caixa).filter(function (c) { return c.w > 0 || c.h > 0; });
    if (!cxs.length) { medidor.innerHTML = ''; return A.miniAcess(a, id, { id: idSvg }); }
    var x0 = Math.min.apply(null, cxs.map(function (c) { return c.x; })), y0 = Math.min.apply(null, cxs.map(function (c) { return c.y; }));
    var x1 = Math.max.apply(null, cxs.map(function (c) { return c.x + c.w; })), y1 = Math.max.apply(null, cxs.map(function (c) { return c.y + c.h; }));
    var lado = Math.max(110, Math.min(396, Math.max(x1 - x0, y1 - y0) * 1.3 + 24)), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    var vb = [cx - lado / 2, cy - lado / 2, lado, lado].map(function (v) { return Math.round(v * 10) / 10; });
    // atrás do corpo? (uma parte grande da peça fica metade ou mais coberta por uma forma desenhada depois): a peça sozinha
    var atras = puro && novas.some(function (e) {
      var c = caixa(e), area = c.w * c.h, i = todas.indexOf(e); if (area < 100) return false;
      return todas.slice(i + 1).some(function (f) {
        if (novas.indexOf(f) >= 0) return false;
        var d = caixa(f), w = Math.min(c.x + c.w, d.x + d.w) - Math.max(c.x, d.x), h = Math.min(c.y + c.h, d.y + d.h) - Math.max(c.y, d.y);
        return w > 0 && h > 0 && w * h >= area * 0.5;
      });
    });
    var res;
    if (atras) {
      var raizM = vCom.getScreenCTM().inverse(), defs = vCom.querySelector('defs');
      res = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb.join(' ') + '" class="ma-svg" aria-hidden="true">' + (defs ? defs.outerHTML : '') +
        novas.map(function (e) { var m = raizM.multiply(e.getScreenCTM()); return '<g transform="matrix(' + [m.a, m.b, m.c, m.d, m.e, m.f].map(function (v) { return Math.round(v * 1000) / 1000; }).join(' ') + ')">' + e.outerHTML + '</g>'; }).join('') + '</svg>';
    } else res = com.replace(/viewBox="[^"]*"/, 'viewBox="' + vb.join(' ') + '"');
    medidor.innerHTML = '';
    return res;
  }
  // nomes que não cabem em 2 linhas no cartão (3 no rótulo da caixinha do balcão, que é estreita): a fonte diminui um
  // pouco (até 7,5 px), nunca reticências
  function encaixarTextos(raiz) {
    raiz.querySelectorAll('.opc small, .opc span, .acrilico small').forEach(function (e) {
      e.style.fontSize = ''; e.style.overflowWrap = 'normal';   // mede sem partir palavra no meio
      var f = parseFloat(getComputedStyle(e).fontSize), pai = e.parentNode, max = pai.classList.contains('acrilico') ? 3 : 2;
      function sobra() { var lh = parseFloat(getComputedStyle(e).lineHeight) || f * 1.15; return e.scrollWidth > e.clientWidth + 1 || e.offsetWidth > pai.clientWidth || e.offsetHeight > lh * max + 2; }
      while (f > 7.5 && sobra()) { f -= 0.5; e.style.fontSize = f + 'px'; }
      e.style.overflowWrap = '';
    });
  }
  function depoisDoPainel() { encaixarTextos($('painel')); marcarRolagem($('painel')); }
  function limparPainel() { var p = $('painel'); p.innerHTML = ''; p.classList.remove('com-tom'); return p; }
  // fileira que corre para o lado: marca se tem mais para ver (a ponta fica esfumada até chegar no fim)
  function marcarRolagem(raiz) {
    raiz.querySelectorAll('.roda').forEach(function (r) {
      var ver = function () { r.classList.toggle('rola', r.scrollWidth > r.clientWidth + 2); r.classList.toggle('fim', r.scrollLeft + r.clientWidth >= r.scrollWidth - 4); };
      ver(); if (!r.dataset.vigia) { r.dataset.vigia = '1'; r.addEventListener('scroll', ver, { passive: true }); }
    });
  }

  var PAINEL = {
    bicho: function () {
      var p = limparPainel();
      var L = linha(t('Escolha o seu bichinho', 'Choose your buddy', 'Elige tu animalito'), 'bichos');
      D.BASES.forEach(function (b) {
        var a = R.novo(b.id);
        var svg = mini('cab-' + b.id, function () { return A.svg(a, { id: 'tb' + b.id, vista: 'cabeca' }); });
        L.r.appendChild(opc(svg + '<span>' + tr(b.apelido) + '</span><small>' + tr(b.esp) + '</small>', amigo.base === b.id, tr(b.esp) + ' ' + tr(b.apelido), { base: b.id }));
      });
      p.appendChild(L.l);
      var b = D.base[amigo.base];
      if (b.corpos.length > 1) {
        var C = linha(t('Como ele fica?', 'How does it stand?', '¿Cómo se queda?'));
        b.corpos.forEach(function (c) { C.r.appendChild(opc(c === 'pe' ? t('🧍 Em pé', '🧍 Standing', '🧍 De pie') : t('🐾 De 4 patas', '🐾 On 4 paws', '🐾 A 4 patas'), amigo.corpo === c, null, { corpo: c })); });
        p.appendChild(C.l);
      }
      rolarAteSel(L.r);
    },
    pelo: function () {
      var p = limparPainel();
      var L1 = linha(t('Cor do pelo', 'Fur color', 'Color del pelo'));
      D.PELOS.forEach(function (x) { L1.r.appendChild(opc(amostraPelo(x), amigo.pelo === x.id, tr(x.n), { pelo: x.id })); });
      var L2 = linha(t('Olhinhos', 'Eyes', 'Ojitos'));
      D.OLHOS.forEach(function (x) { L2.r.appendChild(opc(amostraCor(x.cor), amigo.olhos === x.id, tr(x.n), { olhos: x.id })); });
      D.ESTILOS_OLHO.forEach(function (x) { L2.r.appendChild(opc('<span>' + tr(x.n) + '</span>', amigo.estiloOlho === x.id, null, { estiloOlho: x.id })); });
      var L3 = linha(t('Bochechas', 'Cheeks', 'Mejillas'));
      D.BOCHECHAS.forEach(function (x) { L3.r.appendChild(opc('<span>' + tr(x.n) + '</span>', amigo.bochecha === x.id, null, { bochecha: x.id })); });
      p.appendChild(L1.l);
      if (tomAberto === 'pelo') { var pe = D.pelo[amigo.pelo]; p.appendChild(linhaTom('pelo', null, pe.grad ? pe.grad[Math.floor(pe.grad.length / 2)] : pe.cor)); }
      p.appendChild(L2.l); p.appendChild(L3.l);
      rolarAteSel(L1.r);
    },
    fofura: function () {
      var p = limparPainel();
      var L1 = linha(t('Coraçãozinho', 'Little heart', 'Corazoncito'));
      D.CORACOES.forEach(function (x) { L1.r.appendChild(opc('<i class="cor-coracao" style="' + (x.grad ? 'background:linear-gradient(135deg,' + x.grad.join(',') + ')' : 'background:' + x.cor) + '"></i>', amigo.coracao === x.id, tr(x.n), { coracao: x.id })); });
      p.appendChild(L1.l);
      var d = el('div', 'desejo');
      d.innerHTML = '<button id="btDesejo" type="button" class="bt-desejo" aria-label="' + t('Segure para dar um beijinho', 'Hold to give a kiss', 'Mantén para dar un besito') + '"><i class="cor-coracao grande"></i></button><p>' +
        (amigo.desejo ? t('💖 O coraçãozinho já está dentro, com o seu desejo!', '💖 The little heart is inside, with your wish!', '💖 ¡El corazoncito ya está dentro, con tu deseo!') : t('Segure o coração, dê um beijinho e faça um desejo.', 'Hold the heart, give it a kiss and make a wish.', 'Mantén el corazón, dale un besito y pide un deseo.')) + '</p>';
      p.appendChild(d);
      var x = D.coracao[amigo.coracao] || D.CORACOES[1];
      d.querySelector('.cor-coracao').style.background = x.grad ? 'linear-gradient(135deg,' + x.grad.join(',') + ')' : x.cor;
      segurar($('btDesejo'), 900, function (f) { $('btDesejo').style.setProperty('--f', f); }, function () { fazerDesejo(); });
      var m = el('div', 'linha-maquina');
      m.innerHTML = '<button id="btEncher" type="button" class="principal bt-encher">' + t('💨 Segure para encher', '💨 Hold to fill', '💨 Mantén para rellenar') + '</button>' +
        '<button id="btApertao" type="button" class="mini largo">' + t('🤗 Apertão', '🤗 Squeeze', '🤗 Apretón') + '</button>';
      p.appendChild(m);
      p.appendChild(el('p', 'dica', '<span id="dicaFofura">' + dicaFofura() + '</span>'));
      ligarMaquina();
    },
    roupa: function () {
      var p = limparPainel();
      /* guarda-roupa em grupos (dono, 22/Nov/2026: "vários tipos de saias, vários tipos de shortinhos"), como o balcão da
         etapa 5: Roupas inteiras · Partes de cima · Saias e shorts, todos à vista; a roupa inteira tira a parte de baixo */
      var R0 = D.roupa[amigo.roupa], gr = grupoRoupa || (R0 && R0.grupo) || (amigo.baixo ? 'baixo' : 'inteira');
      var prat = el('div', 'balcao prateleira'); prat.setAttribute('role', 'tablist'); prat.setAttribute('aria-label', t('Guarda-roupa', 'Wardrobe', 'Armario'));
      D.GRUPOS_ROUPA.forEach(function (g) {
        var tem = g.id === 'baixo' ? !!amigo.baixo : !!(R0 && R0.grupo === g.id);
        var b = el('button', 'acrilico' + (gr === g.id ? ' aberta' : '') + (tem ? ' tem' : ''), '<span class="ico" aria-hidden="true">' + g.ico + '</span><small>' + tr(g.n) + '</small>');
        b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(gr === g.id)); b.dataset.grupo = g.id;
        prat.appendChild(b);
      });
      p.appendChild(prat);
      var G = D.GRUPOS_ROUPA.filter(function (g) { return g.id === gr; })[0];
      var L1 = linha(null, 'cabides'); L1.r.setAttribute('aria-label', tr(G.n));   // (o nome do grupo já está na prateleira)
      if (gr === 'baixo') {
        L1.r.appendChild(opc('<span>✕ ' + t('Nada', 'None', 'Nada') + '</span>', !amigo.baixo, null, { baixo: 'nenhum' }));
        D.BAIXOS.forEach(function (x) {
          var svg = mini('cbb-' + x.id, function () { var a = R.novo('urso'); R.vestirBaixo(a, x.id); return A.cabideBaixo(a, x.id, { id: 'cbb' + x.id }); });
          var b = opc(svg + '<small>' + tr(x.n) + '</small>', amigo.baixo === x.id, tr(x.n), { baixo: x.id });
          if (!R.podeVestir(amigo, x.id, true)) { b.disabled = true; b.title = t('Só para quem fica em pé', 'Only for standing buddies', 'Solo para los que están de pie'); }
          L1.r.appendChild(b);
        });
        p.appendChild(L1.l);
        var X0 = D.baixo[amigo.baixo];
        if (X0 && X0.cores) {
          var Lb = linha(t('Cor', 'Color', 'Color'));
          D.PALETAS[X0.paleta || 'roupa'].forEach(function (c) { Lb.r.appendChild(opc(amostraCor(D.CORES[c].hex), amigo.corBaixo === c, tr(D.CORES[c].n), { corBaixo: c })); });
          p.appendChild(Lb.l);
          if (tomAberto === 'baixo' && D.CORES[amigo.corBaixo]) p.appendChild(linhaTom('baixo', null, D.CORES[amigo.corBaixo].hex));
        }
        rolarAteSel(L1.r);
        return;
      }
      D.ROUPAS.forEach(function (r) {
        if (r.id !== 'nenhuma' && r.grupo !== gr) return;
        var svg = mini('cb-' + r.id + '-' + lingua, function () { var a = R.novo('urso'); R.vestir(a, r.id); a.lang = lingua; return A.cabide(a, r.id, { id: 'cb' + r.id }); });
        var b = opc(svg + '<small>' + tr(r.n) + '</small>', amigo.roupa === r.id, tr(r.n), { roupa: r.id });
        if (!R.podeVestir(amigo, r.id)) { b.disabled = true; b.title = t('Só para quem fica em pé', 'Only for standing buddies', 'Solo para los que están de pie'); }
        L1.r.appendChild(b);
      });
      p.appendChild(L1.l);
      if (R0 && R0.grupo !== gr) R0 = null;   // cor, estampa e patch: da roupa deste grupo
      if (R0 && R0.cores) {
        var L2 = linha(t('Cor', 'Color', 'Color'));
        D.PALETAS[R0.paleta || 'roupa'].forEach(function (c) { L2.r.appendChild(opc(amostraCor(D.CORES[c].hex), amigo.corRoupa === c, tr(D.CORES[c].n), { corRoupa: c })); });
        p.appendChild(L2.l);
        if (tomAberto === 'roupa' && D.CORES[amigo.corRoupa]) p.appendChild(linhaTom('roupa', null, D.CORES[amigo.corRoupa].hex));
      }
      if (R0 && R0.estampa) {
        var L3 = linha(t('Estampa', 'Print', 'Estampado'));
        D.ESTAMPAS.forEach(function (x) { L3.r.appendChild(opc('<span>' + tr(x.n) + '</span>', amigo.estampa === x.id, null, { estampa: x.id })); });
        p.appendChild(L3.l);
      }
      if (R0) {
        var L4 = linha(t('Patch no peito', 'Chest patch', 'Parche en el pecho'), 'patches');
        D.PATCHES.forEach(function (x) {
          var ico = x.letra ? '<b>' + x.letra + '</b>' : x.id === 'nenhum' ? '<span>' + tr(x.n) + '</span>' : { coracao: '❤️', 'arco-iris': '🌈', estrela: '⭐', capivara: '<b class="capi">ᴖᴥᴖ</b>' }[x.id];
          L4.r.appendChild(opc(ico, (amigo.patch || 'nenhum') === x.id, tr(x.n), { patch: x.id }));
        });
        p.appendChild(L4.l);
      }
      rolarAteSel(L1.r);
    },
    acess: function () {
      var p = limparPainel();
      var balcao = el('div', 'balcao'); balcao.setAttribute('role', 'tablist'); balcao.setAttribute('aria-label', t('Balcão de acessórios', 'Accessory counter', 'Mostrador de accesorios'));
      var ICO = { laco: '🎀', cabeca: '👑', olhos: '👓', pescoco: '📿', pulso: '💎', costas: '🎒', mao: '🪄', colo: '🧸', abraco: '🦄', pes: '👟', chao: '🛹', apoio: '♿' };
      D.CAIXAS.forEach(function (cx) {
        var itens = D.ACESS.filter(function (it) { return it.caixa === cx.id; });
        if (!itens.length) return;
        var tem = amigo.acess[cx.id];
        var b = el('button', 'acrilico' + (caixaAberta === cx.id ? ' aberta' : '') + (tem ? ' tem' : ''), '<span class="ico" aria-hidden="true">' + (cx.ico || ICO[cx.id] || '🎁') + '</span><small>' + tr(cx.n) + '</small>');
        b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(caixaAberta === cx.id)); b.dataset.caixa = cx.id;
        balcao.appendChild(b);
      });
      p.appendChild(balcao);
      var it0 = D.caixa[caixaAberta];
      var L = linha(tr(it0.n), 'itens');
      L.r.appendChild(opc('<span>✕ ' + t('Nada', 'None', 'Nada') + '</span>', !amigo.acess[caixaAberta], null, { tirar: caixaAberta }));
      D.ACESS.filter(function (it) { return it.caixa === caixaAberta; }).forEach(function (it) {
        var pode = R.podeUsar(amigo, it.id);
        var cor = (amigo.corAcess && amigo.corAcess[it.id]) || it.cor || '';
        var svg = mini('ac-' + amigo.base + amigo.corpo + amigo.pelo + R.tomDe(amigo, 'pelo') + it.id + cor, function () { return miniDoAcess(amigo, it.id, cor, 'ac' + it.id); });
        var b = opc(svg + '<small>' + tr(it.n) + '</small>', amigo.acess[caixaAberta] === it.id, tr(it.n), { acess: it.id });
        if (!pode) { b.disabled = true; b.title = t('Só para quem fica em pé', 'Only for standing buddies', 'Solo para los que están de pie'); }
        L.r.appendChild(b);
      });
      p.appendChild(L.l);
      var atual = D.acess[amigo.acess[caixaAberta]];
      if (atual && atual.paleta) {
        var L2 = linha(t('Cor', 'Color', 'Color'));
        D.PALETAS[atual.paleta].forEach(function (c) { var hex = c === 'holo' ? 'linear-gradient(135deg,#f8c6f0,#c6e8f8,#e8f8c6)' : D.CORES[c].hex; L2.r.appendChild(opc(amostraCor(hex), ((amigo.corAcess || {})[atual.id] || atual.cor) === c, tr(D.CORES[c].n), { corAcess: c, item: atual.id })); });
        p.appendChild(L2.l);
        var corA = (amigo.corAcess || {})[atual.id] || atual.cor;   // (o holográfico é arco-íris: não tem claro e escuro)
        if (tomAberto === 'acess:' + atual.id && corA !== 'holo' && D.CORES[corA]) p.appendChild(linhaTom('acess', atual.id, D.CORES[corA].hex));
      }
      rolarAteSel(L.r);
    },
    voz: function () {
      var p = limparPainel();
      var i = amigo.frase || 0, fr = amigo.frases[i] || { pronta: 'teamo' };
      var abas = el('div', 'abas');
      amigo.frases.forEach(function (f, k) { var b = el('button', 'aba' + (k === i ? ' sel' : ''), t('Frase ', 'Phrase ', 'Frase ') + (k + 1)); b.type = 'button'; b.dataset.frase = String(k); abas.appendChild(b); });
      if (amigo.frases.length < 2) { var mais = el('button', 'aba mais', t('+ outra frase', '+ another phrase', '+ otra frase')); mais.type = 'button'; mais.dataset.maisFrase = '1'; abas.appendChild(mais); }
      else { var menos = el('button', 'aba menos', '✕'); menos.type = 'button'; menos.dataset.tirarFrase = String(i); menos.setAttribute('aria-label', t('Tirar esta frase', 'Remove this phrase', 'Quitar esta frase')); abas.appendChild(menos); }
      var ouvir = el('button', 'aba ouvir', t('▶ Ouvir', '▶ Listen', '▶ Oír')); ouvir.type = 'button'; ouvir.dataset.ouvir = '1'; abas.appendChild(ouvir);
      p.appendChild(abas);
      var L1 = linha(t('Frases prontas', 'Ready phrases', 'Frases listas'));
      D.FRASES.forEach(function (f) { L1.r.appendChild(opc('<span>' + R.textoFrase({ pronta: f.id }, lingua, amigo.crianca).replace(/[!?¡¿.]/g, '') + '</span>', !fr.gravada && fr.pronta === f.id, null, { pronta: f.id })); });
      p.appendChild(L1.l);
      var esc = el('div', 'escrever');
      esc.innerHTML = '<input id="txtFrase" type="text" maxlength="60" autocomplete="off" placeholder="' + t('…ou escreva a sua frase', '…or write your own', '…o escribe la tuya') + '" aria-label="' + t('Escreva a frase', 'Write the phrase', 'Escribe la frase') + '">';
      p.appendChild(esc);
      var inp = esc.querySelector('input');
      inp.value = !fr.gravada && !fr.pronta ? fr.texto || '' : '';
      inp.addEventListener('input', function () { amigo.frases[i] = { texto: inp.value.slice(0, 60) }; marcarProntas(); guardarRascunho(); });
      var gv = el('div', 'gravar');
      var pode = V.podeGravar();
      gv.innerHTML = '<button id="btGravar" type="button" class="secundario"' + (pode ? '' : ' disabled') + '>' + (fr.gravada ? t('🔁 Gravar de novo', '🔁 Record again', '🔁 Grabar otra vez') : t('🎙️ Gravar (5 s)', '🎙️ Record (5 s)', '🎙️ Grabar (5 s)')) + '</button>' +
        '<label class="efeito"><input id="chkEfeito" type="checkbox"' + (fr.gravada && fr.efeito === false ? '' : ' checked') + '> ' + t('voz de bichinho', 'critter voice', 'voz de animalito') + '</label><i id="barraGrav" class="barra-grav"></i>';
      p.appendChild(gv);
      var L2 = linha(t('Jeito de falar', 'How it talks', 'Forma de hablar'));
      // voz de menininha ou de menininho (dono, 22/Nov/2026): vem do bichinho, a criança troca quando quiser
      var gen = R.genero(amigo);
      L2.r.appendChild(opc('<span>' + t('♀ Menininha', '♀ Little girl', '♀ Niña') + '</span>', gen === 'f', null, { genero: 'f' }));
      L2.r.appendChild(opc('<span>' + t('♂ Menininho', '♂ Little boy', '♂ Niño') + '</span>', gen === 'm', null, { genero: 'm' }));
      D.VOZES.filter(function (v) { return v.tipo === 'fala'; }).forEach(function (v) { L2.r.appendChild(opc('<span>' + v.ico + ' ' + tr(v.n) + '</span>', amigo.voz === v.id, null, { voz: v.id })); });
      D.VOZES.filter(function (v) { return v.tipo === 'som'; }).forEach(function (v) { L2.r.appendChild(opc('<span>' + v.ico + ' ' + tr(v.n) + '</span>', amigo.som === v.id, null, { som: v.id })); });
      p.appendChild(L2.l);
      p.appendChild(el('p', 'privado', t('🔒 A gravação fica só neste aparelho. Nada é enviado. Gravar a sua voz é o jeito mais fofo!', '🔒 The recording stays on this device only. Nothing is sent. Recording your own voice is the cutest way!', '🔒 La grabación se queda solo en este aparato. No se envía nada. ¡Grabar tu voz es lo más tierno!') + (pode ? '' : ' ' + t('(Este aparelho não deixa gravar: use uma frase pronta.)', '(This device can\'t record: use a ready phrase.)', '(Este aparato no puede grabar: usa una frase lista.)'))));
      $('btGravar').addEventListener('click', gravarFrase);
      $('chkEfeito').addEventListener('change', function () { if (amigo.frases[i].gravada) { amigo.frases[i].efeito = this.checked; guardarRascunho(); } });
    },
    nome: function () {
      var p = limparPainel();
      var b = D.base[amigo.base];
      var f = el('div', 'formulario');
      var campo = function (id, rot, val, ph, max) { return '<label class="campo"><span>' + rot + '</span><input id="' + id + '" type="text" maxlength="' + (max || 20) + '" autocomplete="off" value="' + A.util.esc(val || '') + '" placeholder="' + A.util.esc(ph || '') + '"></label>'; };
      f.innerHTML = '<div class="nome-linha">' + campo('inNome', t('Meu nome', 'My name', 'Mi nombre'), amigo.nome, tr(b.apelido)) + '<button id="btSortear" type="button" class="mini" aria-label="' + t('Sortear um nome', 'Pick a random name', 'Sortear un nombre') + '">🎲</button></div>' +
        (amigo.acess.colo === 'filhote' ? campo('inFilhote', t('Nome do filhotinho', 'Baby\'s name', 'Nombre del bebé'), amigo.nomeFilhote, '') : '') +
        campo('inCrianca', t('Quem vai cuidar de mim? (aparece na frase)', 'Who will look after me? (goes in my phrase)', '¿Quién me va a cuidar? (sale en la frase)'), amigo.crianca, '') +
        campo('inPadrinho', t('Padrinho ou madrinha (se quiser)', 'Godparent (optional)', 'Padrino o madrina (si quieres)'), amigo.padrinho, '', 30) +
        '<p class="nasceu">🎂 ' + t('Nasce hoje: ', 'Born today: ', 'Nace hoy: ') + '<b>' + dataTexto(amigo.nasceu) + '</b></p>' +
        '<p class="dica">' + t('📜 Toque em 🎁 Pronto para ganhar a certidão de nascimento!', '📜 Tap 🎁 Done to get the birth certificate!', '📜 ¡Toca 🎁 Listo para recibir el certificado de nacimiento!') + '</p>';
      p.appendChild(f);
      var liga = function (id, k) { var e = $(id); if (e) e.addEventListener('input', function () { amigo[k] = e.value; guardarRascunho(); }); };
      liga('inNome', 'nome'); liga('inFilhote', 'nomeFilhote'); liga('inCrianca', 'crianca'); liga('inPadrinho', 'padrinho');
      $('btSortear').addEventListener('click', function () { var n = D.NOMES[Math.floor(Math.random() * D.NOMES.length)]; amigo.nome = n; $('inNome').value = n; V.pop(); guardarRascunho(); });
    }
  };
  var caixaAberta = 'laco', grupoRoupa = null;
  function marcarProntas() { document.querySelectorAll('#painel [data-pronta]').forEach(function (b) { var fr = amigo.frases[amigo.frase || 0]; var s = !fr.gravada && fr.pronta === b.dataset.pronta; b.classList.toggle('sel', s); b.setAttribute('aria-checked', String(s)); }); }

  // escolhas (um ouvinte só para o painel inteiro)
  $('painel').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    var d = b.dataset, mudouDesenho = true, repintar = true;
    if (d.base) { if (amigo.base === d.base) return; R.escolherBase(amigo, d.base); mostrarFala(falaBase()); V.pop(); }
    else if (d.corpo) R.escolherCorpo(amigo, d.corpo);
    else if (d.pelo) { amigo.pelo = d.pelo; tomAberto = 'pelo'; }
    else if (d.olhos) amigo.olhos = d.olhos;
    else if (d.estiloOlho) amigo.estiloOlho = d.estiloOlho;
    else if (d.bochecha) amigo.bochecha = d.bochecha;
    else if (d.coracao) { amigo.coracao = d.coracao; }
    else if (d.grupo) { grupoRoupa = d.grupo; tomAberto = null; mudouDesenho = false; }
    else if (d.roupa) { R.vestir(amigo, d.roupa); tomAberto = null; if (vOf) setTimeout(function () { vOf.acao('cabeca'); }, 50); }
    else if (d.baixo) { R.vestirBaixo(amigo, d.baixo); tomAberto = null; if (vOf) setTimeout(function () { vOf.acao('pulinho'); }, 50); }
    else if (d.corBaixo) { R.corBaixo(amigo, d.corBaixo); tomAberto = 'baixo'; }
    else if (d.corRoupa) { R.corRoupa(amigo, d.corRoupa); tomAberto = 'roupa'; }
    else if (d.estampa) R.estampa(amigo, d.estampa);
    else if (d.patch) amigo.patch = d.patch;
    else if (d.caixa) { caixaAberta = d.caixa; tomAberto = null; mudouDesenho = false; }
    else if (d.tirar) R.tirarAcess(amigo, d.tirar);
    else if (d.acess) { R.alternarAcess(amigo, d.acess); if (vOf) setTimeout(function () { vOf.acao('pulinho'); }, 50); }
    else if (d.corAcess) { R.corAcess(amigo, d.item, d.corAcess); tomAberto = 'acess:' + d.item; }
    else if (d.frase) { amigo.frase = +d.frase; mudouDesenho = false; }
    else if (d.maisFrase) { amigo.frases.push({ pronta: 'abraco' }); amigo.frase = amigo.frases.length - 1; mudouDesenho = false; }
    else if (d.tirarFrase) { var k = +d.tirarFrase; if (amigo.frases[k] && amigo.frases[k].gravada) V.apagar(amigo.id + ':' + k); amigo.frases.splice(k, 1); if (!amigo.frases.length) amigo.frases = [{ pronta: 'teamo' }]; amigo.frase = 0; mudouDesenho = false; }
    else if (d.ouvir) { falarFrase(amigo, vOf, $('fala')); return; }
    else if (d.pronta) { var i = amigo.frase || 0; if (amigo.frases[i] && amigo.frases[i].gravada) V.apagar(amigo.id + ':' + i); amigo.frases[i] = { pronta: d.pronta }; mudouDesenho = false; falarFrase(amigo, vOf, $('fala')); }
    else if (d.genero) { amigo.genero = d.genero; mudouDesenho = false; falarFrase(amigo, vOf, $('fala')); }
    else if (d.voz) { amigo.voz = d.voz; mudouDesenho = false; falarFrase(amigo, vOf, $('fala')); }
    else if (d.som) { amigo.som = amigo.som === d.som ? null : d.som; mudouDesenho = false; if (amigo.som) V.somFofo(amigo.som); }
    else return;
    if (!d.ouvir && !d.pronta && !d.voz && !d.som && !d.genero) V.toque();
    if (mudouDesenho) atualizarPelucia(); else guardarRascunho();
    if (repintar) { var sx = {}; document.querySelectorAll('#painel .roda').forEach(function (r, k) { sx[k] = r.scrollLeft; }); PAINEL[D.ETAPAS[etapa].id](); document.querySelectorAll('#painel .roda').forEach(function (r, k) { if (sx[k] != null) r.scrollLeft = sx[k]; }); depoisDoPainel(); }
  });

  /* ---------- segurar um botão (beijinho, máquina) ---------- */
  function segurar(bt, ms, aoAndar, aoCompletar, aoSoltar, aoComecar) {
    var t0 = 0, raf = 0, ativo = false;
    function passo() { if (!ativo) return; var f = Math.min(1, (performance.now() - t0) / ms); if (aoAndar) aoAndar(f); if (f >= 1 && ms) { ativo = false; if (aoCompletar) aoCompletar(); return; } raf = requestAnimationFrame(passo); }
    function comeca(e) { e.preventDefault(); if (ativo) return; ativo = true; t0 = performance.now(); V.acordar(); if (aoComecar) aoComecar(); try { bt.setPointerCapture(e.pointerId); } catch (x) {} bt.classList.add('segurando'); passo(); }
    function solta() { if (!ativo && !bt.classList.contains('segurando')) return; var era = ativo; ativo = false; cancelAnimationFrame(raf); bt.classList.remove('segurando'); if (aoAndar && ms) aoAndar(0); if (aoSoltar && era) aoSoltar(); else if (aoSoltar && !ms) aoSoltar(); }
    bt.addEventListener('pointerdown', comeca);
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { bt.addEventListener(ev, solta); });
    bt.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) comeca(e); });
    bt.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') solta(); });
    bt.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  function fazerDesejo() {
    amigo.desejo = true; guardarRascunho();
    V.beijinho();
    var h = el('i', 'coracao-voa'), x = D.coracao[amigo.coracao] || D.CORACOES[1];
    h.style.background = x.grad ? 'linear-gradient(135deg,' + x.grad.join(',') + ')' : x.cor;
    var bt = $('btDesejo').getBoundingClientRect(), pl = $('pelucia').getBoundingClientRect();
    h.style.left = (bt.left + bt.width / 2) + 'px'; h.style.top = (bt.top + bt.height / 2) + 'px';
    h.style.setProperty('--dx', (pl.left + pl.width / 2 - bt.left - bt.width / 2) + 'px'); h.style.setProperty('--dy', (pl.top + pl.height * 0.62 - bt.top - bt.height / 2) + 'px');
    document.body.appendChild(h); setTimeout(function () { h.remove(); }, 1300);
    mostrarFala(t('💋 Desejo feito! O coraçãozinho entrou.', '💋 Wish made! The little heart is in.', '💋 ¡Deseo pedido! El corazoncito entró.'), 2400);
    setTimeout(function () { if (vOf) vOf.acao('abraco'); }, 900);
    var pp = $('btDesejo').parentNode.querySelector('p'); if (pp) pp.textContent = t('💖 O coraçãozinho já está dentro, com o seu desejo!', '💖 The little heart is inside, with your wish!', '💖 ¡El corazoncito ya está dentro, con tu deseo!');
  }

  /* ---------- máquina de fofura ---------- */
  function fofVisual() { return etapa === 2 && !encheuAgora ? 6 : amigo.fofura; }
  function dicaFofura() {
    var z = R.zonaFofura(fofVisual());
    return z === 'pouco' ? t('Ainda murchinho… segure o botão da máquina!', 'Still floppy… hold the machine button!', 'Todavía blandito… ¡mantén el botón de la máquina!') :
      z === 'ponto' ? t('✨ No ponto! Fofinho do jeito certo.', '✨ Just right! Perfectly fluffy.', '✨ ¡En su punto! Blandito como debe ser.') :
        t('😄 Cheio demais! Ficou gordinho. Dá um apertão?', '😄 Too full! A bit chubby. Give it a squeeze?', '😄 ¡Demasiado lleno! Quedó gordito. ¿Un apretón?');
  }
  function pintarMedidor() {
    var f = fofVisual(), m = $('medidor');
    $('medidorEnche').style.height = Math.min(100, f / 120 * 100) + '%';
    m.setAttribute('data-zona', R.zonaFofura(f));
    var d = $('dicaFofura'); if (d) d.textContent = dicaFofura();
  }
  function fofuraNaTela() {   // muda só o tamanho, sem redesenhar (60 vezes por segundo)
    var g = A.geo(amigo.base, amigo.corpo, null, amigo), grupo = $('pelucia').querySelector('.ma-fofura');
    if (grupo) grupo.setAttribute('transform', (A.levantar(amigo) ? 'translate(0 ' + (-A.levantar(amigo)) + ') ' : '') + A.transformaFofura(g, fofVisual()));
    pintarMedidor();
  }
  var flocosT = 0;
  function soltarFloco() {
    var mq = $('maquina').getBoundingClientRect(), pl = $('pelucia').getBoundingClientRect(), f = el('i', 'floco');
    var x0 = mq.left + mq.width * 0.02, y0 = mq.top + mq.height * 0.6;
    f.style.left = x0 + 'px'; f.style.top = y0 + 'px';
    f.style.setProperty('--dx', (pl.left + pl.width * (0.4 + Math.random() * 0.25) - x0) + 'px'); f.style.setProperty('--dy', (pl.top + pl.height * (0.45 + Math.random() * 0.3) - y0) + 'px');
    document.body.appendChild(f); setTimeout(function () { f.remove(); }, 700);
  }
  function ligarMaquina() {
    var ultimo = 0;
    segurar($('btEncher'), 0, function () {
      var agora = performance.now(), dt = ultimo ? Math.min(0.1, (agora - ultimo) / 1000) : 0; ultimo = agora;
      if (!encheuAgora) { encheuAgora = true; amigo.fofura = 0; }
      R.encher(amigo, dt * 30);
      V.vento(true, amigo.fofura);
      fofuraNaTela();
      if (!calmo && agora - flocosT > 90) { flocosT = agora; soltarFloco(); }
    }, null, function () {
      ultimo = 0; V.vento(false); $('maquina').classList.remove('enchendo');
      var est = R.estrelinhasFofura(amigo.fofura);
      if (est) { V.estrelinhas(); mostrarFala('⭐'.repeat(est) + ' ' + t('No ponto!', 'Just right!', '¡En su punto!'), 2000); if (vOf) vOf.acao('pulinho'); }
      else if (R.zonaFofura(amigo.fofura) === 'cheio') { V.pop(); mostrarFala(t('Gordinho! 😄', 'Chubby! 😄', '¡Gordito! 😄'), 1800); if (vOf) vOf.acao('cabeca'); }
      guardarRascunho(); atualizarPelucia(); pintarMedidor();
    }, function () { $('maquina').classList.add('enchendo'); });
    $('btApertao').addEventListener('click', function () {
      if (!encheuAgora) { encheuAgora = true; }
      R.apertao(amigo); V.apertao(); atualizarPelucia(); pintarMedidor(); if (vOf) vOf.acao('abraco');
    });
  }

  /* ---------- voz: falar e gravar ---------- */
  function falarFrase(a, viva, balao, i) {
    i = i == null ? (a.frase || 0) : i;
    var fr = a.frases[i] || a.frases[0], txt = R.textoFrase(fr, lingua, a.crianca);
    V.calar();
    var acabou = function () { if (viva) viva.falando(false); if (balao) setTimeout(function () { balao.hidden = true; }, 600); };
    if (viva) viva.falando(true);
    if (balao) { balao.textContent = fr.gravada ? '🎙️ ♪' : '“' + txt + '”'; balao.hidden = false; }
    if (fr.gravada) { V.ler(a.id + ':' + i).then(function (blob) { if (!V.tocarBlob(blob, fr.efeito !== false, acabou)) acabou(); }, acabou); return; }
    var gen = R.genero(a);
    if (fr.pronta && V.temPronta(fr.pronta, lingua, gen)) { V.tocarArquivo('vozes/' + lingua + '/' + gen + '/' + fr.pronta + '.mp3', acabou); return; }
    if (!V.falar(txt, a.voz, acabou, gen)) setTimeout(acabou, 1400);
  }
  function gravarFrase() {
    var i = amigo.frase || 0, bt = $('btGravar'), barra = $('barraGrav');
    if (V.gravandoAgora()) { V.pararGravacao(); return; }
    V.calar();
    bt.textContent = t('⏹️ Parar', '⏹️ Stop', '⏹️ Parar');
    V.gravar(5000, function (f) { if (barra) barra.style.width = (f * 100) + '%'; }).then(function (blob) {
      return V.guardar(amigo.id + ':' + i, blob).then(function () {
        amigo.frases[i] = { gravada: true, efeito: $('chkEfeito') ? $('chkEfeito').checked : true };
        guardarRascunho(); PAINEL.voz(); depoisDoPainel(); falarFrase(amigo, vOf, $('fala'));
      });
    }).catch(function () {
      avisar(t('Não deu para usar o microfone. Escolha uma frase pronta. 💛', 'Couldn\'t use the microphone. Pick a ready phrase. 💛', 'No se pudo usar el micrófono. Elige una frase lista. 💛'), 3200);
      PAINEL.voz(); depoisDoPainel();
    });
  }

  /* ---------- Pronto! caixinha-casinha e o amiguinho pulando dela ---------- */
  function terminar() {
    V.acordar(); V.calar();
    if (!amigo.nome) amigo.nome = tr(D.base[amigo.base].apelido);
    var salvo = col.salvar(amigo);
    if (!salvo) { avisar(t('Não consegui guardar no aparelho (sem espaço?).', 'Couldn\'t save on this device (out of space?).', 'No pude guardar en el aparato (¿sin espacio?).'), 3500); return; }
    if (salvo.id !== amigo.id) { [0, 1].forEach(function (k) { if (amigo.frases[k] && amigo.frases[k].gravada) V.ler(amigo.id + ':' + k).then(function (b) { if (b) V.guardar(salvo.id + ':' + k, b); }); }); }
    gravarJSON(CH_RASC, null);
    exportarPersonagem(salvo);
    mostrado = salvo; amigo = null;
    caixinha(salvo, function () { voltarMenu(function () { ir({ tela: 'amigo', id: salvo.id }); }); });
  }
  function caixinha(a, depois) {
    var cx = $('caixaAnim'), feito = false;
    var pd = A.pedacos(a, { id: 'cxp' }), miolo = '<g transform="translate(150 268) scale(0.42) translate(-150 -150)">' + pd.corpo + '</g>';
    $('caixaDesenho').innerHTML = A.caixinha({ id: 'cx', miolo: miolo }).replace('<defs>', '<defs>' + pd.defs);
    $('pulo').innerHTML = A.svg(a, { id: 'pl' });
    $('confete').innerHTML = '';
    cx.hidden = false; cx.className = 'caixa-anim';
    V.festa();
    var acabar = function () { if (feito) return; feito = true; cx.hidden = true; depois(); };
    if (calmo) { cx.classList.add('aberta', 'pulou'); setTimeout(acabar, 1200); return; }
    setTimeout(function () { cx.classList.add('balanca'); }, 100);
    setTimeout(function () { cx.classList.add('aberta'); confete(); }, 900);
    setTimeout(function () { cx.classList.add('pulou'); }, 1100);
    setTimeout(acabar, 3000);
    cx.onclick = function () { if (cx.classList.contains('pulou')) acabar(); };
  }
  function confete() {
    var c = $('confete'), cores = ['#f58cb5', '#ffd447', '#8fdcc0', '#a9d2f5', '#c9a8f0', '#ff9a4d'];
    for (var i = 0; i < 36; i++) { var e = el('i', i % 3 ? 'pap' : 'pap cor'); e.style.background = cores[i % cores.length]; e.style.left = (50 + (Math.random() - 0.5) * 20) + '%'; e.style.setProperty('--dx', ((Math.random() - 0.5) * 120) + 'vw'); e.style.setProperty('--dy', (-30 - Math.random() * 60) + 'vh'); e.style.setProperty('--r', (Math.random() * 720) + 'deg'); e.style.animationDelay = (Math.random() * 0.2) + 's'; c.appendChild(e); }
  }

  /* ---------- o amiguinho pronto ---------- */
  var vAm = null;
  function poseDe(a) { return a.base === 'preguica' && !(a.acess && (a.acess.apoio || a.acess.chao)) ? 'pendurada' : null; }
  function pintarAmigo() {
    var a = mostrado, b = D.base[a.base];
    $('amNome').textContent = a.nome || tr(b.apelido);
    $('amEspecie').textContent = tr(b.esp) + ' · ' + t('nasceu em ', 'born ', 'nació el ') + dataTexto(a.nasceu) + (a.exemplo ? ' · ' + t('exemplo', 'example', 'ejemplo') : '');
    var pose = poseDe(a);
    if (!vAm) vAm = VIVO.criar($('peluciaAmigo'), a, { id: 'am', pose: pose, rotulo: a.nome });
    else vAm.trocar(a, { pose: pose });
    $('palcoAmigo').classList.toggle('q', a.corpo === 'q');
    $('palcoAmigo').classList.toggle('pendurada', pose === 'pendurada');
    $('btApagar').hidden = !!a.exemplo;
    $('btBrincar').textContent = pose === 'pendurada' ? t('🌿 Balançar', '🌿 Swing', '🌿 Columpiarse') : a.base === 'robo' ? t('💡 Carinha', '💡 Face', '💡 Carita') : a.corpo === 'q' ? t('🐾 Passear', '🐾 Walk', '🐾 Pasear') : t('👋 Acenar', '👋 Wave', '👋 Saludar');
    V.carregarProntas();
    posicionarCoracao();
  }
  // o botãozinho de coração fica no peito da pelúcia (o desenho encolhe/cresce com a tela)
  function posicionarCoracao() {
    var a = mostrado, svg = $('peluciaAmigo').querySelector('svg'); if (!a || !svg) return;
    var caixa = $('palcoAmigo').getBoundingClientRect(), r = svg.getBoundingClientRect(), g = A.geo(a.base, a.corpo, poseDe(a), a);
    var x = a.corpo === 'q' ? g.b.x - 4 : 150, y = (a.corpo === 'q' ? g.b.y - 8 : g.t.y0 + 46) - A.levantar(a);
    var s = Math.min(r.width / 300, r.height / 396), ox = r.left + (r.width - 300 * s) / 2, oy = r.top + (r.height - 396 * s) / 2;
    var b = $('btCoracao'); b.style.left = Math.round(ox + x * s - caixa.left) + 'px'; b.style.top = Math.round(oy + (y + 24) * s - caixa.top) + 'px';
  }
  window.addEventListener('resize', function () { if (tela === 'amigo') posicionarCoracao(); });
  $('peluciaAmigo').addEventListener('click', function () {
    if (!vAm) return;
    vAm.tocar();
    if (mostrado.som) V.somFofo(mostrado.som); else V.pop();
  });
  $('btCoracao').addEventListener('click', function () {
    var a = mostrado; if (!a) return;
    falarFrase(a, vAm, $('falaAmigo'));
    if (a.frases.length > 1) a.frase = (a.frase + 1) % a.frases.length;   // na próxima vez, a outra frase
    if (vAm) vAm.acao('abraco');
  });
  $('btBrincar').addEventListener('click', function () {
    if (!vAm) return; var a = mostrado, pose = poseDe(a);
    if (pose === 'pendurada') vAm.acao('balanco'); else if (a.base === 'robo') { vAm.tocar(); } else if (a.corpo === 'q') vAm.acao('andar'); else vAm.acao('acenar');
    V.toque();
  });
  $('btEditar').addEventListener('click', function () {
    var a = R.validar(JSON.parse(JSON.stringify(mostrado)));
    if (a.exemplo) { a.exemplo = false; a.id = 'a' + Date.now().toString(36); a.frases = a.frases.map(function (f) { return f.gravada ? { pronta: 'teamo' } : f; }); }
    amigo = a; encheuAgora = true; guardarRascunho();
    ir({ tela: 'oficina', etapa: 0 });
  });
  $('btNovo').addEventListener('click', function () { voltarMenu(comecar); });
  $('btApagar').addEventListener('click', function () { $('apagarJanela').hidden = false; $('btApagarNao').focus(); });
  $('btApagarNao').addEventListener('click', function () { $('apagarJanela').hidden = true; });
  $('btApagarSim').addEventListener('click', function () {
    var id = mostrado.id; $('apagarJanela').hidden = true;
    col.apagar(id); V.apagar(id + ':0'); V.apagar(id + ':1'); removerPersonagem(id);
    avisar(t('Apagado.', 'Deleted.', 'Borrado.'));
    history.back();
  });

  /* ---------- certidão ---------- */
  var fonteDados = null;
  function textosCertidao(a) {
    var b = D.base[a.base], cr = D.coracao[a.coracao] || D.CORACOES[1], z = R.zonaFofura(a.fofura), fr = a.frases[0];
    var voz = fr && fr.gravada ? t('gravada com carinho', 'recorded with love', 'grabada con cariño') : '“' + R.textoFrase(fr, lingua, a.crianca) + '”';
    if (voz.length > 30) voz = voz.slice(0, 28) + '…”';
    return { titulo: t('Certidão de Nascimento', 'Birth Certificate', 'Certificado de Nacimiento'), nome: a.nome || tr(b.apelido), especie: tr(b.esp),
      nasceu: t('Nasceu em', 'Born on', 'Nació el'), data: dataTexto(a.nasceu), padrinho: t('Padrinho / madrinha', 'Godparent', 'Padrino / madrina'), padrinhoNome: a.padrinho || '—',
      coracao: t('Coração', 'Heart', 'Corazón'), coracaoNome: tr(cr.n) + (a.desejo ? ' 💋' : ''), fofura: t('Fofura', 'Fluffiness', 'Relleno'),
      fofuraNome: z === 'ponto' ? t('no ponto', 'just right', 'en su punto') : z === 'cheio' ? t('bem gordinho', 'extra chubby', 'bien gordito') : t('molinho', 'extra floppy', 'blandito'),
      voz: t('Minha frase', 'My words', 'Mi frase'), vozNome: voz,
      filhote: a.acess && a.acess.colo === 'filhote' && a.nomeFilhote ? t('Filhotinho', 'Baby', 'Bebé') : null, filhoteNome: a.nomeFilhote,
      rodape: t('Feito com carinho no Bolinho de Chuva', 'Made with love at Rainy Day Donuts', 'Hecho con cariño en Buñuelos de Lluvia') };
  }
  $('btCertidao').addEventListener('click', function () {
    var a = mostrado;
    $('certDesenho').innerHTML = A.certidao(a, textosCertidao(a), { id: 'ct', pose: poseDe(a) });
    $('certJanela').hidden = false; $('btSalvarPng').focus(); V.brilho();
    prepararCompartilhar(a);
  });
  // 📤 Compartilhar (WhatsApp etc.): o PNG fica pronto ao abrir a certidão, para o toque já mandar; sem suporte, o botão nem aparece
  var arquivoCert = null;
  function prepararCompartilhar(a) {
    arquivoCert = null; $('btCompartilhar').hidden = true;
    if (!navigator.canShare || !navigator.share) return;
    certidaoPng(a).then(function (b) {
      var f = null; try { f = new File([b], nomeCertidao(a), { type: 'image/png' }); } catch (e) { return; }
      if (mostrado !== a || $('certJanela').hidden || !navigator.canShare({ files: [f] })) return;
      arquivoCert = f; $('btCompartilhar').hidden = false;
    }).catch(function () {});
  }
  $('btCompartilhar').addEventListener('click', function () {
    if (!arquivoCert) return;
    navigator.share({ files: [arquivoCert], title: t('Certidão de nascimento', 'Birth certificate', 'Certificado de nacimiento') }).catch(function () { /* cancelou */ });
  });
  function nomeCertidao(a) { return t('certidao-', 'certificate-', 'certificado-') + String(a.nome || 'amiguinho').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.png'; }
  $('btFecharCert').addEventListener('click', function () { $('certJanela').hidden = true; });
  $('certJanela').addEventListener('click', function (e) { if (e.target === this) this.hidden = true; });
  function carregarFonte() {
    if (fonteDados) return Promise.resolve(fonteDados);
    return fetch('../rabiscolandia/fontes/fredoka.woff2').then(function (r) { return r.blob(); }).then(function (b) {
      return new Promise(function (ok) { var fr = new FileReader(); fr.onload = function () { fonteDados = fr.result; ok(fonteDados); }; fr.onerror = function () { ok(null); }; fr.readAsDataURL(b); });
    }).catch(function () { return null; });
  }
  // a certidão vira um PNG no aparelho (nada sai daqui)
  function certidaoPng(a) {
    return carregarFonte().then(function (fonte) {
      var svg = A.certidao(a, textosCertidao(a), { id: 'png', largura: 1200, altura: 1640, fonte: fonte, pose: poseDe(a) });
      return new Promise(function (ok, erro) {
        var img = new Image(), url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        img.onload = function () {
          var cv = document.createElement('canvas'); cv.width = 1200; cv.height = 1640;
          var c = cv.getContext('2d'); c.drawImage(img, 0, 0, 1200, 1640); URL.revokeObjectURL(url);
          cv.toBlob(function (b) { if (b) ok(b); else erro(new Error('png')); }, 'image/png');
        };
        img.onerror = function () { URL.revokeObjectURL(url); erro(new Error('svg')); };
        img.src = url;
      });
    });
  }
  $('btSalvarPng').addEventListener('click', function () {
    var a = mostrado;
    certidaoPng(a).then(function (b) {
      var l = document.createElement('a'), u = URL.createObjectURL(b);
      l.href = u; l.download = nomeCertidao(a);
      document.body.appendChild(l); l.click(); l.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
      avisar(t('💾 Certidão salva no aparelho!', '💾 Certificate saved on this device!', '💾 ¡Certificado guardado en el aparato!'));
    }).catch(function () { avisar(t('Não deu para salvar a imagem aqui.', 'Couldn\'t save the picture here.', 'No se pudo guardar la imagen aquí.')); });
  });

  /* ---------- personagens que viajam entre os jogos (../personagens.js; sem ela, nada acontece) ---------- */
  function pngDeSvg(svg, w, h) {
    return new Promise(function (ok, erro) {
      var img = new Image(), url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      img.onload = function () { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url); try { ok(cv.toDataURL('image/png')); } catch (e) { erro(e); } };
      img.onerror = function () { URL.revokeObjectURL(url); erro(new Error('svg')); };
      img.src = url;
    });
  }
  function exportarPersonagem(a) {
    var P = window.BolinhoPersonagens; if (!P || !P.salvar || !a) return Promise.resolve(false);
    var g = A.geo(a.base, a.corpo, null, a), cb = g.cab, r = Math.max(cb.rx, cb.ry) + 46;
    var retrato = A.svg(a, { id: 'pr' + a.id, viewBox: [cb.x - r, cb.y - r + 14, r * 2, r * 2], largura: 256, altura: 256 });
    var corpo = A.svg(a, { id: 'pc' + a.id, viewBox: [-2, -30, 304, 405], largura: 384, altura: 512 });
    return Promise.all([pngDeSvg(retrato, 256, 256), pngDeSvg(corpo, 384, 512)]).then(function (im) {
      try { P.salvar({ id: 'amiguinho:' + a.id, jogo: 'meu-amiguinho', nome: a.nome || tr(D.base[a.base].apelido), tipo: a.base === 'robo' ? 'robo' : 'bicho', retrato: im[0], corpo: im[1] }); return true; } catch (e) { return false; }
    }).catch(function () { return false; });
  }
  function removerPersonagem(id) { var P = window.BolinhoPersonagens; if (P && P.remover) try { P.remover('amiguinho:' + id); } catch (e) {} }

  /* ---------- minha coleção (vitrine) ---------- */
  function pintarColecao() {
    if (!$('vitrineFundo').firstChild) $('vitrineFundo').innerHTML = A.vitrine({ id: 'vt', alto: innerHeight > innerWidth });
    var g = $('grade'); g.innerHTML = '';
    if (!pintarColecao.exemplos) { pintarColecao.exemplos = true; R.EXEMPLOS.forEach(function (x) { exportarPersonagem(R.validar(JSON.parse(JSON.stringify(x)))); }); }
    col.listar().forEach(function (a, i) {
      var b = el('button', 'cartao-amigo'); b.type = 'button'; b.dataset.id = a.id;
      var pd = A.pedacos(a, { id: 'cl' + i, pose: poseDe(a) }), miolo = '<g transform="translate(150 286) scale(0.5) translate(-150 -186)">' + pd.corpo + '</g>';
      b.innerHTML = A.caixinha({ id: 'ccx' + i, miolo: miolo, cor: ['#f7a8c8', '#a9d2f5', '#b5e5cd', '#f7df8c', '#cdb6ec'][i % 5] }).replace('<defs>', '<defs>' + pd.defs) +
        '<span class="nome">' + A.util.esc(a.nome || tr(D.base[a.base].apelido)) + '</span>';
      b.setAttribute('aria-label', (a.nome || '') + ', ' + tr(D.base[a.base].esp));
      g.appendChild(b);
    });
  }
  $('grade').addEventListener('click', function (e) { var b = e.target.closest('.cartao-amigo'); if (!b) return; V.pop(); mostrado = col.obter(b.dataset.id); ir({ tela: 'amigo', id: b.dataset.id }); });

  /* ---------- começo da página ---------- */
  var pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); pedidoInstalar = e; $('btInstalar').hidden = false; });
  $('btInstalar').addEventListener('click', function () { if (!pedidoInstalar) return; pedidoInstalar.prompt(); pedidoInstalar.userChoice.then(function () { pedidoInstalar = null; $('btInstalar').hidden = true; }); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !TESTE) navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });

  if (window.SolverRecursos && !SolverRecursos.ligado('meu-amiguinho', true)) { document.querySelectorAll('.tela').forEach(function (s) { s.classList.remove('ativa'); }); $('desligado').hidden = false; traduzir(); return; }
  traduzir();
  ['fala', 'falaAmigo'].forEach(function (id) { var el = $(id); if (el) el.addEventListener('click', function (e) { e.stopPropagation(); el.hidden = true; }); });   // um toque fecha o balão
  if (window.Trilha && !TESTE) Trilha.iniciar({ jogo: 'meu-amiguinho', musicas: MUSICAS, creditos: 'CREDITOS.md' });
  // limpeza: vozes gravadas de amiguinhos que não existem mais (nem no rascunho)
  setTimeout(function () {
    V.chaves().then(function (ks) {
      var vivos = {}; col.meus().forEach(function (a) { vivos[a.id] = 1; }); var r = lerJSON(CH_RASC, null); if (r && r.amigo) vivos[r.amigo.id] = 1;
      (ks || []).forEach(function (k) { if (!vivos[String(k).split(':')[0]]) V.apagar(k); });
    });
  }, 4000);

  if (TESTE) window.AmiguinhoDebug = {
    pronto: true, versao: APP_VERSION, MUSICAS: MUSICAS,
    estado: function () { return { tela: tela, etapa: etapa, amigo: amigo ? JSON.parse(JSON.stringify(amigo)) : null, mostrado: mostrado ? mostrado.id : null, colecao: col.listar().length, pilha: pilha.length }; },
    amigo: function () { return amigo; },
    encher: function (f) { encheuAgora = true; amigo.fofura = f; atualizarPelucia(); pintarMedidor(); },
    certidaoPng: function () { return certidaoPng(mostrado).then(function (b) { return b.size; }); },
    vivo: function () { return vAm || vOf; }
  };
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer brincar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  s.setAttribute('data-nome', 'Meu Pequeno Amiguinho'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
})();
