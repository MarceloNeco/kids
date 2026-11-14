/* Quem é? — A Meleca Adivinha aprende (sem tela; roda no Node para os testes).

   Quando a meleca perde, ela pergunta "Em quem você pensou?":
   - alguém novo ("meu irmão Theo") → vira um personagem aprendido, com as respostas daquela partida (os "não sei" não
     entram) e "É alguém da família ou da nossa casa?" = Sim;
   - alguém que já está na lista pronta → guarda só a CORREÇÃO das respostas daquele personagem neste aparelho.
   Nível: o que foi ensinado no Infantil vale em todos ('IFA'); no Família, 'FA'; no Adulto, só 'A'. Ensinar de novo o
   mesmo nome junta as respostas (a mais nova vale) e o nível fica o mais aberto dos dois.
   Fica SÓ neste aparelho (localStorage "bolinho:quem-e:aprendidos"): nome da família nunca vai para a internet nem
   para IA. Para levar a outro celular: exportar (arquivo) e importar no outro, juntando sem duplicar. O arquivo que
   chega é limpo: nome sem < >, emoji curto, só perguntas e respostas que existem.

   Área de adulto (0.5.0): criar um personagem com as perguntas que a própria meleca escolhe (proximaParaCriar: primeiro
   as do núcleo, depois as que separam dos "parecidos" que sobraram, até ninguém mais responder igual). Quem NÃO é da
   família (todos: true, "É alguém da família ou da nossa casa?" = Não) pode ir para o jogo de todo mundo: o arquivo
   de exportarParaTodos() leva só esses; o dono manda o arquivo e ele entra na lista pronta. Ninguém da família sai.

   QEAprender.criar({ armazenamento }) → { lista(), ensinar({ nome, emoji, nivel, historico, todos }), corrigir(id, historico),
     correcoes(), esquecer(id), marcarTodos(id, sim), exportar() → texto, exportarParaTodos() → texto | null,
     importar(texto) → { novos, juntados, correcoes } }
   QEAprender.proximaParaCriar({ personagens, nivel: 'I'|'F'|'A', respostas: { id: resp } })
     → { id, parecidos } | { fim: true, parecidos }   (parecidos = quem ainda responde igual a tudo) */
(function (raiz) {
  'use strict';
  var Q = raiz.QEPerguntasAdivinha || (typeof require === 'function' ? require('./adivinha-perguntas.js') : null);
  var CHAVE = 'bolinho:quem-e:aprendidos';
  var NIVEIS = { I: 'IFA', F: 'FA', A: 'A' };
  var RESP = { s: 1, p: 1, '?': 1, q: 1, n: 1 };
  var LIMITE = 500, MAX_TEXTO = 400000;   // no máximo 500 aprendidos; arquivo de importação até ~400 KB
  function tem(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function idValido(id) { return typeof id === 'string' && /^[a-z0-9-]{1,40}$/.test(id) && !tem(Object.prototype, id); }

  function normal(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }
  function limparNome(s) { return String(s || '').replace(/[<>&"'`\\\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40); }
  function limparEmoji(s) { s = String(s || '').replace(/[<>&"'`\\\s]/g, ''); return Array.from(s).slice(0, 2).join('') || '⭐'; }
  function limparResp(r) {
    var out = {};
    if (!r || typeof r !== 'object') return out;
    Object.keys(r).forEach(function (k) { if (tem(Q.POR_ID, k) && typeof r[k] === 'string' && tem(RESP, r[k]) && r[k] !== '?') out[k] = r[k]; });
    return out;
  }
  function abertos(a, b) { return (a + b).indexOf('I') >= 0 ? 'IFA' : (a + b).indexOf('F') >= 0 ? 'FA' : 'A'; }
  function slug(s) { return normal(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'alguem'; }

  function criar(op) {
    var arm = op.armazenamento;
    // o que estava guardado passa pela mesma limpeza da importação (pode ter vindo estragado)
    function ler() {
      var v = null; try { v = JSON.parse(arm.getItem(CHAVE) || 'null'); } catch (e) { v = null; }
      var limpo = { aprendidos: [], correcoes: {} }, usados = {};
      if (!v || typeof v !== 'object') return limpo;
      (Array.isArray(v.aprendidos) ? v.aprendidos : []).slice(0, LIMITE).forEach(function (x) {
        if (!x || typeof x !== 'object') return;
        var nome = limparNome(x.nome); if (!nome) return;
        var r = limparResp(x.r); r.casa = x.todos === true ? 'n' : 's';
        var id = idValido(x.id) && !usados[x.id] ? x.id : 'apr-' + slug(nome) + '-' + (limpo.aprendidos.length + 1); usados[id] = 1;
        var q = { id: id, nome: nome, emoji: limparEmoji(x.emoji), niveis: ['IFA', 'FA', 'A'].indexOf(x.niveis) >= 0 ? x.niveis : 'FA', r: r };
        if (x.todos === true) q.todos = true;
        limpo.aprendidos.push(q);
      });
      if (v.correcoes && typeof v.correcoes === 'object') Object.keys(v.correcoes).forEach(function (id) { if (!idValido(id)) return; var r = limparResp(v.correcoes[id]); if (Object.keys(r).length) limpo.correcoes[id] = r; });
      return limpo;
    }
    var d = ler();
    // devolve false quando não coube no aparelho (a tela avisa)
    function salvar() { try { arm.setItem(CHAVE, JSON.stringify(d)); return true; } catch (e) { return false; } }
    // nome (sem acento, minúsculo) → aprendido; ids usados (para não repetir id)
    var porNome = new Map(), ids = new Set();
    d.aprendidos.forEach(function (p) { porNome.set(normal(p.nome), p); ids.add(p.id); });
    function achar(nome) { return porNome.get(normal(nome)) || null; }
    function doHistorico(h) { var r = {}; (h || []).forEach(function (x) { if (x && x.r !== '?') r[x.id] = x.r; }); return limparResp(r); }
    function juntar(p, r) { Object.keys(r).forEach(function (k) { p.r[k] = r[k]; }); }

    // todos: true = não é da família (pode ir para a lista de todo mundo); undefined = não muda (novo: família)
    function guardar(nome, emoji, niveis, r, todos) {
      nome = limparNome(nome); if (!nome) return null;
      var p = achar(nome), novo = !p;
      if (novo && d.aprendidos.length >= LIMITE) return null;
      if (novo) {
        var id = 'apr-' + slug(nome), k = 2; while (ids.has(id)) id = 'apr-' + slug(nome) + '-' + (k++);
        p = { id: id, nome: nome, emoji: limparEmoji(emoji), niveis: niveis, r: {} };
        d.aprendidos.push(p); porNome.set(normal(nome), p); ids.add(id);
      } else { p.niveis = abertos(p.niveis, niveis); if (emoji) p.emoji = limparEmoji(emoji); }
      if (todos === true) p.todos = true; else if (todos === false) delete p.todos;
      juntar(p, r); p.r.casa = p.todos ? 'n' : 's';
      return { p: p, novo: novo };
    }

    return {
      armazenamento: arm,
      lista: function () { return d.aprendidos.map(function (p) { return { id: p.id, nome: p.nome, emoji: p.emoji, niveis: p.niveis, todos: !!p.todos, r: Object.assign({}, p.r) }; }); },
      ensinar: function (o) {
        var g = guardar(o.nome, o.emoji, tem(NIVEIS, o.nivel) ? NIVEIS[o.nivel] : 'FA', doHistorico(o.historico), typeof o.todos === 'boolean' ? o.todos : undefined); if (!g) return null;
        var ok = salvar(); return { id: g.p.id, nome: g.p.nome, emoji: g.p.emoji, niveis: g.p.niveis, todos: !!g.p.todos, r: Object.assign({}, g.p.r), guardado: ok };
      },
      // a mesma pessoa, agora da família (sim = false) ou para todo mundo (sim = true)
      marcarTodos: function (id, sim) {
        var p = d.aprendidos.filter(function (x) { return x.id === id; })[0]; if (!p) return false;
        if (sim) p.todos = true; else delete p.todos;
        p.r.casa = p.todos ? 'n' : 's'; return salvar();
      },
      corrigir: function (id, historico) {
        if (!idValido(id)) return false;
        var c = tem(d.correcoes, id) ? d.correcoes[id] : (d.correcoes[id] = {});
        var r = doHistorico(historico); Object.keys(r).forEach(function (k) { c[k] = r[k]; });
        return salvar();
      },
      correcoes: function () { return JSON.parse(JSON.stringify(d.correcoes)); },
      esquecer: function (id) {
        d.aprendidos = d.aprendidos.filter(function (p) { if (p.id === id) { porNome.delete(normal(p.nome)); ids.delete(id); return false; } return true; });
        if (tem(d.correcoes, id)) delete d.correcoes[id]; salvar();
      },
      exportar: function () { return JSON.stringify({ formato: 1, app: 'quem-e', quando: new Date().toISOString(), aprendidos: d.aprendidos, correcoes: d.correcoes }); },
      // só quem não é da família, sem as correções (que podem ter respostas da família): para a lista de todo mundo
      exportarParaTodos: function () {
        var l = d.aprendidos.filter(function (p) { return p.todos; });
        return l.length ? JSON.stringify({ formato: 1, app: 'quem-e', paraTodos: true, quando: new Date().toISOString(), aprendidos: l }) : null;
      },
      importar: function (texto) {
        if (typeof texto !== 'string' || texto.length > MAX_TEXTO) throw new Error('arquivo grande demais ou não é do Quem é?');
        var v; try { v = JSON.parse(texto); } catch (e) { throw new Error('arquivo não é do Quem é?'); }
        if (!v || v.app !== 'quem-e' || !Array.isArray(v.aprendidos)) throw new Error('arquivo não é do Quem é?');
        var res = { novos: 0, juntados: 0, correcoes: 0 };
        v.aprendidos.slice(0, LIMITE).forEach(function (x) {
          if (!x || typeof x !== 'object') return;
          var niveis = ['IFA', 'FA', 'A'].indexOf(x.niveis) >= 0 ? x.niveis : 'FA';
          var g = guardar(x.nome, x.emoji, niveis, limparResp(x.r), x.todos === true ? true : undefined); if (!g) return;
          if (g.novo) res.novos++; else res.juntados++;
        });
        if (v.correcoes && typeof v.correcoes === 'object') Object.keys(v.correcoes).forEach(function (id) {
          if (!idValido(id)) return;
          var r = limparResp(v.correcoes[id]); if (!Object.keys(r).length) return;
          var c = tem(d.correcoes, id) ? d.correcoes[id] : (d.correcoes[id] = {}); Object.keys(r).forEach(function (k) { c[k] = r[k]; }); res.correcoes++;
        });
        res.guardado = salvar(); return res;
      }
    };
  }

  // ---------- criar um personagem: a meleca escolhe a próxima pergunta ----------
  function sim(v) { return v === 's' || v === 'p'; }
  function nao(v) { return v === 'n' || v === 'q'; }
  var ORDEM = { I: 0, F: 1, A: 2 };
  function proximaParaCriar(o) {
    var nivel = tem(ORDEM, o.nivel) ? o.nivel : 'A', resp = o.respostas || {};
    var ps = Q.PERGUNTAS.filter(function (p) { return ORDEM[p.n] <= ORDEM[nivel] && p.id !== 'casa'; });
    function valorDe(c, p) { return tem(c.r, p.id) ? c.r[p.id] : p.padrao; }
    // parecidos: quem aparece neste nível e não contradiz nenhuma resposta dada
    var parecidos = (o.personagens || []).filter(function (c) {
      if (String(c.niveis || '').indexOf(nivel) < 0) return false;
      return ps.every(function (p) { var u = resp[p.id], v = valorDe(c, p); return !u || u === '?' || !((sim(u) && nao(v)) || (nao(u) && sim(v))); });
    });
    var faltam = ps.filter(function (p) { return !tem(resp, p.id); });
    var nucleo = faltam.filter(function (p) { return p.nucleo; });
    if (nucleo.length) return { id: nucleo[0].id, parecidos: parecidos };
    if (!parecidos.length) return { fim: true, parecidos: parecidos };
    var melhor = null, nota = 0;
    faltam.forEach(function (p) {
      var a = 0, b = 0;
      parecidos.forEach(function (c) { var v = valorDe(c, p); if (sim(v)) a++; else if (nao(v)) b++; });
      var x = Math.min(a, b) * 2 + (a + b) / 1000;          // a que divide melhor; empate: a que mais gente sabe
      if (a + b > 0 && x > nota) { nota = x; melhor = p; }
    });
    return melhor ? { id: melhor.id, parecidos: parecidos } : { fim: true, parecidos: parecidos };
  }

  var API = { criar: criar, CHAVE: CHAVE, LIMITE: LIMITE, proximaParaCriar: proximaParaCriar };
  raiz.QEAprender = API;
  if (typeof module === 'object' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
