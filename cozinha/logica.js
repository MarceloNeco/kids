/* Cozinha — regras do jogo, sem tela: cesta (o que tem e o que falta), moedas e troco, favores da vizinha,
   passos de cada nível e a ordem dos passos, o "imprevisto" do Difícil e as estrelas.
   Tudo aqui é função pura (ou mexe só no objeto que recebe), para os testes rodarem no Node. */
(function (raiz) {
  'use strict';
  var D = (typeof module !== 'undefined' && module.exports) ? require('./dados.js') : raiz.CozinhaDados;

  function nivelDe(n) { return typeof n === 'string' ? D.nivel[n] : n; }

  // ---------- ingredientes e passos do nível ----------
  function ingredientesDoNivel(rec, nivel) {
    var nv = nivelDe(nivel);
    if (nv.id === 'facil') return Object.keys(rec.facil).map(function (id) { return { id: id, q: rec.facil[id] }; });
    return rec.ing.map(function (x) { return { id: x.id, q: x.q }; });
  }

  function passosDoNivel(rec, nivel) {
    var nv = nivelDe(nivel), tem = {};
    ingredientesDoNivel(rec, nv).forEach(function (x) { tem[x.id] = true; });
    var res = {}, ant = null, lista = [];
    rec.passos.forEach(function (p) {
      var deps = p.dep ? p.dep : (ant ? [ant] : []);
      var resolvidas = [];
      deps.forEach(function (d) { (res[d] || []).forEach(function (r) { if (resolvidas.indexOf(r) < 0) resolvidas.push(r); }); });
      var ing = (p.ing || []).filter(function (i) { return tem[i]; });
      var fica = (p.min || 1) <= nv.n && !(p.ing && p.ing.length && !ing.length) && !(p.se && !p.se.some(function (i) { return tem[i]; }));
      if (fica) {
        var q = {}; for (var k in p) q[k] = p[k];
        q.ing = ing; q.dep = resolvidas; lista.push(q); res[p.id] = [p.id];
      } else res[p.id] = resolvidas;
      ant = p.id;
    });
    // lavar as mãos vem antes de tudo
    if (lista.length) lista.forEach(function (p, i) { if (i > 0 && !p.dep.length) p.dep = [lista[0].id]; });
    return lista;
  }

  function quantidade(rec, nivel, id) {
    var x = ingredientesDoNivel(rec, nivel).filter(function (i) { return i.id === id; })[0];
    return x ? x.q : 0;
  }

  // ---------- ordem dos passos ----------
  function achar(passos, id) { for (var i = 0; i < passos.length; i++) if (passos[i].id === id) return passos[i]; return null; }
  function podeFazer(passos, feitos, id) {
    var p = achar(passos, id);
    if (!p || feitos.indexOf(id) >= 0) return false;
    return p.dep.every(function (d) { return feitos.indexOf(d) >= 0; });
  }
  function faltamAntes(passos, feitos, id) {
    var p = achar(passos, id); if (!p) return [];
    return p.dep.filter(function (d) { return feitos.indexOf(d) < 0; });
  }
  function proximos(passos, feitos) { return passos.filter(function (p) { return podeFazer(passos, feitos, p.id); }).map(function (p) { return p.id; }); }
  function proximoNaOrdem(passos, feitos) { for (var i = 0; i < passos.length; i++) if (feitos.indexOf(passos[i].id) < 0) return passos[i].id; return null; }
  function ordemValida(passos, ordem) {
    if (ordem.length !== passos.length) return false;
    var feitos = [];
    for (var i = 0; i < ordem.length; i++) { if (!podeFazer(passos, feitos, ordem[i])) return false; feitos.push(ordem[i]); }
    return true;
  }

  // ---------- cesta ----------
  function por(cesta, id, n) { cesta[id] = (cesta[id] || 0) + (n == null ? 1 : n); if (cesta[id] <= 0) delete cesta[id]; return cesta; }
  function tirar(cesta, id, n) { return por(cesta, id, -(n == null ? 1 : n)); }
  function resumo(precisa, cesta) {
    return precisa.map(function (x) { var tem = cesta[x.id] || 0; return { id: x.id, precisa: x.q, tem: tem, falta: Math.max(0, x.q - tem) }; });
  }
  function faltando(precisa, cesta) { return resumo(precisa, cesta).filter(function (r) { return r.falta > 0; }); }
  function completa(precisa, cesta) { return faltando(precisa, cesta).length === 0; }

  // ---------- lugares ----------
  function lugaresDe(id, nivel) {
    var g = D.ingrediente[id], l = [];
    if (!g) return l;
    if (g.de) l.push(g.de);
    if (g.preco > 0) l.push('mercado');
    if (g.vizinha) l.push('vizinha');
    return l;
  }
  // menor número de lugares que juntos têm tudo (testa todas as combinações: são só 7 lugares)
  function lugaresMinimos(ids) {
    var lugs = D.LUGARES.filter(function (l) { return l.id !== 'casa'; }).map(function (l) { return l.id; });
    var melhor = Infinity;
    for (var m = 1; m < (1 << lugs.length); m++) {
      var esc = lugs.filter(function (l, i) { return m & (1 << i); });
      if (esc.length >= melhor) continue;
      if (ids.every(function (id) { return lugaresDe(id).some(function (l) { return esc.indexOf(l) >= 0; }); })) melhor = esc.length;
    }
    return melhor;
  }
  // lugares que ainda têm alguma coisa que falta (o mapa mostra um brilho)
  function lugaresUteis(precisa, cesta) {
    var u = {};
    faltando(precisa, cesta).forEach(function (r) { lugaresDe(r.id).forEach(function (l) { (u[l] = u[l] || []).push(r.id); }); });
    return u;
  }

  // ---------- moedas ----------
  function preco(id, nivel) { var nv = nivelDe(nivel); var g = D.ingrediente[id]; if (!g || !g.preco) return null; return nv.moedas ? g.preco : 0; }
  // o que só se consegue comprando (não tem na natureza nem com a vizinha)
  function custoSoMercado(rec, nivel) {
    return ingredientesDoNivel(rec, nivel).reduce(function (s, x) {
      var l = lugaresDe(x.id); return l.length === 1 && l[0] === 'mercado' ? s + D.ingrediente[x.id].preco * x.q : s;
    }, 0);
  }
  function moedasIniciais(rec, nivel) { var nv = nivelDe(nivel); return nv.moedas ? custoSoMercado(rec, nv) + nv.margem : 0; }
  // moedas da carteira: de 5, de 2 e de 1 (o menor número de moedas)
  function moedasPara(valor) {
    var r = [], v = Math.max(0, Math.floor(valor));
    [5, 2, 1].forEach(function (m) { while (v >= m) { r.push(m); v -= m; } });
    return r;
  }
  function soma(lista) { return lista.reduce(function (s, x) { return s + x; }, 0); }
  function troco(pago, valor) { return pago >= valor ? pago - valor : -1; }
  // compra no mercado: estado = { moedas, cesta }. Fácil: grátis. Devolve { ok, troco } ou { ok: false, motivo }
  function comprar(estado, id, nivel, pago) {
    var p = preco(id, nivel);
    if (p == null) return { ok: false, motivo: 'nao-vende' };
    if (p === 0) { por(estado.cesta, id, 1); return { ok: true, troco: 0, preco: 0 }; }
    if (estado.moedas < p) return { ok: false, motivo: 'sem-moedas', preco: p };
    if (pago == null) pago = p;
    if (pago < p) return { ok: false, motivo: 'pouco', preco: p };
    if (pago > estado.moedas) return { ok: false, motivo: 'sem-moedas', preco: p };
    estado.moedas -= p; por(estado.cesta, id, 1);
    return { ok: true, troco: troco(pago, p), preco: p };
  }
  // ajudar o Seu Zé a arrumar o mercadinho: só quando as moedas não dão para algo que ainda falta e só o mercado tem
  function precisaAjudar(estado, precisa, nivel) {
    var nv = nivelDe(nivel); if (!nv.moedas) return false;
    return faltando(precisa, estado.cesta).some(function (r) {
      var l = lugaresDe(r.id); return l.length === 1 && l[0] === 'mercado' && estado.moedas < D.ingrediente[r.id].preco;
    });
  }

  // ---------- favores da vizinha ----------
  // estado = { favores, cesta, pendente }. Pedir deixa o ingrediente "na mão da vizinha"; só vem para a cesta
  // depois do obrigado.
  function pedirFavor(estado, id) {
    var g = D.ingrediente[id];
    if (!g || !g.vizinha) return { ok: false, motivo: 'nao-tem' };
    if (estado.pendente) return { ok: false, motivo: 'pendente' };
    if (estado.favores <= 0) return { ok: false, motivo: 'sem-favor' };
    estado.pendente = id; return { ok: true };
  }
  function agradecer(estado) {
    if (!estado.pendente) return { ok: false };
    var id = estado.pendente; estado.pendente = null; estado.favores -= 1; por(estado.cesta, id, 1);
    return { ok: true, id: id };
  }

  // ---------- imprevisto do Difícil ----------
  // Ao chegar em casa com tudo, o cachorrinho leva 1 de alguma coisa que dá para buscar de novo de graça na natureza.
  function imprevisto(precisa, cesta, sorte) {
    var cand = precisa.filter(function (x) { var g = D.ingrediente[x.id]; return g.de && (cesta[x.id] || 0) > 0; }).map(function (x) { return x.id; });
    if (!cand.length) return null;
    var r = typeof sorte === 'function' ? sorte() : Math.random();
    return cand[Math.floor(r * cand.length) % cand.length];
  }

  // ---------- estrelas ----------
  function estrelas(o) {
    var e = 3;
    if (o.erros >= 3) e--;
    if (o.erros >= 6) e--;
    if (o.atrasou) e--;
    return Math.max(1, e);
  }

  // ---------- texto de cada passo ----------
  function nomeQtd(id, q, en) { var g = D.ingrediente[id], n = en ? g.en : g.pt; return q + ' ' + (q === 1 ? n[0] : n[1]); }
  function nomeIng(id, en, q) { var g = D.ingrediente[id], n = en ? g.en : g.pt; return q != null && q !== 1 ? n[1] : n[0]; }
  function juntar(l, en) { if (l.length <= 1) return l.join(''); return l.slice(0, -1).join(', ') + (en ? ' and ' : ' e ') + l[l.length - 1]; }
  function na(u, en) { return D.utensilio[u].na[en ? 1 : 0]; }
  function textoPasso(p, rec, nivel, en) {
    var q = function (id) { return quantidade(rec, nivel, id); };
    var lista = juntar(p.ing.map(function (id) { return nomeQtd(id, q(id), en); }), en);
    // texto próprio da receita; num passo de pôr, a lista vem junto para a criança saber o que escolher
    if (en ? p.en : p.pt) return (en ? p.en : p.pt) + (p.a === 'por' && lista ? ': ' + lista : '');
    switch (p.a) {
      case 'lavar': return p.ing.length ? (en ? 'Wash at the sink: ' + lista : 'Lave na pia: ' + lista)
        : (en ? 'Wash your hands well at the sink' : 'Lave bem as mãos na pia');
      case 'cortar': return en ? 'Cut on the board: ' + lista : 'Corte na tábua: ' + lista;
      case 'por': return en ? 'Put ' + lista + ' ' + na(p.u, true) : 'Coloque ' + lista + ' ' + na(p.u, false);
      case 'mexer': return en ? 'Stir ' + na(p.em, true) + ' with the spoon' : 'Mexa ' + na(p.em, false) + ' com a colher';
      case 'bater': return en ? 'Hold to blend ' + na(p.u, true) : 'Segure para bater ' + na(p.u, false);
      case 'ligar': return en ? 'Put the ' + D.utensilio[p.em].en.toLowerCase() + ' on the stove and turn it on' : 'Ponha a ' + D.utensilio[p.em].pt.toLowerCase() + ' no fogão e ligue o fogo';
      case 'desligar': return en ? 'Turn off the stove' : 'Desligue o fogão';
      case 'despejar': return en ? 'Pour what is ' + na(p.de, true) + ' ' + na(p.u, true).replace(/^in /, 'into ').replace(/^on /, 'onto ') : 'Despeje o que está ' + na(p.de, false) + ' ' + na(p.u, false);
      case 'virar': return en ? 'Flip it with the spatula when it is golden' : 'Vire com a espátula quando dourar';
      case 'assar': return en ? 'Bake it in the oven' : 'Leve ao forno para assar';
      case 'gelar': return en ? 'Put it in the fridge to chill' : 'Leve à geladeira para gelar';
      case 'esperar': return en ? 'Wait a little bit' : 'Espere um pouquinho';
      case 'maos': return en ? 'Shape it with your hands' : 'Modele com as mãos';
      case 'servir': return en ? 'Serve it ' + na(p.u, true) + ' 😋' : 'Sirva ' + na(p.u, false) + ' 😋';
    }
    return '';
  }

  var L = {
    ingredientesDoNivel: ingredientesDoNivel, passosDoNivel: passosDoNivel, quantidade: quantidade,
    podeFazer: podeFazer, faltamAntes: faltamAntes, proximos: proximos, proximoNaOrdem: proximoNaOrdem, ordemValida: ordemValida,
    por: por, tirar: tirar, resumo: resumo, faltando: faltando, completa: completa,
    lugaresDe: lugaresDe, lugaresMinimos: lugaresMinimos, lugaresUteis: lugaresUteis,
    preco: preco, custoSoMercado: custoSoMercado, moedasIniciais: moedasIniciais, moedasPara: moedasPara, soma: soma, troco: troco, comprar: comprar, precisaAjudar: precisaAjudar,
    pedirFavor: pedirFavor, agradecer: agradecer, imprevisto: imprevisto, estrelas: estrelas,
    textoPasso: textoPasso, nomeQtd: nomeQtd, nomeIng: nomeIng
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = L; else raiz.CozinhaLogica = L;
})(typeof self !== 'undefined' ? self : this);
