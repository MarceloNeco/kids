/* AQUA — a tela: níveis, fases, toques nos frascos, o despejo animado, as ajudas (desfazer, dica, embaralhar, frasco
   extra, recomeçar), estrelas, gotinhas, a lojinha de brincadeira, sons, fim de fase e instalar.
   As regras, o gerador de fases e o resolvedor são do motor.js; o desenho dos frascos é do desenho.js; os sons, do som.js.
   Guarda só neste aparelho (localStorage "aqua.pref"): idioma, sons, desenho nas cores, a fase de cada nível, as
   estrelas, as gotinhas e o que já foi trocado na lojinha. Sem dinheiro, sem anúncio, sem conta. */
(function () {
  'use strict';
  var APP_VERSION = '0.1.0';
  var APP_DATA = '14/Nov/2026';
  var M = window.AquaMotor, D = window.AquaDesenho, Som = window.AquaSom;
  var $ = function (id) { return document.getElementById(id); };
  var CALMO = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var TESTE = /[?&]teste\b/.test(location.search);
  var VEL = TESTE ? 6 : 1;                 // nos testes as animações correm 6 vezes mais rápido

  function ler(k, padrao) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  var pref = ler('aqua.pref', null) || {};
  if (pref.lingua !== 'en' && pref.lingua !== 'pt') pref.lingua = (navigator.language || 'pt').slice(0, 2) === 'pt' ? 'pt' : 'en';
  if (window.BolinhoIdioma && !BolinhoIdioma.ingles()) pref.lingua = 'pt';   // só português sem o interruptor "ingles" (../idioma.js)
  if (typeof pref.efeitos !== 'boolean') pref.efeitos = true;
  if (typeof pref.simbolos !== 'boolean') pref.simbolos = false;
  if (!pref.fase || typeof pref.fase !== 'object') pref.fase = {};
  if (!pref.estrelas || typeof pref.estrelas !== 'object') pref.estrelas = {};
  M.NIVEIS.forEach(function (n) {
    pref.fase[n] = Math.max(1, Math.floor(pref.fase[n]) || 1);
    if (!Array.isArray(pref.estrelas[n])) pref.estrelas[n] = [];
  });
  pref.gotas = Math.max(0, Math.floor(pref.gotas) || 0);
  if (!pref.tem || typeof pref.tem !== 'object') pref.tem = {};
  if (!Array.isArray(pref.tem.frascos)) pref.tem.frascos = [];
  if (!Array.isArray(pref.tem.cenarios)) pref.tem.cenarios = [];
  if (pref.tem.frascos.indexOf('tubinho') < 0) pref.tem.frascos.push('tubinho');
  if (pref.tem.cenarios.indexOf('chuva') < 0) pref.tem.cenarios.push('chuva');
  if (!D.FRASCOS[pref.frasco] || pref.tem.frascos.indexOf(pref.frasco) < 0) pref.frasco = 'tubinho';
  if (!D.CENARIOS[pref.cenario] || pref.tem.cenarios.indexOf(pref.cenario) < 0) pref.cenario = 'chuva';
  function salvarPref() { gravar('aqua.pref', pref); }
  Som.ligar(pref.efeitos);

  // ---------- idioma ----------
  function t(pt, en) { return pref.lingua === 'en' ? en : pt; }
  var NOME_NIVEL = { facil: ['Fácil', 'Easy'], medio: ['Médio', 'Medium'], dificil: ['Difícil', 'Hard'] };
  function traduzir() {
    document.documentElement.lang = pref.lingua === 'en' ? 'en' : 'pt-BR';
    Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (el) { var p = el.getAttribute('data-t').split('|'); el.textContent = pref.lingua === 'en' ? p[1] : p[0]; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-rotulo]'), function (el) { var p = el.getAttribute('data-rotulo').split('|'); var r = pref.lingua === 'en' ? p[1] : p[0]; el.setAttribute('aria-label', r); el.title = r; });
    $('btLingua').textContent = pref.lingua === 'en' ? 'PT' : 'EN';
    $('versao').textContent = t('Versão ', 'Version ') + APP_VERSION + ' · ' + (pref.lingua === 'en' ? 'Nov/14/2026' : APP_DATA) +
      t(' · Músicas: Kevin MacLeod (incompetech.com), CC BY · sem anúncios e sem compras', ' · Music: Kevin MacLeod (incompetech.com), CC BY · no ads, no purchases');
    pintarEfeitos(); pintarMenu();
    if (est) { pintarBarra(); pintarAjudas(); rotular(); }
    if (atual === 'loja') montarLoja();
  }
  $('btLingua').addEventListener('click', function () { pref.lingua = pref.lingua === 'en' ? 'pt' : 'en'; salvarPref(); traduzir(); });
  $('btAjuda').addEventListener('click', function () {
    var aj = $('ajuda'); aj.hidden = !aj.hidden; this.setAttribute('aria-expanded', String(!aj.hidden));
    if (!aj.hidden) aj.scrollIntoView({ block: 'nearest', behavior: CALMO ? 'auto' : 'smooth' });
  });
  function pintarEfeitos() {
    var b = $('btEfeitos'); b.textContent = pref.efeitos ? '🔊' : '🔈'; b.setAttribute('aria-pressed', String(pref.efeitos));
    b.title = pref.efeitos ? t('Sons ligados', 'Sounds on') : t('Sons desligados', 'Sounds off');
    $('btSimbolos').setAttribute('aria-pressed', String(pref.simbolos));
  }
  $('btEfeitos').addEventListener('click', function () { pref.efeitos = !pref.efeitos; Som.ligar(pref.efeitos); salvarPref(); pintarEfeitos(); Som.acordar(); Som.vidro(); });
  $('btSimbolos').addEventListener('click', function () { pref.simbolos = !pref.simbolos; salvarPref(); pintarEfeitos(); });

  // ---------- menu: a fase de cada nível, as estrelas e as gotinhas ----------
  var REC_ID = { facil: 'recFacil', medio: 'recMedio', dificil: 'recDificil' };
  function somaEstrelas(n) { return pref.estrelas[n].reduce(function (a, b) { return a + (b || 0); }, 0); }
  function pintarMenu() {
    M.NIVEIS.forEach(function (n) {
      var e = somaEstrelas(n);
      $(REC_ID[n]).textContent = t('Fase ', 'Stage ') + pref.fase[n] + (e ? ' · ⭐ ' + e : '');
    });
    pintarGotas();
  }
  function pintarGotas() {
    ['gotasMenuN', 'gotasJogo', 'gotasLoja'].forEach(function (id) { $(id).textContent = String(pref.gotas); });
    $('gotasMenu').setAttribute('aria-label', t('Gotinhas: ', 'Droplets: ') + pref.gotas);
    $('placaGotas').setAttribute('aria-label', t('Gotinhas: ', 'Droplets: ') + pref.gotas);
  }

  // ---------- telas e o botão Voltar do celular ----------
  var atual = 'menu', dentro = false;
  function mostrar(id) {
    Array.prototype.forEach.call(document.querySelectorAll('.tela'), function (s) { s.classList.toggle('ativa', s.id === id); });
    atual = id; window.scrollTo(0, 0);
    if (id === 'jogo') pedirQuadro();
  }
  function entrar(id) {
    if (!dentro) { dentro = true; try { history.pushState({ aqua: 1 }, ''); } catch (e) { /* sem histórico */ } }
    mostrar(id);
  }
  function voltarAoMenu() { if (dentro) { try { history.back(); } catch (e) { aoVoltar(); } } else aoVoltar(); }
  function aoVoltar() {
    var veio = atual;
    dentro = false; fecharFim(); pararTudo(); mostrar('menu'); pintarMenu();
    setTimeout(function () { var b = veio === 'loja' ? $('btLoja') : $(botaoDoNivel()); if (b) b.focus(); }, 30);
  }
  window.addEventListener('popstate', function () { if (dentro) aoVoltar(); });
  // navegação padrão (../navegacao.js): 🏠 Início = voltar aos níveis (o mesmo do Voltar do celular); 🚪 Saída pergunta
  // antes de sair com a fase já começada
  if (window.BolinhoNav) BolinhoNav.iniciar({ jogo: 'aqua', noInicio: function () { return atual === 'menu'; }, irParaInicio: voltarAoMenu,
    emAndamento: function () { return atual === 'jogo' && !!est && hist.length > 0 && !fimDeFase; } });
  function botaoDoNivel() { return { facil: 'btFacil', medio: 'btMedio', dificil: 'btDificil' }[nivel]; }

  Array.prototype.forEach.call(document.querySelectorAll('.nivel'), function (b) {
    b.addEventListener('click', function () { Som.acordar(); nivel = b.getAttribute('data-nivel'); fase = pref.fase[nivel]; entrar('jogo'); novoJogo(); telaCheia(); });
  });
  $('btLoja').addEventListener('click', function () { Som.acordar(); entrar('loja'); montarLoja(); });
  $('btLojaVoltar').addEventListener('click', voltarAoMenu);

  function telaCheia() {
    var d = document, el = d.documentElement, toque = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (!toque || TESTE) return;
    try { if (!(d.fullscreenElement || d.webkitFullscreenElement)) { var p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : (el.webkitRequestFullscreen && el.webkitRequestFullscreen()); if (p && p.catch) p.catch(function () {}); } } catch (e) { /* sem tela cheia */ }
  }

  // ---------- o jogo ----------
  // quantas vezes cada ajuda pode ser usada por fase (nunca custam nada; voltam cheias a cada fase)
  var LIMITES = {
    facil: { desfazer: Infinity, dica: Infinity, embaralhar: 3, extra: 2 },
    medio: { desfazer: 5, dica: 3, embaralhar: 2, extra: 1 },
    dificil: { desfazer: 3, dica: 1, embaralhar: 1, extra: 1 }
  };
  var LEVANTA = 24;                        // quanto o frasco escolhido sobe (pontos do desenho)
  var nivel = 'facil', fase = 1, gerada = null, est = null, hist = [], usos = null, sel = -1, fimDeFase = false;
  var vb = [];                             // o jeito de cada frasco na tela (subida, balanço, rolha, brilho, bolhas...)
  var anims = [];                          // despejos em andamento
  var faiscas = [];                        // estrelinhas e confetes
  var dicaPar = null, dicaAte = 0, dicaSozinha = false, parado = 0;
  var plano = null;                        // o caminho da dica (motor.js: M.plano), enquanto a pessoa o segue
  var lay = null;                          // onde cada frasco fica
  var relogio = 0, ultimoTs = 0, quadroPedido = 0;
  var palco = $('palco'), ctx = palco.getContext('2d'), area = $('area'), caixa = $('frascos'), botoes = [];
  var rng = TESTE ? M.semente(7) : Math.random;

  function novoVb() { return { sobe: 0, sobeAlvo: 0, ondaA: 0, ondaT: 0, rolha: 0, rolhaAlvo: 0, brilho: 0, treme: 0, revela: 0, nasce: 1, bolhas: [], pisca: Math.random() * 6 }; }

  function novoJogo() {
    fecharFim(); pararTudo();
    gerada = M.gerar(nivel, fase);
    est = M.novoEstado(gerada);
    hist = []; usos = { desfazer: 0, dica: 0, embaralhar: 0, extra: 0 }; sel = -1; fimDeFase = false; parado = 0;
    vb = est.frascos.map(novoVb);
    $('jogo').className = 'tela' + (atual === 'jogo' ? ' ativa' : '') + ' cen-' + pref.cenario;
    pintarBarra(); pintarAjudas(); montarBotoes(); ajustar(); pedirQuadro();
  }
  function pararTudo() { anims = []; faiscas = []; dicaPar = null; plano = null; sel = -1; Som.pararDespejo(); esconderAviso(); clearTimeout(esperaFim); }

  function pintarBarra() {
    $('placaFase').textContent = t('Fase ', 'Stage ') + fase;
    $('placaFase').setAttribute('aria-label', t('Nível ', 'Level ') + t(NOME_NIVEL[nivel][0], NOME_NIVEL[nivel][1]) + t(', fase ', ', stage ') + fase);
    pintarGotas();
  }
  function resta(tipo) { return LIMITES[nivel][tipo] - usos[tipo]; }
  function pintarAjudas() {
    [['desfazer', 'btDesfazer', 'nDesfazer'], ['dica', 'btDica', 'nDica'], ['embaralhar', 'btEmbaralhar', 'nEmbaralhar'], ['extra', 'btExtra', 'nExtra']].forEach(function (a) {
      var r = resta(a[0]), b = $(a[1]);
      $(a[2]).textContent = r === Infinity ? '∞' : String(r);
      b.classList.toggle('vazia', r <= 0 || (a[0] === 'desfazer' && !hist.length));
      // o leitor de tela ouve quantas restam; o botão continua tocável mesmo zerado (ele explica que acabou)
      var rot = b.getAttribute('data-rotulo').split('|')[pref.lingua === 'en' ? 1 : 0];
      b.setAttribute('aria-label', rot + (r === Infinity ? t(' (sem limite)', ' (no limit)') : t(' (restam ', ' (') + r + t(')', ' left)')));
    });
  }

  // ---------- os botões invisíveis em cima de cada frasco (toque, teclado e leitor de tela) ----------
  function montarBotoes() {
    caixa.innerHTML = ''; botoes = [];
    caixa.setAttribute('aria-label', t('Frascos', 'Bottles'));
    est.frascos.forEach(function (f, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'frasco'; b.id = 'frasco-' + i; b.setAttribute('data-i', i);
      b.addEventListener('click', function () { tocar(i); });
      caixa.appendChild(b); botoes.push(b);
    });
    rotular();
  }
  function nomeCor(c) { return t(D.CORES[c].pt, D.CORES[c].en); }
  function rotular() {
    if (!est) return;
    est.frascos.forEach(function (f, i) {
      var b = botoes[i]; if (!b) return;
      var s;
      if (!f.length) s = t('vazio', 'empty');
      else if (M.pronto(f, est.cap)) s = t('pronto, todo ', 'done, all ') + nomeCor(f[0]);
      else {
        var nomes = [];
        for (var k = f.length - 1; k >= 0; k--) nomes.push(est.vistos[i][k] ? nomeCor(f[k]) : t('escondida', 'hidden'));
        s = t('de cima para baixo: ', 'top to bottom: ') + nomes.join(', ');
      }
      b.setAttribute('aria-label', t('Frasco ', 'Bottle ') + (i + 1) + (i === sel ? t(' (levantado)', ' (lifted)') : '') + ': ' + s);
      b.setAttribute('aria-pressed', String(i === sel));
    });
  }

  // ---------- onde cada frasco fica: as fileiras que deixam os frascos do maior tamanho possível ----------
  function ajustar() {
    if (!est) return;
    var rj = $('jogo').getBoundingClientRect(), ra = area.getBoundingClientRect();
    var W = ra.width, H = ra.height; if (W < 10 || H < 10) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    palco.width = Math.round(rj.width * dpr); palco.height = Math.round(rj.height * dpr);
    var md = D.medidas(pref.frasco, est.cap), n = est.frascos.length;
    var celW = md.largo + 14, celH = md.alto + LEVANTA + 26, melhor = null;
    for (var r = 1; r <= 4 && r <= n; r++) {
      var cols = Math.ceil(n / r), s = Math.min(W / (cols * celW), H / (r * celH), 1.9);
      if (!melhor || s > melhor.s + 0.001) melhor = { s: s, r: r };
    }
    var s2 = melhor.s, linhas = melhor.r, base = Math.floor(n / linhas), sobra = n % linhas;
    var ox = ra.left - rj.left, oy = ra.top - rj.top, y0 = oy + (H - linhas * celH * s2) / 2, casas = [], fileiras = [], k = 0;
    for (var l = 0; l < linhas; l++) {
      var cnt = base + (l < sobra ? 1 : 0), larg = cnt * celW * s2, x0 = ox + (W - larg) / 2, chao = y0 + l * celH * s2 + (md.alto + LEVANTA + 4) * s2;
      fileiras.push({ x: x0 - 4 * s2, y: chao + 2 * s2, w: larg + 8 * s2, h: 11 * s2 });
      for (var c = 0; c < cnt; c++, k++) casas.push({ x: x0 + (c + 0.5) * celW * s2, y: chao, l: l });
    }
    lay = { s: s2, md: md, casas: casas, fileiras: fileiras, dpr: dpr, W: rj.width, H: rj.height, celW: celW };
    casas.forEach(function (p, i) {
      var b = botoes[i]; if (!b) return;
      b.style.left = (p.x - ox - celW * s2 / 2) + 'px'; b.style.top = (p.y - oy - (md.alto + 8) * s2) + 'px';
      b.style.width = (celW * s2) + 'px'; b.style.height = ((md.alto + 16) * s2) + 'px';
    });
    pedirQuadro();
  }
  var esperaAjuste = 0;
  function pedirAjuste() { clearTimeout(esperaAjuste); esperaAjuste = setTimeout(ajustar, 100); }
  if (window.ResizeObserver) new ResizeObserver(pedirAjuste).observe(area);
  window.addEventListener('resize', pedirAjuste);

  // ---------- toques ----------
  function ocupado(i) { return anims.some(function (a) { return a.de === i || a.para === i; }); }
  function tocar(i) {
    Som.acordar(); parado = 0;
    if (dicaPar && dicaSozinha) dicaPar = null;
    if (!est || fimDeFase || i >= est.frascos.length) return;
    if (ocupado(i) || (sel >= 0 && ocupado(sel))) terminarAnims();
    var f = est.frascos[i];
    if (sel < 0) {
      if (!f.length || M.pronto(f, est.cap)) { tremer(i); if (f.length) Som.erro(); return; }
      escolher(i); return;
    }
    if (i === sel) { soltar(); return; }
    if (M.quantoDespeja(est, sel, i)) { despejar(sel, i); return; }
    if (f.length && !M.pronto(f, est.cap)) { soltar(true); escolher(i); return; }   // tocou em outro frasco que não combina: pega esse
    tremer(i); Som.erro();
  }
  function escolher(i) { sel = i; vb[i].sobeAlvo = 1; balancar(i, 0.10); Som.vidro(); rotular(); pedirQuadro(); }
  function soltar(quieto) { if (sel < 0) return; vb[sel].sobeAlvo = 0; balancar(sel, 0.06); if (!quieto) Som.toque(); sel = -1; rotular(); pedirQuadro(); }
  function tremer(i) { vb[i].treme = 1; pedirQuadro(); }
  function balancar(i, forca) { if (CALMO) return; vb[i].ondaA = Math.max(vb[i].ondaA, forca); vb[i].ondaT = 0; }

  function despejar(de, para) {
    hist.push(M.copiar(est));
    // a jogada é o próximo passo do caminho da dica? então o caminho continua valendo (e anda um passo quando a cor
    // de cima passou inteira; com frasco embaçado pode passar só um pedaço, e o mesmo passo continua sendo o próximo)
    var noPlano = plano && plano.length && plano[0][0] === de && plano[0][1] === para, esperado = noPlano ? M.escrito(M.depois(est.frascos, est.cap, de, para)) : '';
    var antes = est.frascos[de].length, r = M.despejar(est, de, para);
    if (!r) { hist.pop(); return; }
    if (noPlano) { if (M.escrito(est.frascos) === esperado) plano.shift(); } else plano = null;
    var c = lay.casas, dir = c[de].x < c[para].x - 1 ? 1 : c[de].x > c[para].x + 1 ? -1 : (c[para].x > lay.W / 2 ? 1 : -1);
    var comprido = lay.md.alto * lay.s;                      // se o frasco deitado sairia da tela, vira para o outro lado
    if (c[para].x - dir * comprido < 0 || c[para].x - dir * comprido > lay.W) dir = -dir;
    anims.push({ de: de, para: para, q: r.q, cor: r.cor, dir: dir, t: 0, tIda: 0.22, tVerte: 0.24 + 0.2 * r.q, tVolta: 0.24, revelou: r.revelou, fechou: r.fechou,
      antes: antes, som: false, sobe0: vb[de].sobe });
    sel = -1; dicaPar = null; esconderAviso(); rotular(); pintarAjudas(); pedirQuadro();
  }
  function concluir(a) {
    var v = vb[a.de], p = vb[a.para];
    v.sobe = 0; v.sobeAlvo = 0; balancar(a.de, 0.07); balancar(a.para, 0.05);
    if (a.revelou) v.revela = 1;
    Som.glub();
    if (a.fechou) fechar(a.para);
    depoisDaJogada();
  }
  function fechar(i) {
    var p = lay.casas[i], md = lay.md, s = lay.s, v = vb[i];
    v.rolhaAlvo = 1; v.brilho = 1;
    Som.rolha(); setTimeout(function () { Som.brilho(); }, 160 / VEL);
    if (CALMO) return;
    for (var k = 0; k < 12; k++) {
      var ang = Math.random() * 6.283, d = (20 + Math.random() * 40) * s;
      faiscas.push({ tipo: 'estrela', x: p.x + Math.cos(ang) * d * 0.7, y: p.y - md.h * s * (0.2 + Math.random() * 0.9), vx: Math.cos(ang) * 30 * s, vy: -20 * s - Math.random() * 40 * s,
        r: (5 + Math.random() * 7) * s, giro: Math.random() * 3, vg: 2 - Math.random() * 4, cor: k % 3 ? '#fff6b0' : '#ffffff', vida: 0.7 + Math.random() * 0.5, idade: -Math.random() * 0.25 });
    }
  }
  var esperaFim = 0;
  function depoisDaJogada() {
    rotular(); pintarAjudas();
    if (M.venceu(est)) { if (!fimDeFase) { fimDeFase = true; esperaFim = setTimeout(comemorar, 700 / VEL); } return; }
    if (!anims.length && !M.temJogada(est)) travou();
  }
  function terminarAnims() {
    var lista = anims; anims = [];
    Som.pararDespejo();
    lista.forEach(concluir);
  }
  function travou() {
    aviso(t('Travou! Use ↩️ desfazer, 🔀 embaralhar ou ➕ mais um frasco.', 'Stuck! Use ↩️ undo, 🔀 shuffle or ➕ one more bottle.'));
    chamarAjudas();
  }
  function chamarAjudas() {
    ['btDesfazer', 'btEmbaralhar', 'btExtra'].forEach(function (id) { var b = $(id); b.classList.remove('chama'); void b.offsetWidth; if (!b.classList.contains('vazia')) b.classList.add('chama'); });
  }

  // ---------- avisos curtos ----------
  var esperaAviso = 0;
  function aviso(txt) { var a = $('aviso'); a.textContent = txt; a.hidden = false; clearTimeout(esperaAviso); esperaAviso = setTimeout(esconderAviso, 4200); }
  function esconderAviso() { clearTimeout(esperaAviso); $('aviso').hidden = true; }

  // ---------- ajudas ----------
  function acabou(tipo) {
    var nomes = { desfazer: ['os desfazer', 'undos'], dica: ['as dicas', 'hints'], embaralhar: ['os embaralhar', 'shuffles'], extra: ['os frascos extras', 'extra bottles'] };
    aviso(t('Acabaram ' + nomes[tipo][0] + ' desta fase. Na próxima fase voltam todos!', 'No more ' + nomes[tipo][1] + ' in this stage. They all come back in the next one!'));
    Som.erro();
  }
  function prepararAjuda() { Som.acordar(); parado = 0; if (anims.length) terminarAnims(); return !!est && !fimDeFase; }

  $('btDesfazer').addEventListener('click', function () {
    if (!prepararAjuda()) return;
    if (!hist.length) { aviso(t('Ainda não tem jogada para desfazer.', 'There is no move to undo yet.')); return; }
    if (resta('desfazer') <= 0) { acabou('desfazer'); return; }
    var antes = hist.pop(), extras = est.extras;
    while (antes.frascos.length < est.frascos.length) { antes.frascos.push([]); antes.vistos.push([]); }   // o frasco extra continua
    antes.extras = extras; est = antes; usos.desfazer++;
    if (sel >= 0) { vb[sel].sobeAlvo = 0; sel = -1; }
    est.frascos.forEach(function (f, i) { if (!M.pronto(f, est.cap)) { vb[i].rolha = 0; vb[i].rolhaAlvo = 0; vb[i].brilho = 0; } balancar(i, 0.04); });
    dicaPar = null; plano = null; esconderAviso(); Som.glub(); rotular(); pintarAjudas(); pedirQuadro();
  });

  $('btDica').addEventListener('click', function () {
    if (!prepararAjuda()) return;
    if (resta('dica') <= 0) { acabou('dica'); return; }
    if (!mostrarDica(false)) return;
    usos.dica++; pintarAjudas();
  });
  function mostrarDica(sozinha) {
    if (!plano || !plano.length || !M.quantoDespeja(est, plano[0][0], plano[0][1])) plano = M.plano(est);
    var p = plano && plano[0];
    if (!p) {
      if (!sozinha) { aviso(t('Deste jeito não dá mais para terminar. Use ↩️ desfazer, 🔀 embaralhar ou ➕ mais um frasco.', 'This way it cannot be finished anymore. Use ↩️ undo, 🔀 shuffle or ➕ one more bottle.')); chamarAjudas(); }
      return false;
    }
    if (sel >= 0) soltar(true);
    dicaPar = p; dicaSozinha = sozinha; dicaAte = relogio + (sozinha ? 9999 : 5);
    if (!sozinha) { Som.brilho(); aviso(t('Despeje o frasco ', 'Pour bottle ') + (p[0] + 1) + t(' no frasco ', ' into bottle ') + (p[1] + 1) + '.'); }
    pedirQuadro(); return true;
  }

  $('btEmbaralhar').addEventListener('click', function () {
    if (!prepararAjuda()) return;
    if (resta('embaralhar') <= 0) { acabou('embaralhar'); return; }
    if (sel >= 0) soltar(true);
    if (!M.embaralhar(est, rng)) { aviso(t('Não deu para embaralhar agora.', 'Could not shuffle right now.')); return; }
    usos.embaralhar++; hist = []; dicaPar = null; plano = null; esconderAviso();
    est.frascos.forEach(function (f, i) { if (!M.pronto(f, est.cap)) { vb[i].treme = 1; balancar(i, 0.14); vb[i].revela = 0.6; } });
    Som.despejar(0.5); setTimeout(function () { Som.glub(); }, 300 / VEL);
    rotular(); pintarAjudas(); pedirQuadro();
  });

  $('btExtra').addEventListener('click', function () {
    if (!prepararAjuda()) return;
    if (resta('extra') <= 0) { acabou('extra'); return; }
    if (sel >= 0) soltar(true);
    M.frascoExtra(est); usos.extra++;
    var v = novoVb(); v.nasce = CALMO ? 1 : 0; vb.push(v);
    dicaPar = null; plano = null; esconderAviso(); montarBotoes(); ajustar(); Som.vidro(); Som.brilho(); pintarAjudas();
  });

  $('btReiniciar').addEventListener('click', function () { Som.acordar(); Som.toque(); novoJogo(); });

  // ---------- fim de fase: estrelas, gotinhas e comemoração ----------
  function comemorar() {
    var u = usos, estrelas = (u.embaralhar || u.extra) ? 1 : (u.desfazer || u.dica) ? 2 : 3;
    var antigas = pref.estrelas[nivel][fase - 1] || 0, nova = fase >= pref.fase[nivel];
    var ganho = nova ? 10 * estrelas : Math.max(2, 10 * (estrelas - antigas));
    pref.estrelas[nivel][fase - 1] = Math.max(antigas, estrelas);
    for (var k = 0; k < fase; k++) if (!pref.estrelas[nivel][k]) pref.estrelas[nivel][k] = pref.estrelas[nivel][k] || 0;
    if (nova) pref.fase[nivel] = fase + 1;
    pref.gotas += ganho; salvarPref(); pintarGotas(); esconderAviso(); dicaPar = null;
    Som.aplausos(); Som.brilho();
    if (window.Trilha && Trilha.volume) { Trilha.volume(0.35); setTimeout(function () { Trilha.volume(null); }, 3200); }
    if (!CALMO) confete();
    $('fimEstrelas').innerHTML = '';
    for (var e = 1; e <= 3; e++) { var sp = document.createElement('span'); sp.textContent = '⭐'; sp.className = e <= estrelas ? 'acesa' : 'apagada'; sp.style.animationDelay = (e * 0.18) + 's'; $('fimEstrelas').appendChild(sp); }
    $('fimEstrelas').setAttribute('aria-label', estrelas + t(' de 3 estrelas', ' of 3 stars'));
    $('fimTitulo').textContent = [t('Conseguiu!', 'You did it!'), t('Muito bem!', 'Well done!'), t('Perfeito!', 'Perfect!')][estrelas - 1];
    $('fimTexto').textContent = estrelas === 3 ? t('Fase ' + fase + ' sem nenhuma ajuda. Que capricho!', 'Stage ' + fase + ' with no helpers at all. Brilliant!')
      : t('Fase ' + fase + ' pronta. Sem usar as ajudas ela vale 3 estrelas.', 'Stage ' + fase + ' done. With no helpers it is worth 3 stars.');
    $('fimGotas').textContent = '💧 +' + ganho + t(' gotinhas', ' droplets');
    $('fim').hidden = false;
    setTimeout(function () { $('btProxima').focus(); }, 60);
    pedirQuadro();
  }
  function fecharFim() { $('fim').hidden = true; }
  function confete() {
    var cores = D.CORES.slice(0, 9).map(function (c) { return c.hex; });
    for (var k = 0; k < 90; k++) {
      faiscas.push({ tipo: k % 4 ? 'papel' : 'gota', x: Math.random() * lay.W, y: -20 - Math.random() * lay.H * 0.5, vx: (Math.random() - 0.5) * 80, vy: 120 + Math.random() * 180,
        r: 5 + Math.random() * 6, giro: Math.random() * 6, vg: (Math.random() - 0.5) * 9, cor: cores[k % cores.length], vida: 3.2 + Math.random() * 1.2, idade: 0 });
    }
  }
  $('btProxima').addEventListener('click', function () { fase = Math.min(fase + 1, pref.fase[nivel]); novoJogo(); });
  $('btDeNovo').addEventListener('click', function () { novoJogo(); });
  $('btNiveis').addEventListener('click', voltarAoMenu);

  // ---------- o quadro: mexer e desenhar ----------
  function pedirQuadro() { if (!quadroPedido && atual === 'jogo') quadroPedido = requestAnimationFrame(quadro); }
  function mexendo() {
    if (anims.length || faiscas.length || dicaPar) return true;
    for (var i = 0; i < vb.length; i++) { var v = vb[i]; if (Math.abs(v.sobe - v.sobeAlvo) > 0.002 || v.ondaA > 0.002 || v.treme > 0.01 || v.revela > 0.01 || v.nasce < 1 || v.rolha < v.rolhaAlvo) return true; }
    return false;
  }
  function quadro(ts) {
    quadroPedido = 0;
    if (atual !== 'jogo' || !est || !lay) return;
    var dt = ultimoTs ? Math.min(0.05, (ts - ultimoTs) / 1000) : 0.016; ultimoTs = ts;
    dt *= VEL; relogio += dt;
    atualizar(dt); desenhar();
    // sem "reduzir movimento" o líquido fica sempre vivo (ondinha e bolhas); com ele, só desenha enquanto algo muda
    if (!CALMO || mexendo()) pedirQuadro(); else ultimoTs = 0;
  }
  function suave(x) { return x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x); }

  function atualizar(dt) {
    var i, v;
    for (i = 0; i < vb.length; i++) {
      v = vb[i];
      v.sobe += (v.sobeAlvo - v.sobe) * Math.min(1, dt * 16);
      if (v.ondaA > 0) { v.ondaT += dt; v.ondaA *= Math.exp(-2.6 * dt); if (v.ondaA < 0.002) v.ondaA = 0; }
      if (v.rolha < v.rolhaAlvo) v.rolha = Math.min(1, v.rolha + dt / 0.38);
      if (v.treme > 0) v.treme = Math.max(0, v.treme - dt / 0.4);
      if (v.revela > 0) v.revela = Math.max(0, v.revela - dt / 0.5);
      if (v.nasce < 1) v.nasce = Math.min(1, v.nasce + dt / 0.35);
      if (v.rolhaAlvo && v.brilho > 0.3) v.brilho = Math.max(0.3, v.brilho - dt * 0.6);
      // bolhas: sobem devagar; nascem de vez em quando e bastante enquanto o frasco recebe líquido
      var cheio = est.frascos[i] ? est.frascos[i].length * D.UH : 0, recebe = false, k;
      for (k = 0; k < anims.length; k++) if (anims[k].para === i && anims[k].t > anims[k].tIda && anims[k].t < anims[k].tIda + anims[k].tVerte) recebe = true;
      if (!CALMO && cheio > 8 && v.bolhas.length < (recebe ? 9 : 3) && Math.random() < dt * (recebe ? 14 : 0.5))
        v.bolhas.push({ x: (Math.random() - 0.5) * (lay.md.w - 14), y: recebe ? cheio * (0.4 + Math.random() * 0.5) : 4, r: 1.4 + Math.random() * 2.4, v: 16 + Math.random() * 26 });
      for (k = v.bolhas.length - 1; k >= 0; k--) { v.bolhas[k].y += v.bolhas[k].v * dt; if (v.bolhas[k].y > cheio - 2) v.bolhas.splice(k, 1); }
    }
    // despejos
    for (i = anims.length - 1; i >= 0; i--) {
      var a = anims[i]; a.t += dt;
      if (!a.som && a.t >= a.tIda) { a.som = true; Som.despejar(a.tVerte / VEL + 0.05); }
      if (a.t >= a.tIda + a.tVerte + a.tVolta) { anims.splice(i, 1); concluir(a); }
    }
    for (i = faiscas.length - 1; i >= 0; i--) {
      var f = faiscas[i]; f.idade += dt;
      if (f.idade < 0) continue;
      f.x += f.vx * dt; f.y += f.vy * dt; f.giro += f.vg * dt;
      if (f.tipo === 'estrela') f.vy += 60 * dt;
      if (f.idade > f.vida || f.y > lay.H + 40) faiscas.splice(i, 1);
    }
    if (dicaPar && relogio > dicaAte) dicaPar = null;
    // no Fácil, depois de uns segundos parado, o jogo mostra sozinho uma jogada boa (não gasta dica nem estrela)
    if (nivel === 'facil' && !fimDeFase && !anims.length && !dicaPar) { parado += dt / VEL; if (parado > 9) { parado = 0; mostrarDica(true); } }
  }

  // a pose do frasco que está despejando: gira em volta da quina da boca, que fica parada em cima do outro frasco
  function pose(a) {
    var s = lay.s, md = lay.md, de = lay.casas[a.de], para = lay.casas[a.para], UH = D.UH;
    var casaX = de.x + a.dir * md.nw / 2 * s, casaY = de.y + md.topo * s;
    var alvoX = para.x - a.dir * 2 * s, alvoY = para.y + md.topo * s - 15 * s;
    var depois = est.frascos[a.de].length;                   // o que fica no frasco no fim (o motor já fez a jogada)
    function angulo(m) { var hc = (depois + a.q - m) * UH; return Math.min(1.5, Math.atan2(-md.topo - hc, md.w * 0.5) * 0.9 + 0.16); }
    var m, ang, x, y, fio = 0, e;
    if (a.t < a.tIda) { e = suave(a.t / a.tIda); m = 0; ang = angulo(0) * e; x = casaX + (alvoX - casaX) * e; y = (casaY - a.sobe0 * LEVANTA * s) + (alvoY - (casaY - a.sobe0 * LEVANTA * s)) * e; }
    else if (a.t < a.tIda + a.tVerte) { var u = (a.t - a.tIda) / a.tVerte; m = a.q * u; ang = angulo(m); x = alvoX; y = alvoY; fio = Math.min(1, u * 7, (1 - u) * 7); }
    else { e = suave((a.t - a.tIda - a.tVerte) / a.tVolta); m = a.q; ang = angulo(a.q) * (1 - e); x = alvoX + (casaX - alvoX) * e; y = alvoY + (casaY - alvoY) * e; }
    return { x: x, y: y, ang: ang * a.dir, m: m, fio: fio };
  }

  function unidades(i, escondeTopo) {
    var f = est.frascos[i], vs = est.vistos[i], u = [];
    for (var k = 0; k < f.length; k++) u.push({ c: f[k], visto: vs[k] && !(escondeTopo && k === f.length - 1) });
    return u;
  }
  function desenhar() {
    var s = lay.s, md = lay.md, dpr = lay.dpr, tema = D.CENARIOS[pref.cenario], i, a, p;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, lay.W, lay.H);
    lay.fileiras.forEach(function (f) { D.prateleira(ctx, f.x, f.y, f.w, f.h, tema); });
    var poses = {}, recebe = {};
    for (i = 0; i < anims.length; i++) { a = anims[i]; p = pose(a); poses[a.de] = { a: a, p: p }; recebe[a.para] = (recebe[a.para] || 0) + (a.q - p.m); }
    // os fios de líquido (por trás do vidro do frasco que recebe)
    for (i = 0; i < anims.length; i++) {
      a = anims[i]; p = poses[a.de].p;
      if (p.fio > 0) {
        var nivelPara = lay.casas[a.para].y - (est.frascos[a.para].length - (a.q - p.m)) * D.UH * s;
        D.fio(ctx, p.x + a.dir * 1.5 * s, p.y - 1, nivelPara + 2, 6.5 * s * (0.55 + 0.45 * p.fio), D.CORES[a.cor].hex, relogio);
      }
    }
    var pulso = 0.5 + 0.5 * Math.sin(relogio * 6);
    function um(i2, emPe) {
      var v = vb[i2], c = lay.casas[i2], f = est.frascos[i2], o;
      o = { unidades: unidades(i2, false), t: relogio + v.pisca, tema: tema, simbolos: pref.simbolos, bolhas: v.bolhas, ondinha: CALMO ? 0 : 0.7 + v.ondaA * 14,
        onda: v.ondaA * Math.sin(v.ondaT * 9), rolha: v.rolha, brilho: v.rolhaAlvo ? v.brilho * (0.75 + 0.25 * Math.sin(relogio * 2.2 + v.pisca)) : 0,
        destaque: dicaPar && (dicaPar[0] === i2 || dicaPar[1] === i2) ? pulso : 0, extra: i2 >= est.frascos.length - est.extras,
        coberto: est.cobertos.indexOf(i2) >= 0, revela: v.revela };
      ctx.save();
      if (emPe) {
        var tr = v.treme > 0 ? Math.sin(v.treme * 30) * 4 * v.treme * s : 0, esc = s * (0.6 + 0.4 * suave(v.nasce));
        ctx.translate(c.x + tr, c.y - v.sobe * LEVANTA * s); ctx.scale(esc, esc); ctx.globalAlpha = Math.min(1, v.nasce * 1.5);
        if (recebe[i2]) o.ajuste = { q: -recebe[i2] };
        o.ang = 0;
      } else {
        var q = poses[i2];
        ctx.translate(q.p.x, q.p.y); ctx.rotate(q.p.ang); ctx.scale(s, s); ctx.translate(-q.a.dir * md.nw / 2, -md.topo);
        o.ang = q.p.ang; o.onda = 0; o.ajuste = { c: q.a.cor, q: q.a.q - q.p.m };
        o.unidades = unidades(i2, q.a.revelou);
      }
      D.frasco(ctx, md, o);
      ctx.restore();
    }
    for (i = 0; i < est.frascos.length; i++) if (!poses[i]) um(i, true);
    for (i = 0; i < est.frascos.length; i++) if (poses[i]) um(i, false);
    // dica: o número 1 em cima do frasco de onde sai e o 2 em cima do que recebe
    if (dicaPar) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '700 ' + Math.round(17 * s) + 'px Fredoka, system-ui, sans-serif';
      dicaPar.forEach(function (n, k) {
        var c = lay.casas[n], y = c.y + (md.topo - 26) * s - vb[n].sobe * LEVANTA * s - pulso * 5 * s;
        ctx.beginPath(); ctx.arc(c.x, y, 13 * s, 0, 7); ctx.fillStyle = '#ffce1f'; ctx.fill(); ctx.lineWidth = 2.5 * s; ctx.strokeStyle = '#17324d'; ctx.stroke();
        ctx.fillStyle = '#17324d'; ctx.fillText(String(k + 1), c.x, y + 1);
      });
    }
    for (i = 0; i < faiscas.length; i++) {
      var z = faiscas[i]; if (z.idade < 0) continue;
      var al = Math.max(0, Math.min(1, (z.vida - z.idade) / 0.4));
      ctx.globalAlpha = al;
      if (z.tipo === 'estrela') D.estrelinha(ctx, z.x, z.y, z.r * (0.6 + 0.4 * Math.sin(z.idade * 12)), z.giro, z.cor);
      else if (z.tipo === 'gota') { ctx.fillStyle = z.cor; ctx.beginPath(); ctx.arc(z.x, z.y, z.r * 0.7, 0, 7); ctx.fill(); }
      else { ctx.save(); ctx.translate(z.x, z.y); ctx.rotate(z.giro); ctx.fillStyle = z.cor; ctx.fillRect(-z.r, -z.r * 0.45 * Math.cos(z.idade * 7), z.r * 2, z.r * 0.9 * Math.cos(z.idade * 7)); ctx.restore(); }
      ctx.globalAlpha = 1;
    }
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { ultimoTs = 0; pedirQuadro(); } });

  // ---------- lojinha de brincadeira ----------
  function montarLoja() {
    pintarGotas();
    montarVitrine($('lojaFrascos'), D.ORDEM_FRASCOS, D.FRASCOS, 'frascos', 'frasco', function (id) {
      var cv = document.createElement('canvas'), md = D.medidas(id, 3), dpr = Math.min(2, window.devicePixelRatio || 1), W = 84, H = 150;
      cv.width = W * dpr; cv.height = H * dpr; cv.className = 'amostra'; cv.setAttribute('aria-hidden', 'true');
      var c2 = cv.getContext('2d'); c2.setTransform(dpr, 0, 0, dpr, 0, 0); c2.translate(W / 2, H - 8);
      D.frasco(c2, md, { unidades: [{ c: 6 }, { c: 2 }, { c: 0 }], t: 0, tema: D.CENARIOS.chuva, ang: 0 });
      return cv;
    });
    montarVitrine($('lojaCenarios'), D.ORDEM_CENARIOS, D.CENARIOS, 'cenarios', 'cenario', function (id) {
      var d = document.createElement('span'); d.className = 'amostra cena cen-' + id; d.setAttribute('aria-hidden', 'true'); return d;
    });
  }
  function montarVitrine(onde, ordem, itens, lista, emUso, amostra) {
    onde.innerHTML = '';
    ordem.forEach(function (id) {
      var it = itens[id], tem = pref.tem[lista].indexOf(id) >= 0, usando = pref[emUso] === id, falta = it.preco - pref.gotas;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'item' + (usando ? ' usando' : '') + (!tem && falta > 0 ? ' caro' : '');
      b.id = 'item-' + id; b.setAttribute('aria-pressed', String(usando));
      b.appendChild(amostra(id));
      var n = document.createElement('span'); n.className = 'item-nome'; n.textContent = t(it.pt, it.en); b.appendChild(n);
      var e = document.createElement('span'); e.className = 'item-estado';
      e.textContent = usando ? t('✔ em uso', '✔ in use') : tem ? t('usar', 'use') : falta > 0 ? '💧 ' + it.preco + t(' · faltam ', ' · need ') + falta : '💧 ' + it.preco + t(' · trocar', ' · get it');
      b.appendChild(e);
      b.addEventListener('click', function () {
        Som.acordar();
        if (!tem) {
          if (pref.gotas < it.preco) { Som.erro(); b.classList.remove('nao'); void b.offsetWidth; b.classList.add('nao'); return; }
          pref.gotas -= it.preco; pref.tem[lista].push(id); Som.brilho();
        } else Som.vidro();
        pref[emUso] = id; salvarPref(); montarLoja();
        var novo = $('item-' + id); if (novo) novo.focus();
      });
      onde.appendChild(b);
    });
  }

  traduzir();

  // ---------- música: a trilha comum (../trilha.js), com gravações animadas da pasta da Purpurina ----------
  var M_ = '../purpurina/musicas/', AU = 'Kevin MacLeod', LIC = 'CC BY 4.0';
  var MUSICAS = [
    { a: M_ + 'c-funk.mp3', t: 'C-Funk', au: AU, lic: LIC },
    { a: M_ + 'boogie-party.mp3', t: 'Boogie Party', au: AU, lic: LIC },
    { a: M_ + 'celebration.mp3', t: 'Celebration', au: AU, lic: LIC },
    { a: M_ + 'got-funk.mp3', t: 'Got Funk', au: AU, lic: LIC },
    { a: M_ + 'glitter-blast.mp3', t: 'Glitter Blast', au: AU, lic: LIC },
    { a: M_ + 'who-likes-to-party.mp3', t: 'Who Likes to Party', au: AU, lic: LIC },
    { a: M_ + 'club-seamus.mp3', t: 'Club Seamus', au: AU, lic: LIC },
    { a: M_ + 'miami-viceroy.mp3', t: 'Miami Viceroy', au: AU, lic: LIC },
    { a: M_ + 'cloud-dancer.mp3', t: 'Cloud Dancer', au: AU, lic: LIC },
    { a: M_ + 'beauty-flow.mp3', t: 'Beauty Flow', au: AU, lic: LIC },
    { a: M_ + 'your-call.mp3', t: 'Your Call', au: AU, lic: LIC },
    { a: M_ + 'newer-wave.mp3', t: 'Newer Wave', au: AU, lic: LIC }
  ];
  if (window.Trilha) window.Trilha.iniciar({ jogo: 'aqua', musicas: MUSICAS, creditos: 'CREDITOS.md' });

  // ---------- instalar e service worker ----------
  var promptInstalar = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); promptInstalar = e; $('btInstalar').hidden = false; });
  $('btInstalar').addEventListener('click', function () { if (!promptInstalar) return; promptInstalar.prompt(); promptInstalar = null; $('btInstalar').hidden = true; });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });

  // para os testes
  window.AquaApp = {
    estado: function () { return est; }, nivel: function () { return nivel; }, fase: function () { return fase; }, versao: APP_VERSION, MUSICAS: MUSICAS,
    pref: function () { return pref; }, usos: function () { return usos; }, tela: function () { return atual; }, lay: function () { return lay; },
    animando: function () { return anims.length; }, dica: function () { return dicaPar; }, assentar: terminarAnims, fim: function () { return fimDeFase; }, LIMITES: LIMITES
  };
})();

/* Botão "📲 Instalar" do Bolinho de Chuva: o cartão abre o jogo com ?instalar=1 e só então carrega a barra
   "Instalar o aplicativo" (instalar.js, na raiz do repositório kids). Quem só quer jogar não baixa nada a mais. */
(function () {
  if (!/[?&]instalar\b/.test(location.search) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.src = '../instalar.js';
  document.body.appendChild(s);
})();
