/* Quem é? — as regras de uma partida do Duelo de Caras, sem tela (roda no Node para os testes).

   Dois jogadores (0 e 1). Cada um tem um segredo (uma cara) e o próprio tabuleiro (dePe: quais cartas estão de pé).
   A vez (pedido do dono, 14/Nov/2026): na sua vez você faz UMA coisa só:
     - perguntar → o outro responde Sim/Não (o jogo confere com o segredo dele: resposta errada não passa) →
       você descarta (um botão vira todas as que não servem, ou vira uma por uma) → "Pronto" passa a vez;
     - ou dar o palpite → acertou, ganha; errou, a carta vira e a vez passa.
   Modos:
     'passar'  os dois segredos estão aqui (passando o aparelho)
     'meleca'  o jogador 1 é a meleca: ela escolhe o segredo, responde sozinha e joga a vez dela (vezDaMeleca)
     'rede'    só o MEU segredo está aqui (eu = 0 ou 1). O segredo do outro fica null: a resposta dele chega pela rede
               já conferida no aparelho dele; o palpite meu fica "pendente" até o veredito dele chegar.

   QEPartida.criar({ modo, nivel, semente, eu, rnd }) → partida   ·   QEPartida.voltar(salvo) → partida
   partida.estado = { fase, vez, segredos, prontos, dePe, feitas, ultima, passo, vencedor }
   partida.aguardando() → quem precisa agir e o quê (a tela e a rede se guiam por isso). Regra quebrada = erro com
   .codigo: 'fase' | 'fora-da-vez' | 'passo' | 'pergunta' | 'carta'. */
(function (raiz) {
  'use strict';
  var L = raiz.QELogica || (typeof require === 'function' ? require('./logica.js') : null);

  function erro(codigo, msg) { var e = new Error(msg || codigo); e.codigo = codigo; return e; }

  function criar(op, salvo) {
    op = op || {};
    var modo = op.modo || 'passar', nivel = op.nivel || 'facil', semente = op.semente >>> 0, eu = op.eu || 0;
    var rnd = op.rnd || Math.random;
    var corpo = !!op.corpo, tab = L.gerarTabuleiro(semente, nivel, { corpo: corpo }), n = tab.caras.length;
    function cheio() { var a = []; for (var i = 0; i < n; i++) a.push(true); return a; }
    var e = salvo || {
      fase: 'segredo', vez: 0, segredos: [null, null], prontos: [false, false], dePe: [cheio(), cheio()], feitas: [[], []],
      ultima: null, passo: 'escolher', vencedor: null
    };

    function exigirFase(f) { if (e.fase !== f) throw erro('fase'); }
    function exigirVez(j) { if (e.vez !== j) throw erro('fora-da-vez'); }
    function exigirPasso(p) { if (e.passo !== p) throw erro('passo'); }
    function exigirCarta(id) { if (!(id >= 0 && id < n) || id !== Math.floor(id)) throw erro('carta'); }
    function talvezComecar() { if (e.fase === 'segredo' && e.prontos[0] && e.prontos[1]) { e.fase = 'jogo'; e.vez = 0; e.passo = 'escolher'; } }
    function passarVez() { e.vez = 1 - e.vez; e.passo = 'escolher'; }

    var p = {
      modo: modo, nivel: nivel, semente: semente, eu: eu, tabuleiro: tab, estado: e,

      aguardando: function () {
        if (e.fase === 'segredo') { var f = []; if (!e.prontos[0]) f.push(0); if (!e.prontos[1]) f.push(1); return { acao: 'segredo', faltam: f }; }
        if (e.fase === 'fim') return null;
        if (e.passo === 'escolher') return { jogador: e.vez, acao: 'perguntar' };
        if (e.passo === 'responder') return { jogador: 1 - e.vez, acao: 'responder' };
        if (e.passo === 'veredito') return { jogador: 1 - e.vez, acao: 'veredito' };
        return { jogador: e.vez, acao: 'descartar' };
      },

      escolherSegredo: function (j, id) {
        exigirFase('segredo'); exigirCarta(id);
        e.segredos[j] = id; e.prontos[j] = true; talvezComecar();
      },
      // em rede: o outro escolheu o segredo dele (sem dizer qual)
      marcarPronto: function (j) { exigirFase('segredo'); e.prontos[j] = true; talvezComecar(); },

      perguntar: function (j, id) {
        exigirFase('jogo'); exigirVez(j); exigirPasso('escolher');
        if (tab.perguntas.indexOf(id) < 0 || e.feitas[j].indexOf(id) >= 0) throw erro('pergunta');
        e.feitas[j].push(id); e.ultima = { quem: j, pergunta: id, resposta: null }; e.passo = 'responder';
      },

      // quem responde é o outro jogador; com o segredo dele aqui, o jogo confere (errada não passa, nada muda)
      responder: function (j, resposta) {
        exigirFase('jogo'); exigirPasso('responder'); if (j !== 1 - e.vez) throw erro('fora-da-vez');
        var seg = e.segredos[j];
        if (seg !== null && !L.conferir(tab.caras[seg], e.ultima.pergunta, resposta)) return { ok: false };
        e.ultima.resposta = !!resposta; e.passo = 'descartar';
        return { ok: true };
      },

      descartarTodos: function (j) {
        exigirFase('jogo'); exigirVez(j); exigirPasso('descartar');
        var ids = L.descartaveis(tab.caras, e.dePe[j], e.ultima.pergunta, e.ultima.resposta);
        ids.forEach(function (i) { e.dePe[j][i] = false; });
        return ids;
      },
      // quantas o botão "Descartar" viraria agora (0 = "Nenhuma para descartar")
      quantasDescartar: function (j) {
        if (e.passo !== 'descartar' || e.vez !== j) return 0;
        return L.descartaveis(tab.caras, e.dePe[j], e.ultima.pergunta, e.ultima.resposta).length;
      },

      // virar ou desvirar uma carta do próprio tabuleiro (pode a qualquer hora do jogo: é o tabuleiro dele)
      virar: function (j, id) { exigirFase('jogo'); exigirCarta(id); e.dePe[j][id] = !e.dePe[j][id]; return e.dePe[j][id]; },

      pronto: function (j) { exigirFase('jogo'); exigirVez(j); exigirPasso('descartar'); passarVez(); },

      palpite: function (j, id) {
        exigirFase('jogo'); exigirVez(j); exigirPasso('escolher'); exigirCarta(id);
        e.ultima = { quem: j, palpite: id };
        var seg = e.segredos[1 - j];
        if (seg === null) { e.passo = 'veredito'; return { pendente: true }; }
        return fecharPalpite(j, id === seg);
      },
      // em rede: o outro aparelho disse se o meu palpite acertou
      veredito: function (ok) { exigirFase('jogo'); exigirPasso('veredito'); fecharPalpite(e.vez, !!ok); },

      // modo meleca: faz a próxima coisa que a meleca precisa fazer
      vezDaMeleca: function () {
        if (modo !== 'meleca') throw erro('fase');
        var a = p.aguardando();
        if (!a || a.jogador !== 1) return null;
        if (a.acao === 'responder') { var r = L.responder(tab.caras[e.segredos[1]], e.ultima.pergunta); p.responder(1, r); return { tipo: 'resposta', resposta: r }; }
        if (a.acao === 'descartar') { var ids = p.descartarTodos(1); p.pronto(1); return { tipo: 'descartou', ids: ids }; }
        if (a.acao === 'perguntar') {
          var j = L.escolherPerguntaMeleca(tab.caras, e.dePe[1], e.feitas[1], tab.perguntas, nivel, rnd);
          if (j.tipo === 'pergunta') { p.perguntar(1, j.id); return { tipo: 'pergunta', id: j.id }; }
          var res = p.palpite(1, j.idCara); return { tipo: 'palpite', idCara: j.idCara, acertou: res.acertou };
        }
        return null;
      },

      salvar: function () { return { modo: modo, nivel: nivel, semente: semente, eu: eu, corpo: corpo, estado: JSON.parse(JSON.stringify(e)) }; }
    };

    function fecharPalpite(j, acertou) {
      if (acertou) { e.fase = 'fim'; e.vencedor = j; e.passo = 'escolher'; return { acertou: true }; }
      e.dePe[j][e.ultima.palpite] = false; passarVez();
      return { acertou: false };
    }

    if (!salvo && modo === 'meleca') { e.segredos[1] = Math.floor(rnd() * n); e.prontos[1] = true; }
    return p;
  }

  function voltar(s) { return criar({ modo: s.modo, nivel: s.nivel, semente: s.semente, eu: s.eu, corpo: !!s.corpo }, s.estado); }

  var QP = { criar: function (op) { return criar(op, null); }, voltar: voltar };
  raiz.QEPartida = QP;
  if (typeof module === 'object' && module.exports) module.exports = QP;
})(typeof window !== 'undefined' ? window : globalThis);
