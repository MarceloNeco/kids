/* Meu Pequeno Amiguinho — as regras, sem tela (roda no navegador e no Node, para os testes):
   montar o amiguinho (bichinho, pelo, coração e fofura, roupa, acessórios, voz, nome), a Encomenda do nível Difícil
   (pedido + estrelas por acerto) e a coleção guardada no aparelho (localStorage), com os dois amiguinhos de exemplo. */
(function (raiz) {
  'use strict';
  var D = raiz.AmiguinhoDados || (typeof require === 'function' ? require('./dados.js') : null);
  var R = {};
  var CAIXAS = D.CAIXAS.map(function (c) { return c.id; });

  function hoje() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  R.hoje = hoje;
  function novoId() { return 'a' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
  function copia(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- opções de cada nível (Fácil = menos opções) ---------- */
  R.opcoes = function (lista, nivel) { return nivel === 'facil' ? lista.filter(function (x) { return x.facil; }) : lista.slice(); };

  /* ---------- um amiguinho novo, com as escolhas padrão (pronto para "Pronto!" a qualquer momento) ---------- */
  R.novo = function (base) {
    var b = D.base[base] || D.BASES[0];
    return { id: novoId(), base: b.id, corpo: b.corpos[0], pelo: b.pelo, olhos: b.olhos || 'preto', estiloOlho: 'brilho', bochecha: 'rosa',
      coracao: 'rosa', desejo: false, fofura: 70, roupa: 'nenhuma', corRoupa: null, estampa: null, patch: 'nenhum',
      acess: {}, corAcess: {}, voz: 'fina', som: null, frases: [{ pronta: 'teamo' }], frase: 0, crianca: '',
      nome: b.apelido[0], nomeFilhote: '', padrinho: '', nasceu: hoje() };
  };
  R.escolherBase = function (a, id) {
    var b = D.base[id]; if (!b) return false;
    var nomeEraPadrao = !a.nome || D.BASES.some(function (x) { return x.apelido.indexOf(a.nome) >= 0; });
    a.base = b.id; a.corpo = b.corpos[0]; a.pelo = b.pelo; a.olhos = b.olhos || 'preto';
    if (nomeEraPadrao) a.nome = b.apelido[0];
    R.limparProibidos(a);
    return true;
  };
  R.escolherCorpo = function (a, corpo) { var b = D.base[a.base]; if (!b || b.corpos.indexOf(corpo) < 0) return false; a.corpo = corpo; R.limparProibidos(a); return true; };
  R.vestir = function (a, id) {
    var r = D.roupa[id]; if (!r) return false;
    a.roupa = id; var pad = r.padrao || {};
    a.corRoupa = r.cores ? (pad.cor || 'rosa') : null; a.estampa = r.estampa ? (pad.estampa || 'lisa') : null;
    return true;
  };
  R.corRoupa = function (a, cor) { var r = D.roupa[a.roupa]; if (!r || !r.cores || !D.CORES[cor]) return false; a.corRoupa = cor; return true; };
  R.estampa = function (a, est) { var r = D.roupa[a.roupa]; if (!r || !r.estampa || !D.estampa[est]) return false; a.estampa = est; return true; };

  /* ---------- acessórios: um por caixinha, vários ao mesmo tempo ---------- */
  R.podeUsar = function (a, id) { var it = D.acess[id]; return !!it && !(it.so && it.so !== a.corpo); };
  R.porAcess = function (a, id) {
    var it = D.acess[id]; if (!it || !R.podeUsar(a, id)) return false;
    a.acess = a.acess || {};
    a.acess[it.caixa] = id;
    D.CONFLITOS.forEach(function (par) {
      var outro = par[0] === id ? par[1] : par[1] === id ? par[0] : null;
      if (outro) { var cx = D.acess[outro].caixa; if (a.acess[cx] === outro) delete a.acess[cx]; }
    });
    return true;
  };
  R.tirarAcess = function (a, caixa) { if (a.acess) delete a.acess[caixa]; };
  R.alternarAcess = function (a, id) { var it = D.acess[id]; if (it && a.acess && a.acess[it.caixa] === id) { R.tirarAcess(a, it.caixa); return false; } return R.porAcess(a, id); };
  R.corAcess = function (a, id, cor) { var it = D.acess[id]; if (!it || !it.paleta || D.PALETAS[it.paleta].indexOf(cor) < 0) return false; a.corAcess = a.corAcess || {}; a.corAcess[id] = cor; return true; };
  R.limparProibidos = function (a) { Object.keys(a.acess || {}).forEach(function (cx) { if (!R.podeUsar(a, a.acess[cx])) delete a.acess[cx]; }); };
  R.quantosAcess = function (a) { return Object.keys(a.acess || {}).length; };

  /* ---------- coração e fofura ---------- */
  R.zonaFofura = function (f) { return f < 45 ? 'pouco' : f <= 85 ? 'ponto' : 'cheio'; };
  R.encher = function (a, quanto) { a.fofura = Math.max(0, Math.min(120, (a.fofura || 0) + quanto)); return a.fofura; };
  R.apertao = function (a) { return R.encher(a, -15); };
  // soltar o botão: no ponto = estrelinhas (3 bem no meio, 2 no resto do ponto)
  R.estrelinhasFofura = function (f) { var z = R.zonaFofura(f); return z !== 'ponto' ? 0 : (f >= 60 && f <= 75 ? 3 : 2); };

  /* ---------- frases e voz ---------- */
  var LI = { pt: 0, en: 1, es: 2 };
  R.textoFrase = function (fr, lang, crianca) {
    if (!fr) return '';
    var i = LI[lang] || 0, t;
    if (fr.pronta && D.frase[fr.pronta]) t = D.frase[fr.pronta].t[i];
    else t = String(fr.texto || '').slice(0, 60);
    var c = String(crianca || '').trim().slice(0, 20);
    return t.replace(/\{, c\}/g, c ? ', ' + c : '').replace(/\{c\}/g, c);
  };

  /* ---------- Encomenda (nível Difícil): o cartão pede, a criança monta igual, estrelas por acerto ---------- */
  function sorteador(semente) { var s = ((semente >>> 0) * 2654435761 >>> 0) || 1; var f = function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; f(); f(); f(); return f; }
  function um(lista, r) { return lista[Math.floor(r() * lista.length)]; }
  R.novaEncomenda = function (semente) {
    var r = sorteador(semente == null ? Date.now() : semente);
    var b = um(D.BASES, r);
    var lisos = D.PELOS.filter(function (p) { return !p.grad && !p.brilho; }).map(function (p) { return p.id; });
    var roupa = um(D.ROUPAS.filter(function (x) { return x.id !== 'nenhuma'; }), r);
    var e = { base: b.id, pelo: r() < 0.5 ? b.pelo : um(lisos, r), roupa: roupa.id, corRoupa: roupa.cores ? um(D.PALETAS[roupa.paleta || 'roupa'], r) : null, acess: {} };
    var caixas = ['laco', 'cabeca', 'olhos', 'pescoco', 'costas', 'mao', 'pes', 'chao'], n = 1 + Math.floor(r() * 2);
    for (var k = 0; k < n; k++) {
      var cx = um(caixas, r), its = D.ACESS.filter(function (it) { return it.caixa === cx && !it.so; });
      if (roupa.capuz && cx === 'cabeca') continue;
      var it = um(its, r); if (!it || e.acess[cx]) continue;
      if ((cx === 'pes' && e.acess.chao) || (cx === 'chao' && e.acess.pes === 'patins')) continue;
      e.acess[cx] = { id: it.id, cor: it.paleta && (cx === 'laco' || cx === 'olhos') ? um(D.PALETAS[it.paleta], r) : null };
    }
    if (r() < 0.5) e.coracao = um(D.CORACOES, r).id;
    if (r() < 0.5) e.fofura = r() < 0.7 ? 'ponto' : 'cheio';
    return e;
  };
  function corNome(id, i) { return D.CORES[id] ? D.CORES[id].n[i] : ''; }
  // o pedido em palavras ("Quero uma coelhinha de pelo rosa, de pijaminha lilás, com laço azul e patins.")
  R.textoEncomenda = function (e, lang) {
    var i = LI[lang] || 0, b = D.base[e.base], pelo = D.pelo[e.pelo], roupa = D.roupa[e.roupa];
    var art = i === 0 ? (b.g === 'f' ? 'uma ' : 'um ') : i === 1 ? (/^[aeiou]/i.test(b.esp[1]) ? 'an ' : 'a ') : (b.g === 'f' ? 'una ' : 'un ');
    var partes = [];
    partes.push(art + b.esp[i] + [' de pelo ', ' with ', ' de pelo '][i] + pelo.n[i] + (i === 1 ? ' fur' : ''));
    if (e.corRoupa && i === 1) partes.push(roupa.e[1].replace(/^(in an? |in |dressed as an? |as the )/, '$1' + corNome(e.corRoupa, 1) + ' '));
    else partes.push(roupa.e[i] + (e.corRoupa ? ' ' + corNome(e.corRoupa, i) : ''));
    var acs = Object.keys(e.acess).map(function (cx) { var it = D.acess[e.acess[cx].id]; var c = e.acess[cx].cor; return it.e[i].replace('{c}', c ? corNome(c, i) : '').replace(/\s+/g, ' ').trim(); });
    if (e.coracao) acs.push(['coração ', '', 'corazón '][i] + D.coracao[e.coracao].n[i] + ['', ' heart', ''][i]);
    if (e.fofura) acs.push(e.fofura === 'cheio' ? ['bem gordinho de fofura', 'extra chubby and fluffy', 'bien gordito de relleno'][i] : ['fofinho no ponto certo', 'fluffed just right', 'blandito en su punto'][i]);
    var junta = function (l) { return l.length < 2 ? l.join('') : l.slice(0, -1).join(', ') + [' e ', ' and ', ' y '][i] + l[l.length - 1]; };
    var inicio = ['Quero ', 'I\'d like ', 'Quiero '][i];
    return inicio + partes.join(', ') + (acs.length ? [', com ', ', with ', ', con '][i] + junta(acs) : '') + '.';
  };
  // confere o amiguinho com o pedido: uma "casinha" por item pedido
  R.conferir = function (a, e) {
    var itens = [];
    itens.push({ k: 'base', ok: a.base === e.base });
    itens.push({ k: 'pelo', ok: a.pelo === e.pelo });
    itens.push({ k: 'roupa', ok: a.roupa === e.roupa });
    if (e.corRoupa) itens.push({ k: 'corRoupa', ok: a.roupa === e.roupa && a.corRoupa === e.corRoupa });
    Object.keys(e.acess).forEach(function (cx) {
      var pedido = e.acess[cx], tem = a.acess && a.acess[cx] === pedido.id;
      itens.push({ k: 'acess:' + pedido.id, ok: tem });
      if (pedido.cor) itens.push({ k: 'cor:' + pedido.id, ok: tem && ((a.corAcess && a.corAcess[pedido.id]) || D.acess[pedido.id].cor) === pedido.cor });
    });
    if (e.coracao) itens.push({ k: 'coracao', ok: a.coracao === e.coracao });
    if (e.fofura) itens.push({ k: 'fofura', ok: R.zonaFofura(a.fofura) === e.fofura });
    var acertos = itens.filter(function (x) { return x.ok; }).length, total = itens.length, f = acertos / total;
    return { itens: itens, acertos: acertos, total: total, estrelas: f === 1 ? 3 : f >= 0.7 ? 2 : 1 };
  };

  /* ---------- deixar um amiguinho lido do aparelho sempre válido ---------- */
  R.validar = function (x) {
    if (!x || typeof x !== 'object' || !D.base[x.base]) return null;
    var a = R.novo(x.base);
    ['id', 'nome', 'nomeFilhote', 'padrinho', 'nasceu', 'crianca'].forEach(function (k) { if (typeof x[k] === 'string') a[k] = x[k].slice(0, 40); });
    if (D.base[x.base].corpos.indexOf(x.corpo) >= 0) a.corpo = x.corpo;
    if (D.pelo[x.pelo]) a.pelo = x.pelo;
    if (D.olho[x.olhos]) a.olhos = x.olhos;
    if (D.ESTILOS_OLHO.some(function (e) { return e.id === x.estiloOlho; })) a.estiloOlho = x.estiloOlho;
    if (D.BOCHECHAS.some(function (e) { return e.id === x.bochecha; })) a.bochecha = x.bochecha;
    if (D.coracao[x.coracao]) a.coracao = x.coracao;
    if (typeof x.fofura === 'number') a.fofura = Math.max(0, Math.min(120, x.fofura));
    a.desejo = !!x.desejo;
    if (D.roupa[x.roupa]) { R.vestir(a, x.roupa); if (x.corRoupa) R.corRoupa(a, x.corRoupa); if (x.estampa) R.estampa(a, x.estampa); }
    if (D.patch[x.patch]) a.patch = x.patch;
    Object.keys(x.acess || {}).forEach(function (cx) { if (CAIXAS.indexOf(cx) >= 0 && D.acess[x.acess[cx]] && D.acess[x.acess[cx]].caixa === cx) R.porAcess(a, x.acess[cx]); });
    Object.keys(x.corAcess || {}).forEach(function (id) { R.corAcess(a, id, x.corAcess[id]); });
    if (D.voz[x.voz] && D.voz[x.voz].tipo === 'fala') a.voz = x.voz;
    if (D.voz[x.som] && D.voz[x.som].tipo === 'som') a.som = x.som;
    if (Array.isArray(x.frases)) {
      a.frases = x.frases.slice(0, 2).map(function (f) {
        if (!f || typeof f !== 'object') return { pronta: 'teamo' };
        var o = {};
        if (f.pronta && D.frase[f.pronta]) o.pronta = f.pronta; else o.texto = String(f.texto || '').slice(0, 60);
        if (f.gravada) { o.gravada = true; o.efeito = f.efeito !== false; }
        return o;
      });
      if (!a.frases.length) a.frases = [{ pronta: 'teamo' }];
    }
    a.frase = x.frase === 1 && a.frases.length > 1 ? 1 : 0;
    if (x.exemplo) a.exemplo = true;
    if (x.encomenda && typeof x.encomenda.estrelas === 'number') a.encomenda = { estrelas: Math.max(1, Math.min(3, x.encomenda.estrelas)), acertos: x.encomenda.acertos | 0, total: x.encomenda.total | 0 };
    return a;
  };

  /* ---------- os amiguinhos de exemplo (já prontos na coleção) ---------- */
  R.EXEMPLOS = [
    { id: 'ex-alice', exemplo: true, base: 'coala', corpo: 'pe', pelo: 'cinza-azul', olhos: 'azul', estiloOlho: 'cilios', bochecha: 'rosa', coracao: 'arco-iris', desejo: true,
      fofura: 70, roupa: 'vestido-nuvens', acess: { laco: 'laco-fitas', pes: 'tenis-brilho', colo: 'filhote' }, corAcess: { 'tenis-brilho': 'holo' },
      voz: 'fina', frases: [{ pronta: 'teamo' }, { pronta: 'abraco' }], nome: 'Alice', nomeFilhote: 'Kaká', nasceu: '2026-11-22' },
    { id: 'ex-coracaozinho', exemplo: true, base: 'ovelha', corpo: 'q', pelo: 'creme', olhos: 'avela', estiloOlho: 'brilho', bochecha: 'rosa', coracao: 'rosa', desejo: true,
      fofura: 72, roupa: 'noel', acess: {}, corAcess: {}, voz: 'fina', frases: [{ pronta: 'noite' }, { pronta: 'teamo' }], nome: 'Coraçãozinho', nasceu: '2026-11-22' }
  ];

  /* ---------- coleção no aparelho ---------- */
  var CHAVE = 'bolinho:meu-amiguinho:colecao', MAX = 60;
  R.Colecao = function (armazem) {
    var st = armazem || (typeof localStorage !== 'undefined' ? localStorage : null);
    function ler() { try { var v = JSON.parse(st.getItem(CHAVE) || '[]'); return Array.isArray(v) ? v.map(R.validar).filter(Boolean) : []; } catch (e) { return []; } }
    function gravar(l) { try { st.setItem(CHAVE, JSON.stringify(l)); return true; } catch (e) { return false; } }
    return {
      // os da criança (mais novos primeiro) e, no fim, os dois de exemplo
      listar: function () { return ler().concat(R.EXEMPLOS.map(function (x) { return R.validar(copia(x)); })); },
      meus: ler,
      obter: function (id) { var l = this.listar(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; },
      salvar: function (a) {
        var x = R.validar(copia(a)); if (!x) return false;
        if (x.exemplo || /^ex-/.test(x.id)) { x.exemplo = false; x.id = novoId(); }   // editar um exemplo vira um amiguinho novo
        var l = ler().filter(function (y) { return y.id !== x.id; });
        l.unshift(x); if (l.length > MAX) l.length = MAX;
        return gravar(l) ? x : false;
      },
      apagar: function (id) { if (/^ex-/.test(id)) return false; var l = ler(), n = l.length; l = l.filter(function (y) { return y.id !== id; }); return l.length < n && gravar(l); }
    };
  };
  R.CHAVE = CHAVE;

  raiz.AmiguinhoRegras = R;
  if (typeof module === 'object' && module.exports) module.exports = R;
})(typeof window !== 'undefined' ? window : globalThis);
