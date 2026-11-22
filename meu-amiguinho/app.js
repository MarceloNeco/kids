/* Meu Amiguinho — telas, etapas da oficina, máquina de fofura, voz, caixinha-casinha, certidão e coleção.
   Dados em dados.js (AmiguinhoDados), desenho em arte.js (AmiguinhoArte), regras e coleção em regras.js (AmiguinhoRegras),
   sons e vozes em voz.js (AmiguinhoVoz), pelúcia viva em vivo.js (AmiguinhoVivo). Com ?teste aparece window.AmiguinhoDebug.
   Versão: APP_VERSION aqui = VERSAO no sw.js = primeira entrada do versoes.json.
   Histórico: cada tela de dentro (cada etapa também) é uma entrada; o Voltar do celular volta uma etapa. */
(function () {
  'use strict';
  var APP_VERSION = '0.1.0', APP_DATA = '22/Nov/2026';
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
  var pref = Object.assign({ nivel: 'facil', efeitos: true }, lerJSON(CH_PREF, {}));
  if (!D.NIVEIS[pref.nivel]) pref.nivel = 'facil';
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
    document.title = t('Meu Amiguinho', 'My Little Buddy', 'Mi Amiguito') + ' — ' + t('Bolinho de Chuva', 'Rainy Day Donuts', 'Buñuelos de Lluvia') + ' · SolverONE';
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
  var amigo = null, etapa = 0, enc = null, encheuAgora = false, mostrado = null;
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
    document.querySelectorAll('[data-nivel]').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.nivel === pref.nivel)); });
    $('btEfeitos').textContent = pref.efeitos ? '🔊' : '🔇';
    var lista = col.listar();
    $('nColecao').textContent = String(lista.length);
    $('btContinuar').hidden = !lerJSON(CH_RASC, null);
    var est = $('estante'), mostrar3 = lista.slice(0, 3);
    est.innerHTML = mostrar3.map(function (x, i) { return '<div class="na-estante">' + A.svg(x, { id: 'es' + i }) + '</div>'; }).join('');
  }
  document.querySelectorAll('[data-nivel]').forEach(function (b) {
    b.addEventListener('click', function () { pref.nivel = b.dataset.nivel; salvarPref(); V.toque(); pintarMenu(); });
  });
  function comecar() {
    V.acordar();
    amigo = R.novo(); enc = D.NIVEIS[pref.nivel].encomenda ? R.novaEncomenda() : null; encheuAgora = false;
    guardarRascunho();
    ir({ tela: 'oficina', etapa: 0 });
  }
  $('btCriar').addEventListener('click', comecar);
  $('btContinuar').addEventListener('click', function () {
    var r = lerJSON(CH_RASC, null), a = r && R.validar(r.amigo);
    if (!a) { comecar(); return; }
    amigo = a; enc = r.enc || null; pref.nivel = r.nivel || pref.nivel; encheuAgora = true;
    ir({ tela: 'oficina', etapa: r.etapa || 0 });
  });
  $('btColecao').addEventListener('click', function () { V.toque(); ir({ tela: 'colecao' }); });
  $('btEfeitos').addEventListener('click', function () { pref.efeitos = !pref.efeitos; V.ligar(pref.efeitos); salvarPref(); pintarMenu(); V.toque(); });
  $('btAjuda').addEventListener('click', function () { $('ajuda').hidden = false; $('btFecharAjuda').focus(); });
  $('btFecharAjuda').addEventListener('click', function () { $('ajuda').hidden = true; $('btAjuda').focus(); });
  V.ligar(pref.efeitos);
  function guardarRascunho() { gravarJSON(CH_RASC, amigo ? { amigo: amigo, enc: enc, etapa: etapa, nivel: pref.nivel } : null); }

  /* ---------- a oficina ---------- */
  var vOf = null;   // a pelúcia viva da oficina
  function nivelTodas() { return D.NIVEIS[pref.nivel].todas; }
  function opcoes(lista) { return nivelTodas() ? lista.slice() : lista.filter(function (x) { return x.facil; }); }
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
    $('etConta').textContent = t((etapa + 1) + ' de 7', (etapa + 1) + ' of 7', (etapa + 1) + ' de 7');
    var pts = $('pontos'); pts.innerHTML = '';
    D.ETAPAS.forEach(function (x, i) { var l = document.createElement('li'); l.className = i === etapa ? 'atual' : i < etapa ? 'feito' : ''; pts.appendChild(l); });
    $('encomenda').hidden = !enc;
    if (enc) $('encTexto').textContent = R.textoEncomenda(enc, lingua);
    $('btProximo').hidden = etapa === 6;
    $('oficina').setAttribute('data-etapa', E.id);
    $('maquina').hidden = etapa !== 2; $('medidor').hidden = etapa !== 2;
    if (etapa === 2) { if (!$('maquina').firstChild) $('maquina').innerHTML = A.maquina({ id: 'mq' }); pintarMedidor(); }
    $('fala').hidden = true;
    atualizarPelucia();
    PAINEL[E.id]();
    if (E.id === 'bicho') mostrarFala(falaBase());
  }
  function irEtapa(n) { if (n < 0 || n > 6 || n === etapa) return; V.toque(); ir({ tela: 'oficina', etapa: n }); }
  $('btProximo').addEventListener('click', function () { irEtapa(etapa + 1); });
  $('btVoltar').addEventListener('click', function () { V.toque(); history.back(); });
  $('btPronto').addEventListener('click', function () { terminar(); });
  $('pontos').addEventListener('click', function (e) { var l = e.target.closest('li'); if (!l) return; irEtapa([].indexOf.call(l.parentNode.children, l)); });
  $('pelucia').addEventListener('click', function () { if (vOf) { vOf.tocar(); V.pop(); } });

  function mostrarFala(txt, ms) { var f = $('fala'); f.textContent = txt; f.hidden = !txt; clearTimeout(mostrarFala.t); if (ms) mostrarFala.t = setTimeout(function () { f.hidden = true; }, ms); }
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
  function rolarAteSel(caixa) { var s = caixa.querySelector('.sel'); if (s && s.scrollIntoView) try { s.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {} }
  var cacheMini = {};
  function mini(chave, f) { if (!cacheMini[chave]) cacheMini[chave] = f(); return cacheMini[chave]; }

  var PAINEL = {
    bicho: function () {
      var p = $('painel'); p.innerHTML = '';
      var L = linha(t('Escolha o seu bichinho', 'Choose your buddy', 'Elige tu animalito'), 'bichos');
      opcoes(D.BASES).forEach(function (b) {
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
      var p = $('painel'); p.innerHTML = '';
      var L1 = linha(t('Cor do pelo', 'Fur color', 'Color del pelo'));
      opcoes(D.PELOS).forEach(function (x) { L1.r.appendChild(opc(amostraPelo(x), amigo.pelo === x.id, tr(x.n), { pelo: x.id })); });
      var L2 = linha(t('Olhinhos', 'Eyes', 'Ojitos'));
      D.OLHOS.forEach(function (x) { L2.r.appendChild(opc(amostraCor(x.cor), amigo.olhos === x.id, tr(x.n), { olhos: x.id })); });
      D.ESTILOS_OLHO.forEach(function (x) { L2.r.appendChild(opc('<span>' + tr(x.n) + '</span>', amigo.estiloOlho === x.id, null, { estiloOlho: x.id })); });
      var L3 = linha(t('Bochechas', 'Cheeks', 'Mejillas'));
      D.BOCHECHAS.forEach(function (x) { L3.r.appendChild(opc('<span>' + tr(x.n) + '</span>', amigo.bochecha === x.id, null, { bochecha: x.id })); });
      p.appendChild(L1.l); p.appendChild(L2.l); p.appendChild(L3.l);
      rolarAteSel(L1.r);
    },
    fofura: function () {
      var p = $('painel'); p.innerHTML = '';
      var L1 = linha(t('Coraçãozinho', 'Little heart', 'Corazoncito'));
      opcoes(D.CORACOES).forEach(function (x) { L1.r.appendChild(opc('<i class="cor-coracao" style="' + (x.grad ? 'background:linear-gradient(135deg,' + x.grad.join(',') + ')' : 'background:' + x.cor) + '"></i>', amigo.coracao === x.id, tr(x.n), { coracao: x.id })); });
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
      var p = $('painel'); p.innerHTML = '';
      var L1 = linha(t('Guarda-roupa', 'Wardrobe', 'Armario'), 'cabides');
      opcoes(D.ROUPAS).forEach(function (r) {
        var svg = mini('cb-' + r.id + '-' + lingua, function () { var a = R.novo('urso'); R.vestir(a, r.id); a.lang = lingua; return A.cabide(a, r.id, { id: 'cb' + r.id }); });
        L1.r.appendChild(opc(svg + '<small>' + tr(r.n) + '</small>', amigo.roupa === r.id, tr(r.n), { roupa: r.id }));
      });
      p.appendChild(L1.l);
      var R0 = D.roupa[amigo.roupa];
      if (R0 && R0.cores) {
        var L2 = linha(t('Cor', 'Color', 'Color'));
        D.PALETAS[R0.paleta || 'roupa'].forEach(function (c) { L2.r.appendChild(opc(amostraCor(D.CORES[c].hex), amigo.corRoupa === c, tr(D.CORES[c].n), { corRoupa: c })); });
        p.appendChild(L2.l);
      }
      if (R0 && R0.estampa) {
        var L3 = linha(t('Estampa', 'Print', 'Estampado'));
        D.ESTAMPAS.forEach(function (x) { L3.r.appendChild(opc('<span>' + tr(x.n) + '</span>', amigo.estampa === x.id, null, { estampa: x.id })); });
        p.appendChild(L3.l);
      }
      if (amigo.roupa !== 'nenhuma') {
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
      var p = $('painel'); p.innerHTML = '';
      var balcao = el('div', 'balcao'); balcao.setAttribute('role', 'tablist'); balcao.setAttribute('aria-label', t('Balcão de acessórios', 'Accessory counter', 'Mostrador de accesorios'));
      var ICO = { laco: '🎀', cabeca: '👑', olhos: '👓', pescoco: '📿', pulso: '💎', costas: '🎒', mao: '🪄', colo: '🧸', abraco: '🦄', pes: '👟', chao: '🛹', apoio: '♿' };
      D.CAIXAS.forEach(function (cx) {
        var itens = opcoes(D.ACESS).filter(function (it) { return it.caixa === cx.id; });
        if (!itens.length) return;
        var tem = amigo.acess[cx.id];
        var b = el('button', 'acrilico' + (caixaAberta === cx.id ? ' aberta' : '') + (tem ? ' tem' : ''), '<span class="ico" aria-hidden="true">' + ICO[cx.id] + '</span><small>' + tr(cx.n) + '</small>');
        b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(caixaAberta === cx.id)); b.dataset.caixa = cx.id;
        balcao.appendChild(b);
      });
      p.appendChild(balcao);
      var it0 = D.caixa[caixaAberta];
      var L = linha(tr(it0.n), 'itens');
      L.r.appendChild(opc('<span>✕ ' + t('Nada', 'None', 'Nada') + '</span>', !amigo.acess[caixaAberta], null, { tirar: caixaAberta }));
      opcoes(D.ACESS).filter(function (it) { return it.caixa === caixaAberta; }).forEach(function (it) {
        var pode = R.podeUsar(amigo, it.id);
        var cor = (amigo.corAcess && amigo.corAcess[it.id]) || it.cor || '';
        var svg = mini('ac-' + amigo.base + amigo.corpo + amigo.pelo + it.id + cor, function () { var a = Object.assign({}, amigo, { corAcess: {} }); a.corAcess[it.id] = cor; return A.miniAcess(a, it.id, { id: 'ac' + it.id }); });
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
      }
      rolarAteSel(L.r);
    },
    voz: function () {
      var p = $('painel'); p.innerHTML = '';
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
      D.VOZES.filter(function (v) { return v.tipo === 'fala'; }).forEach(function (v) { L2.r.appendChild(opc('<span>' + v.ico + ' ' + tr(v.n) + '</span>', amigo.voz === v.id, null, { voz: v.id })); });
      D.VOZES.filter(function (v) { return v.tipo === 'som'; }).forEach(function (v) { L2.r.appendChild(opc('<span>' + v.ico + ' ' + tr(v.n) + '</span>', amigo.som === v.id, null, { som: v.id })); });
      p.appendChild(L2.l);
      p.appendChild(el('p', 'privado', t('🔒 A gravação fica só neste aparelho. Nada é enviado. Gravar a sua voz é o jeito mais fofo!', '🔒 The recording stays on this device only. Nothing is sent. Recording your own voice is the cutest way!', '🔒 La grabación se queda solo en este aparato. No se envía nada. ¡Grabar tu voz es lo más tierno!') + (pode ? '' : ' ' + t('(Este aparelho não deixa gravar: use uma frase pronta.)', '(This device can\'t record: use a ready phrase.)', '(Este aparato no puede grabar: usa una frase lista.)'))));
      $('btGravar').addEventListener('click', gravarFrase);
      $('chkEfeito').addEventListener('change', function () { if (amigo.frases[i].gravada) { amigo.frases[i].efeito = this.checked; guardarRascunho(); } });
    },
    nome: function () {
      var p = $('painel'); p.innerHTML = '';
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
  var caixaAberta = 'laco';
  function marcarProntas() { document.querySelectorAll('#painel [data-pronta]').forEach(function (b) { var fr = amigo.frases[amigo.frase || 0]; var s = !fr.gravada && fr.pronta === b.dataset.pronta; b.classList.toggle('sel', s); b.setAttribute('aria-checked', String(s)); }); }

  // escolhas (um ouvinte só para o painel inteiro)
  $('painel').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    var d = b.dataset, mudouDesenho = true, repintar = true;
    if (d.base) { if (amigo.base === d.base) return; R.escolherBase(amigo, d.base); mostrarFala(falaBase()); V.pop(); }
    else if (d.corpo) R.escolherCorpo(amigo, d.corpo);
    else if (d.pelo) amigo.pelo = d.pelo;
    else if (d.olhos) amigo.olhos = d.olhos;
    else if (d.estiloOlho) amigo.estiloOlho = d.estiloOlho;
    else if (d.bochecha) amigo.bochecha = d.bochecha;
    else if (d.coracao) { amigo.coracao = d.coracao; }
    else if (d.roupa) { R.vestir(amigo, d.roupa); if (vOf) setTimeout(function () { vOf.acao('cabeca'); }, 50); }
    else if (d.corRoupa) R.corRoupa(amigo, d.corRoupa);
    else if (d.estampa) R.estampa(amigo, d.estampa);
    else if (d.patch) amigo.patch = d.patch;
    else if (d.caixa) { caixaAberta = d.caixa; mudouDesenho = false; }
    else if (d.tirar) R.tirarAcess(amigo, d.tirar);
    else if (d.acess) { R.alternarAcess(amigo, d.acess); if (vOf) setTimeout(function () { vOf.acao('pulinho'); }, 50); }
    else if (d.corAcess) R.corAcess(amigo, d.item, d.corAcess);
    else if (d.frase) { amigo.frase = +d.frase; mudouDesenho = false; }
    else if (d.maisFrase) { amigo.frases.push({ pronta: 'abraco' }); amigo.frase = amigo.frases.length - 1; mudouDesenho = false; }
    else if (d.tirarFrase) { var k = +d.tirarFrase; if (amigo.frases[k] && amigo.frases[k].gravada) V.apagar(amigo.id + ':' + k); amigo.frases.splice(k, 1); if (!amigo.frases.length) amigo.frases = [{ pronta: 'teamo' }]; amigo.frase = 0; mudouDesenho = false; }
    else if (d.ouvir) { falarFrase(amigo, vOf, $('fala')); return; }
    else if (d.pronta) { var i = amigo.frase || 0; if (amigo.frases[i] && amigo.frases[i].gravada) V.apagar(amigo.id + ':' + i); amigo.frases[i] = { pronta: d.pronta }; mudouDesenho = false; falarFrase(amigo, vOf, $('fala')); }
    else if (d.voz) { amigo.voz = d.voz; mudouDesenho = false; falarFrase(amigo, vOf, $('fala')); }
    else if (d.som) { amigo.som = amigo.som === d.som ? null : d.som; mudouDesenho = false; if (amigo.som) V.somFofo(amigo.som); }
    else return;
    if (!d.ouvir && !d.pronta && !d.voz && !d.som) V.toque();
    if (mudouDesenho) atualizarPelucia(); else guardarRascunho();
    if (repintar) { var sx = {}; document.querySelectorAll('#painel .roda').forEach(function (r, k) { sx[k] = r.scrollLeft; }); PAINEL[D.ETAPAS[etapa].id](); document.querySelectorAll('#painel .roda').forEach(function (r, k) { if (sx[k] != null) r.scrollLeft = sx[k]; }); }
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
    if (fr.pronta && V.temPronta(fr.pronta, lingua)) { V.tocarArquivo('vozes/' + lingua + '/' + fr.pronta + '.mp3', acabou); return; }
    if (!V.falar(txt, a.voz, acabou)) setTimeout(acabou, 1400);
  }
  function gravarFrase() {
    var i = amigo.frase || 0, bt = $('btGravar'), barra = $('barraGrav');
    if (V.gravandoAgora()) { V.pararGravacao(); return; }
    V.calar();
    bt.textContent = t('⏹️ Parar', '⏹️ Stop', '⏹️ Parar');
    V.gravar(5000, function (f) { if (barra) barra.style.width = (f * 100) + '%'; }).then(function (blob) {
      return V.guardar(amigo.id + ':' + i, blob).then(function () {
        amigo.frases[i] = { gravada: true, efeito: $('chkEfeito') ? $('chkEfeito').checked : true };
        guardarRascunho(); PAINEL.voz(); falarFrase(amigo, vOf, $('fala'));
      });
    }).catch(function () {
      avisar(t('Não deu para usar o microfone. Escolha uma frase pronta. 💛', 'Couldn\'t use the microphone. Pick a ready phrase. 💛', 'No se pudo usar el micrófono. Elige una frase lista. 💛'), 3200);
      PAINEL.voz();
    });
  }

  /* ---------- Pronto! caixinha-casinha e o amiguinho pulando dela ---------- */
  function terminar() {
    V.acordar(); V.calar();
    if (enc) { var res = R.conferir(amigo, enc); amigo.encomenda = { estrelas: res.estrelas, acertos: res.acertos, total: res.total }; }
    if (!amigo.nome) amigo.nome = tr(D.base[amigo.base].apelido);
    var salvo = col.salvar(amigo);
    if (!salvo) { avisar(t('Não consegui guardar no aparelho (sem espaço?).', 'Couldn\'t save on this device (out of space?).', 'No pude guardar en el aparato (¿sin espacio?).'), 3500); return; }
    if (salvo.id !== amigo.id) { [0, 1].forEach(function (k) { if (amigo.frases[k] && amigo.frases[k].gravada) V.ler(amigo.id + ':' + k).then(function (b) { if (b) V.guardar(salvo.id + ':' + k, b); }); }); }
    gravarJSON(CH_RASC, null);
    mostrado = salvo; amigo = null; enc = null;
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
    $('amEstrelas').hidden = !a.encomenda;
    if (a.encomenda) $('amEstrelas').textContent = '⭐'.repeat(a.encomenda.estrelas) + '☆'.repeat(3 - a.encomenda.estrelas) + ' ' + t('Encomenda: ', 'Order: ', 'Encargo: ') + a.encomenda.acertos + '/' + a.encomenda.total;
    var pose = poseDe(a);
    if (!vAm) vAm = VIVO.criar($('peluciaAmigo'), a, { id: 'am', pose: pose, rotulo: a.nome });
    else vAm.trocar(a, { pose: pose });
    $('palcoAmigo').classList.toggle('q', a.corpo === 'q');
    $('palcoAmigo').classList.toggle('pendurada', pose === 'pendurada');
    $('btApagar').hidden = !!a.exemplo;
    $('btBrincar').textContent = pose === 'pendurada' ? t('🌿 Balançar', '🌿 Swing', '🌿 Columpiarse') : a.base === 'robo' ? t('💡 Carinha', '💡 Face', '💡 Carita') : a.corpo === 'q' ? t('🐾 Passear', '🐾 Walk', '🐾 Pasear') : t('👋 Acenar', '👋 Wave', '👋 Saludar');
    V.carregarProntas();
  }
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
    amigo = a; enc = null; encheuAgora = true; guardarRascunho();
    ir({ tela: 'oficina', etapa: 0 });
  });
  $('btNovo').addEventListener('click', function () { voltarMenu(comecar); });
  $('btApagar').addEventListener('click', function () { $('apagarJanela').hidden = false; $('btApagarNao').focus(); });
  $('btApagarNao').addEventListener('click', function () { $('apagarJanela').hidden = true; });
  $('btApagarSim').addEventListener('click', function () {
    var id = mostrado.id; $('apagarJanela').hidden = true;
    col.apagar(id); V.apagar(id + ':0'); V.apagar(id + ':1');
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
      estrelas: a.encomenda ? '⭐'.repeat(a.encomenda.estrelas) + ' ' + t('Encomenda entregue!', 'Order delivered!', '¡Encargo entregado!') : '',
      rodape: t('Feito com carinho no Bolinho de Chuva', 'Made with love at Rainy Day Donuts', 'Hecho con cariño en Buñuelos de Lluvia') };
  }
  $('btCertidao').addEventListener('click', function () {
    var a = mostrado;
    $('certDesenho').innerHTML = A.certidao(a, textosCertidao(a), { id: 'ct', pose: poseDe(a) });
    $('certJanela').hidden = false; $('btSalvarPng').focus(); V.brilho();
  });
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
      l.href = u; l.download = t('certidao-', 'certificate-', 'certificado-') + String(a.nome || 'amiguinho').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.png';
      document.body.appendChild(l); l.click(); l.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
      avisar(t('💾 Certidão salva no aparelho!', '💾 Certificate saved on this device!', '💾 ¡Certificado guardado en el aparato!'));
    }).catch(function () { avisar(t('Não deu para salvar a imagem aqui.', 'Couldn\'t save the picture here.', 'No se pudo guardar la imagen aquí.')); });
  });

  /* ---------- minha coleção (vitrine) ---------- */
  function pintarColecao() {
    if (!$('vitrineFundo').firstChild) $('vitrineFundo').innerHTML = A.vitrine({ id: 'vt' });
    var g = $('grade'); g.innerHTML = '';
    col.listar().forEach(function (a, i) {
      var b = el('button', 'cartao-amigo'); b.type = 'button'; b.dataset.id = a.id;
      var pd = A.pedacos(a, { id: 'cl' + i, pose: poseDe(a) }), miolo = '<g transform="translate(150 286) scale(0.5) translate(-150 -186)">' + pd.corpo + '</g>';
      b.innerHTML = A.caixinha({ id: 'ccx' + i, miolo: miolo, cor: ['#f7a8c8', '#a9d2f5', '#b5e5cd', '#f7df8c', '#cdb6ec'][i % 5] }).replace('<defs>', '<defs>' + pd.defs) +
        '<span class="nome">' + A.util.esc(a.nome || tr(D.base[a.base].apelido)) + (a.encomenda ? ' ' + '⭐'.repeat(a.encomenda.estrelas) : '') + '</span>';
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
    estado: function () { return { tela: tela, etapa: etapa, amigo: amigo ? JSON.parse(JSON.stringify(amigo)) : null, enc: enc, mostrado: mostrado ? mostrado.id : null, colecao: col.listar().length, pilha: pilha.length, nivel: pref.nivel }; },
    amigo: function () { return amigo; },
    encomendar: function (semente) { enc = R.novaEncomenda(semente); if (tela === 'oficina') pintarOficina(); return enc; },
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
  s.setAttribute('data-nome', 'Meu Amiguinho'); s.setAttribute('data-icone', 'icone-192.png');
  s.setAttribute('data-so-com', 'instalar'); s.setAttribute('data-flutuante', ''); s.setAttribute('data-sw', 'nao');
  document.body.appendChild(s);
})();
