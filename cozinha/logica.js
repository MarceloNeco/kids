/* Cozinha — regras do jogo, sem tela: cesta (o que tem e o que falta), moedas e troco, favores da vizinha,
   passos de cada nível e a ordem dos passos, o "imprevisto" do Difícil e as estrelas.
   Tudo aqui é função pura (ou mexe só no objeto que recebe), para os testes rodarem no Node. */
(function (raiz) {
  'use strict';
  var D = (typeof module !== 'undefined' && module.exports) ? require('./dados.js') : raiz.CozinhaDados;

  function nivelDe(n) { return typeof n === 'string' ? D.nivel[n] : n; }

  // ---------- ingredientes e passos do nível ----------
  // fator = porções (v0.8.0): a receita serve 2 pessoas; para mais gente as quantidades multiplicam (fatorDe)
  function ingredientesDoNivel(rec, nivel, fator) {
    var nv = nivelDe(nivel), f = fator || 1;
    if (nv.id === 'facil') return Object.keys(rec.facil).map(function (id) { return { id: id, q: rec.facil[id] * f }; });
    return rec.ing.map(function (x) { return { id: x.id, q: x.q * f }; });
  }
  // ---------- família à mesa (v0.8.0) ----------
  // quem vai comer: "eu" sempre; o nível limita quantos (Fácil 2, Médio 4, Difícil 6). Cada 2 pessoas = 1 porção.
  function maxPessoas(nivel) { return nivelDe(nivel).pessoas || 2; }
  function fatorDe(pessoas) { return Math.max(1, Math.ceil((pessoas || 1) / 2)); }
  // liga/desliga alguém da família na lista escolhida, respeitando o máximo do nível (o mais antigo sai para dar lugar)
  function alternarPessoa(lista, id, nivel) {
    var l = lista.filter(function (x) { return x !== 'eu'; }), i = l.indexOf(id);
    if (id === 'eu') return ['eu'].concat(l);
    if (i >= 0) l.splice(i, 1); else { l.push(id); while (l.length + 1 > maxPessoas(nivel)) l.shift(); }
    return ['eu'].concat(l);
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

  function quantidade(rec, nivel, id, fator) {
    var x = ingredientesDoNivel(rec, nivel, fator).filter(function (i) { return i.id === id; })[0];
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
  // lojas da vila (v0.10.0): mercadinho (tudo o que tem preço), padaria (pão, leite, queijo, manteiga: "padaria") e
  // feira (frutas e legumes, que também nascem no pomar e na horta)
  var LOJAS = ['mercado', 'padaria', 'feira'];
  function vende(loja, id) {
    var g = D.ingrediente[id]; if (!g || !(g.preco > 0)) return false;
    if (loja === 'mercado') return true;
    if (loja === 'padaria') return !!g.padaria;
    if (loja === 'feira') return g.de === 'pomar' || g.de === 'horta';
    return false;
  }
  function lugaresDe(id, nivel) {
    var g = D.ingrediente[id], l = [];
    if (!g) return l;
    if (g.de) l.push(g.de);
    LOJAS.forEach(function (loja) { if (vende(loja, id)) l.push(loja); });
    if (g.vizinha) l.push('vizinha');
    return l;
  }
  // só se consegue comprando (em alguma loja): não nasce na natureza nem a vizinha empresta
  function soCompra(id) { var l = lugaresDe(id); return l.length > 0 && l.every(function (x) { return LOJAS.indexOf(x) >= 0; }); }
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
  function custoSoMercado(rec, nivel, fator) {
    return ingredientesDoNivel(rec, nivel, fator).reduce(function (s, x) {
      return soCompra(x.id) ? s + D.ingrediente[x.id].preco * x.q : s;
    }, 0);
  }
  function moedasIniciais(rec, nivel, fator) { var nv = nivelDe(nivel); return nv.moedas ? custoSoMercado(rec, nv, fator) + nv.margem : 0; }
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
      return soCompra(r.id) && estado.moedas < D.ingrediente[r.id].preco;
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
  // lg = o idioma: 'pt', 'en' ou 'es' (true = 'en' e false = 'pt', como antes dos três idiomas)
  function cod(lg) { return lg === true ? 'en' : lg === 'en' || lg === 'es' ? lg : 'pt'; }
  var IX = { pt: 0, en: 1, es: 2 };
  function nomes(id, lg) { var g = D.ingrediente[id]; return g[cod(lg)] || g.pt; }
  function nomeQtd(id, q, lg) { var n = nomes(id, lg); return q + ' ' + (q === 1 ? n[0] : n[1]); }
  function nomeIng(id, lg, q) { var n = nomes(id, lg); return q != null && q !== 1 ? n[1] : n[0]; }
  function juntar(l, lg) { if (l.length <= 1) return l.join(''); return l.slice(0, -1).join(', ') + ({ pt: ' e ', en: ' and ', es: ' y ' })[cod(lg)] + l[l.length - 1]; }
  function na(u, lg) { var n = D.utensilio[u].na; return n[IX[cod(lg)]] || n[0]; }
  function textoPasso(p, rec, nivel, lg, fator) {
    lg = cod(lg);
    var q = function (id) { return quantidade(rec, nivel, id, fator); };
    var lista = juntar(p.ing.map(function (id) { return nomeQtd(id, q(id), lg); }), lg);
    // texto próprio da receita; num passo de pôr, a lista vem junto para a criança saber o que escolher
    if (p[lg]) return p[lg] + (p.a === 'por' && lista ? ': ' + lista : '');
    var en = lg === 'en', es = lg === 'es', t = function (pt, ing, esp) { return en ? ing : es ? esp : pt; };
    switch (p.a) {
      case 'lavar': return p.ing.length ? t('Lave na pia: ' + lista, 'Wash at the sink: ' + lista, 'Lava en el fregadero: ' + lista)
        : t('Lave bem as mãos na pia', 'Wash your hands well at the sink', 'Lávate bien las manos en el fregadero');
      case 'cortar': return t('Corte na tábua: ' + lista, 'Cut on the board: ' + lista, 'Corta en la tabla: ' + lista);
      case 'por': return t('Coloque ' + lista + ' ' + na(p.u, lg), 'Put ' + lista + ' ' + na(p.u, lg), 'Pon ' + lista + ' ' + na(p.u, lg));
      case 'mexer': return t('Mexa ' + na(p.em, lg) + ' com a colher', 'Stir ' + na(p.em, lg) + ' with the spoon', 'Remueve ' + na(p.em, lg) + ' con la cuchara');
      case 'bater': return t('Segure para bater ' + na(p.u, lg), 'Hold to blend ' + na(p.u, lg), 'Mantén pulsado para batir ' + na(p.u, lg));
      case 'ligar': return t('Ponha a ' + D.utensilio[p.em].pt.toLowerCase() + ' no fogão e ligue o fogo', 'Put the ' + D.utensilio[p.em].en.toLowerCase() + ' on the stove and turn it on',
        'Pon la ' + D.utensilio[p.em].es.toLowerCase() + ' en el fogón y enciende el fuego');
      case 'desligar': return t('Desligue o fogão', 'Turn off the stove', 'Apaga el fogón');
      case 'despejar': return t('Despeje o que está ' + na(p.de, lg) + ' ' + na(p.u, lg), 'Pour what is ' + na(p.de, lg) + ' ' + na(p.u, lg).replace(/^in /, 'into ').replace(/^on /, 'onto '),
        'Vierte ' + na(p.u, lg) + ' lo que hay ' + na(p.de, lg));
      case 'virar': return t('Vire com a espátula quando dourar', 'Flip it with the spatula when it is golden', 'Dale la vuelta con la espátula cuando se dore');
      case 'assar': return t('Leve ao forno para assar', 'Bake it in the oven', 'Mételo al horno para que se hornee');
      case 'gelar': return t('Leve à geladeira para gelar', 'Put it in the fridge to chill', 'Mételo en la nevera para que se enfríe');
      case 'esperar': return t('Espere um pouquinho', 'Wait a little bit', 'Espera un poquito');
      case 'maos': return t('Modele com as mãos', 'Shape it with your hands', 'Dale forma con las manos');
      case 'servir': return t('Sirva ' + na(p.u, lg) + ' 😋', 'Serve it ' + na(p.u, lg) + ' 😋', 'Sírvelo ' + na(p.u, lg) + ' 😋');
    }
    return '';
  }

  var L = {
    LOJAS: LOJAS, vende: vende, soCompra: soCompra, ingredientesDoNivel: ingredientesDoNivel, passosDoNivel: passosDoNivel, quantidade: quantidade, maxPessoas: maxPessoas, fatorDe: fatorDe, alternarPessoa: alternarPessoa,
    podeFazer: podeFazer, faltamAntes: faltamAntes, proximos: proximos, proximoNaOrdem: proximoNaOrdem, ordemValida: ordemValida,
    por: por, tirar: tirar, resumo: resumo, faltando: faltando, completa: completa,
    lugaresDe: lugaresDe, lugaresMinimos: lugaresMinimos, lugaresUteis: lugaresUteis,
    preco: preco, custoSoMercado: custoSoMercado, moedasIniciais: moedasIniciais, moedasPara: moedasPara, soma: soma, troco: troco, comprar: comprar, precisaAjudar: precisaAjudar,
    pedirFavor: pedirFavor, agradecer: agradecer, imprevisto: imprevisto, estrelas: estrelas,
    textoPasso: textoPasso, nomeQtd: nomeQtd, nomeIng: nomeIng
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = L; else raiz.CozinhaLogica = L;
})(typeof self !== 'undefined' ? self : this);
