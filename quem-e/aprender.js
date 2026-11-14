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

   QEAprender.criar({ armazenamento }) → { lista(), ensinar({ nome, emoji, nivel, historico }), corrigir(id, historico),
     correcoes(), esquecer(id), exportar() → texto, importar(texto) → { novos, juntados, correcoes } } */
(function (raiz) {
  'use strict';
  var Q = raiz.QEPerguntasAdivinha || (typeof require === 'function' ? require('./adivinha-perguntas.js') : null);
  var CHAVE = 'bolinho:quem-e:aprendidos';
  var NIVEIS = { I: 'IFA', F: 'FA', A: 'A' };
  var RESP = { s: 1, p: 1, '?': 1, q: 1, n: 1 };

  function normal(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }
  function limparNome(s) { return String(s || '').replace(/[<>&"'`\\\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40); }
  function limparEmoji(s) { s = String(s || '').replace(/[<>&"'`\\\s]/g, ''); return Array.from(s).slice(0, 2).join('') || '⭐'; }
  function limparResp(r) {
    var out = {};
    if (!r || typeof r !== 'object') return out;
    Object.keys(r).forEach(function (k) { if (Q.POR_ID[k] && RESP[r[k]] && r[k] !== '?') out[k] = r[k]; });
    return out;
  }
  function abertos(a, b) { return (a + b).indexOf('I') >= 0 ? 'IFA' : (a + b).indexOf('F') >= 0 ? 'FA' : 'A'; }
  function slug(s) { return normal(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'alguem'; }

  function criar(op) {
    var arm = op.armazenamento;
    function ler() { try { var v = JSON.parse(arm.getItem(CHAVE) || 'null'); if (v && Array.isArray(v.aprendidos)) return v; } catch (e) { /* estragado: começa de novo */ } return { aprendidos: [], correcoes: {} }; }
    var d = ler(); if (!d.correcoes || typeof d.correcoes !== 'object') d.correcoes = {};
    function salvar() { try { arm.setItem(CHAVE, JSON.stringify(d)); } catch (e) { /* sem espaço */ } }
    function achar(nome) { var n = normal(nome); for (var i = 0; i < d.aprendidos.length; i++) if (normal(d.aprendidos[i].nome) === n) return d.aprendidos[i]; return null; }
    function doHistorico(h) { var r = {}; (h || []).forEach(function (x) { if (x && x.r !== '?') r[x.id] = x.r; }); return limparResp(r); }
    function juntar(p, r) { Object.keys(r).forEach(function (k) { p.r[k] = r[k]; }); }

    function guardar(nome, emoji, niveis, r) {
      nome = limparNome(nome); if (!nome) return null;
      var p = achar(nome), novo = !p;
      if (novo) {
        var id = 'apr-' + slug(nome), k = 2; while (d.aprendidos.some(function (x) { return x.id === id; })) id = 'apr-' + slug(nome) + '-' + (k++);
        p = { id: id, nome: nome, emoji: limparEmoji(emoji), niveis: niveis, r: {} };
        d.aprendidos.push(p);
      } else { p.niveis = abertos(p.niveis, niveis); if (emoji) p.emoji = limparEmoji(emoji); }
      juntar(p, r); p.r.casa = 's';
      return { p: p, novo: novo };
    }

    return {
      armazenamento: arm,
      lista: function () { return d.aprendidos.map(function (p) { return { id: p.id, nome: p.nome, emoji: p.emoji, niveis: p.niveis, r: Object.assign({}, p.r) }; }); },
      ensinar: function (o) {
        var g = guardar(o.nome, o.emoji, NIVEIS[o.nivel] || 'FA', doHistorico(o.historico)); if (!g) return null;
        salvar(); return { id: g.p.id, nome: g.p.nome, emoji: g.p.emoji, niveis: g.p.niveis, r: Object.assign({}, g.p.r) };
      },
      corrigir: function (id, historico) {
        if (!/^[a-z0-9-]+$/.test(id)) return;
        var c = d.correcoes[id] || (d.correcoes[id] = {});
        var r = doHistorico(historico); Object.keys(r).forEach(function (k) { c[k] = r[k]; });
        salvar();
      },
      correcoes: function () { return JSON.parse(JSON.stringify(d.correcoes)); },
      esquecer: function (id) { d.aprendidos = d.aprendidos.filter(function (p) { return p.id !== id; }); delete d.correcoes[id]; salvar(); },
      exportar: function () { return JSON.stringify({ formato: 1, app: 'quem-e', quando: new Date().toISOString(), aprendidos: d.aprendidos, correcoes: d.correcoes }); },
      importar: function (texto) {
        var v; try { v = JSON.parse(texto); } catch (e) { throw new Error('arquivo não é do Quem é?'); }
        if (!v || v.app !== 'quem-e' || !Array.isArray(v.aprendidos)) throw new Error('arquivo não é do Quem é?');
        var res = { novos: 0, juntados: 0, correcoes: 0 };
        v.aprendidos.forEach(function (x) {
          if (!x || typeof x !== 'object') return;
          var niveis = ['IFA', 'FA', 'A'].indexOf(x.niveis) >= 0 ? x.niveis : 'FA';
          var g = guardar(x.nome, x.emoji, niveis, limparResp(x.r)); if (!g) return;
          if (g.novo) res.novos++; else res.juntados++;
        });
        if (v.correcoes && typeof v.correcoes === 'object') Object.keys(v.correcoes).forEach(function (id) {
          if (!/^[a-z0-9-]+$/.test(id)) return;
          var r = limparResp(v.correcoes[id]); if (!Object.keys(r).length) return;
          var c = d.correcoes[id] || (d.correcoes[id] = {}); Object.keys(r).forEach(function (k) { c[k] = r[k]; }); res.correcoes++;
        });
        salvar(); return res;
      }
    };
  }

  var API = { criar: criar, CHAVE: CHAVE };
  raiz.QEAprender = API;
  if (typeof module === 'object' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
