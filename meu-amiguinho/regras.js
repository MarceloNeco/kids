/* Meu Pequeno Amiguinho — as regras, sem tela (roda no navegador e no Node, para os testes):
   montar o amiguinho (bichinho, pelo, coração e fofura, roupa, acessórios, voz, nome) e a coleção guardada no aparelho
   (localStorage), com os dois amiguinhos de exemplo. Sem níveis nem Encomenda (dono, 22/Nov/2026: "é só para desenho
   tranquilo"): tudo liberado sempre. */
(function (raiz) {
  'use strict';
  var D = raiz.AmiguinhoDados || (typeof require === 'function' ? require('./dados.js') : null);
  var R = {};

  function hoje() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  R.hoje = hoje;
  function novoId() { return 'a' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
  function copia(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- um amiguinho novo, com as escolhas padrão (pronto para "Pronto!" a qualquer momento) ---------- */
  R.novo = function (base) {
    var b = D.base[base] || D.BASES[0];
    return { id: novoId(), base: b.id, corpo: b.corpos[0], pelo: b.pelo, olhos: b.olhos || 'preto', estiloOlho: 'brilho', bochecha: 'rosa',
      coracao: 'rosa', desejo: false, fofura: 70, roupa: 'nenhuma', corRoupa: null, estampa: null, baixo: null, corBaixo: null, patch: 'nenhum',
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
  /* Roupa inteira × parte de baixo (dono, 22/Nov/2026): a roupa inteira (vestido, macacão, pijama, fantasia) tira a saia, o
     short ou a calça; a parte de baixo tira a roupa inteira. Parte de cima (blusa, camiseta, moletom, jaqueta, colete) e
     parte de baixo ficam juntas. Peça com so: 'pe' só para quem fica em pé. */
  R.podeVestir = function (a, id, baixo) { var r = (baixo ? D.baixo : D.roupa)[id]; return !!r && !(r.so && r.so !== a.corpo); };
  R.vestir = function (a, id) {
    var r = D.roupa[id]; if (!r || !R.podeVestir(a, id)) return false;
    a.roupa = id; var pad = r.padrao || {};
    a.corRoupa = r.cores ? (pad.cor || 'rosa') : null; a.estampa = r.estampa ? (pad.estampa || 'lisa') : null;
    if (r.grupo === 'inteira') { a.baixo = null; a.corBaixo = null; }
    return true;
  };
  R.vestirBaixo = function (a, id) {
    if (!id || id === 'nenhum') { a.baixo = null; a.corBaixo = null; return true; }
    var b = D.baixo[id]; if (!b || !R.podeVestir(a, id, true)) return false;
    a.baixo = id; a.corBaixo = b.cores ? ((b.padrao || {}).cor || 'rosa') : null;
    var r = D.roupa[a.roupa];
    if (r && r.grupo === 'inteira') { a.roupa = 'nenhuma'; a.corRoupa = null; a.estampa = null; }
    return true;
  };
  R.corBaixo = function (a, cor) { var b = D.baixo[a.baixo]; if (!b || !b.cores || D.PALETAS[b.paleta || 'roupa'].indexOf(cor) < 0) return false; a.corBaixo = cor; return true; };
  R.corRoupa = function (a, cor) { var r = D.roupa[a.roupa]; if (!r || !r.cores || !D.CORES[cor]) return false; a.corRoupa = cor; return true; };
  R.estampa = function (a, est) { var r = D.roupa[a.roupa]; if (!r || !r.estampa || !D.estampa[est]) return false; a.estampa = est; return true; };

  /* ---------- tom (barra ☀️ ↔ 🌙, como na Purpurina; dono, 22/Nov/2026) ---------- */
  // a.tom = { pelo, roupa, baixo, acess: { id } }, de -1 (bem mais claro) a 1 (bem mais escuro); 0 tira. Sem tom = a cor da paleta.
  R.tom = function (a, parte, v, id) {
    v = Math.round(Math.max(-1, Math.min(1, +v || 0)) * 100) / 100;
    if (Math.abs(v) < 0.03) v = 0;
    var T = a.tom && typeof a.tom === 'object' ? a.tom : {};
    if (parte === 'acess') {
      if (!D.acess[id]) return false;
      T.acess = T.acess || {};
      if (v) T.acess[id] = v; else delete T.acess[id];
      if (!Object.keys(T.acess).length) delete T.acess;
    } else if (parte === 'pelo' || parte === 'roupa' || parte === 'baixo') { if (v) T[parte] = v; else delete T[parte]; }
    else return false;
    if (Object.keys(T).length) a.tom = T; else delete a.tom;
    return true;
  };
  R.tomDe = function (a, parte, id) { var T = a && a.tom; if (!T) return 0; return (parte === 'acess' ? T.acess && T.acess[id] : T[parte]) || 0; };

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
  R.limparProibidos = function (a) {
    Object.keys(a.acess || {}).forEach(function (cx) { if (!R.podeUsar(a, a.acess[cx])) delete a.acess[cx]; });
    if (a.roupa && a.roupa !== 'nenhuma' && !R.podeVestir(a, a.roupa)) { a.roupa = 'nenhuma'; a.corRoupa = null; a.estampa = null; }
    if (a.baixo && !R.podeVestir(a, a.baixo, true)) { a.baixo = null; a.corBaixo = null; }
  };
  R.quantosAcess = function (a) { return Object.keys(a.acess || {}).length; };

  /* ---------- coração e fofura ---------- */
  R.zonaFofura = function (f) { return f < 45 ? 'pouco' : f <= 85 ? 'ponto' : 'cheio'; };
  R.encher = function (a, quanto) { a.fofura = Math.max(0, Math.min(120, (a.fofura || 0) + quanto)); return a.fofura; };
  R.apertao = function (a) { return R.encher(a, -15); };
  // soltar o botão: no ponto = estrelinhas (3 bem no meio, 2 no resto do ponto)
  R.estrelinhasFofura = function (f) { var z = R.zonaFofura(f); return z !== 'ponto' ? 0 : (f >= 60 && f <= 75 ? 3 : 2); };

  /* ---------- frases e voz ---------- */
  // voz de menininha ('f') ou de menininho ('m'): a escolha da criança; sem escolha (ou amiguinho antigo), o gênero do bichinho
  R.genero = function (a) { return a && (a.genero === 'f' || a.genero === 'm') ? a.genero : (a && D.base[a.base] && D.base[a.base].g === 'm' ? 'm' : 'f'); };
  var LI = { pt: 0, en: 1, es: 2 };
  R.textoFrase = function (fr, lang, crianca) {
    if (!fr) return '';
    var i = LI[lang] || 0, t;
    if (fr.pronta && D.frase[fr.pronta]) t = D.frase[fr.pronta].t[i];
    else t = String(fr.texto || '').slice(0, 60);
    var c = String(crianca || '').trim().slice(0, 20);
    return t.replace(/\{, c\}/g, c ? ', ' + c : '').replace(/\{c\}/g, c);
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
    if (x.baixo && D.baixo[x.baixo]) { R.vestirBaixo(a, x.baixo); if (x.corBaixo) R.corBaixo(a, x.corBaixo); }
    else if (!('baixo' in x) && D.roupa[a.roupa] && D.roupa[a.roupa].vinhaCom) {
      // guardado antes de 22/Nov/2026: a parte de cima vinha com a bermuda ou a calça dela; agora ela fica separada, igualzinha
      var vc = D.roupa[a.roupa].vinhaCom; R.vestirBaixo(a, vc[0]); R.corBaixo(a, vc[1]);
    }
    if (D.patch[x.patch]) a.patch = x.patch;
    // cada peça vai para a caixinha ATUAL dela (peças que mudaram de caixinha não se perdem); duas na mesma caixinha: fica a primeira
    Object.keys(x.acess || {}).forEach(function (k) { var it = D.acess[x.acess[k]]; if (it && !a.acess[it.caixa]) R.porAcess(a, it.id); });
    Object.keys(x.corAcess || {}).forEach(function (id) { R.corAcess(a, id, x.corAcess[id]); });
    if (x.tom && typeof x.tom === 'object') {   // (amiguinho antigo, sem tom: fica sem, com as cores de sempre)
      ['pelo', 'roupa', 'baixo'].forEach(function (k) { if (typeof x.tom[k] === 'number') R.tom(a, k, x.tom[k]); });
      Object.keys(x.tom.acess || {}).forEach(function (id) { if (typeof x.tom.acess[id] === 'number') R.tom(a, 'acess', x.tom.acess[id], id); });
    }
    if (D.voz[x.voz] && D.voz[x.voz].tipo === 'fala') a.voz = x.voz;
    if (D.voz[x.som] && D.voz[x.som].tipo === 'som') a.som = x.som;
    if (x.genero === 'f' || x.genero === 'm') a.genero = x.genero;
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
