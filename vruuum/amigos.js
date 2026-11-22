/* Vruuum! — amigos dos outros jogos como piloto (dono, 22/Nov/2026: "os personagens compatíveis poderem ser escolhidos
   pro Vruuum"). Na etapa do Piloto, a fileira "Amigos dos outros jogos" mostra quem foi montado no Meu Pequeno Amiguinho,
   na Purpurina e em outros jogos (peça comum ../personagens.js, BolinhoPersonagens.listar({ excetoJogo: 'vruuum' })).
   Escolhido, o retrato dele vira o rosto do piloto, pelo mesmo caminho da selfie (selfie.js / cabeca.js): um objeto
   { img, cabelo, cabeloEscuro, pele }, com as cores tiradas do próprio retrato (de costas fica a cor do cabelo/pelo).
   Tudo fica no aparelho. Sem a peça comum ou sem ninguém salvo, a fileira mostra onde criar um amigo.
     VruuumAmigos.iniciar(caixa, { escolher: fn(id), mudou: fn() })   monta a fileira (e remonta quando a lista muda)
     VruuumAmigos.marcar(id)   marca o escolhido;   VruuumAmigos.existe(id);   VruuumAmigos.nome(id)
     VruuumAmigos.foto(id)     o rosto pronto para desenhar, ou null enquanto carrega (aí avisa mudou())
   Escrito em JavaScript antigo (sem =>), como o resto do jogo. */
(function (raiz) {
  'use strict';
  var EU = 'vruuum';
  var fotos = {}, pedidos = {}, caixa = null, op = {};
  function BP() { return raiz.BolinhoPersonagens; }
  function t(pt, en, es) { var I = raiz.BolinhoIdioma; return I && I.t ? I.t(pt, en, es) : pt; }
  function lista() { try { return BP() ? BP().listar({ excetoJogo: EU }) : []; } catch (e) { return []; } }
  function achar(id) { var a = null; lista().forEach(function (p) { if (p.id === id) a = p; }); return a; }
  function existe(id) { return !!(id && achar(id)); }
  function nome(id) { var a = achar(id); return a ? a.nome : ''; }

  // cor média dos pixels que aparecem (sem o fundo transparente) num pedaço do retrato
  function media(c, x, y, w, h, escurecer) {
    var d = c.getImageData(x, y, w, h).data, r = 0, g = 0, b = 0, n = 0;
    for (var i = 0; i < d.length; i += 4) { if (d[i + 3] < 200) continue; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
    if (!n) return null;
    var f = escurecer ? 0.6 : 1;
    function h2(v) { var s = Math.max(0, Math.min(255, Math.round(v / n * f))).toString(16); return s.length < 2 ? '0' + s : s; }
    return '#' + h2(r) + h2(g) + h2(b);
  }
  function carregar(id) {
    if (pedidos[id] || !BP()) return;
    pedidos[id] = true;
    BP().pegar(id).then(function (p) {
      if (!p || !p.retrato) { fotos[id] = null; return; }
      var img = new raiz.Image();
      img.onload = function () {
        var T = 64, cv = raiz.document.createElement('canvas'); cv.width = cv.height = T;
        var c = cv.getContext('2d'); c.drawImage(img, 0, 0, T, T);
        var pele = media(c, 22, 26, 20, 16) || '#f2c9a0';
        var cabelo = media(c, 14, 2, 36, 14) || media(c, 8, 8, 48, 20) || pele;
        fotos[id] = { img: img, cabelo: cabelo, cabeloEscuro: media(c, 14, 2, 36, 14, true) || cabelo, pele: pele, amigo: id };
        if (op.mudou) op.mudou();
      };
      img.onerror = function () { fotos[id] = null; };
      img.src = p.retrato;
    }, function () { pedidos[id] = false; });
  }
  function foto(id) {
    if (!id) return null;
    if (fotos[id]) return fotos[id];
    carregar(id);
    return null;
  }

  function montar() {
    if (!caixa) return;
    caixa.innerHTML = '';
    var l = lista();
    caixa.classList.toggle('vazio', !l.length);
    if (!l.length) {
      var p = raiz.document.createElement('p'); p.className = 'amigos-vazio';
      var a1 = raiz.document.createElement('a'), a2 = raiz.document.createElement('a');
      a1.href = '../meu-amiguinho/'; a1.textContent = t('Meu Pequeno Amiguinho', 'My Little Buddy', 'Mi Pequeño Amiguito');
      a2.href = '../purpurina/'; a2.textContent = 'Purpurina';
      p.appendChild(raiz.document.createTextNode(t('Crie um amiguinho no ', 'Make a little friend in ', 'Crea un amiguito en ')));
      p.appendChild(a1);
      p.appendChild(raiz.document.createTextNode(t(' ou uma personagem na ', ' or a character in ', ' o un personaje en ')));
      p.appendChild(a2);
      p.appendChild(raiz.document.createTextNode(t(' e ele aparece aqui.', ' and they show up here.', ' y aparecerá aquí.')));
      caixa.appendChild(p);
      return;
    }
    l.forEach(function (a) {
      var b = raiz.document.createElement('button'); b.type = 'button'; b.className = 'amigo';
      b.setAttribute('data-amigo', a.id); b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', a.nome || t('Amigo', 'Friend', 'Amigo')); b.title = a.nome || '';
      var im = raiz.document.createElement('img'); im.alt = ''; if (a.mini) im.src = a.mini; b.appendChild(im);
      var s = raiz.document.createElement('span'); s.textContent = a.nome || ''; b.appendChild(s);
      b.addEventListener('click', function () { foto(a.id); if (op.escolher) op.escolher(a.id); });
      caixa.appendChild(b);
    });
  }
  function marcar(id) {
    if (!caixa) return;
    Array.prototype.forEach.call(caixa.querySelectorAll('[data-amigo]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-amigo') === id)); });
  }
  function iniciar(el, opcoes) {
    caixa = el; op = opcoes || {};
    montar();
    if (BP() && BP().aoMudar) BP().aoMudar(function (e) {
      if (e && e.id) { delete fotos[e.id]; delete pedidos[e.id]; } else { fotos = {}; pedidos = {}; }   // o retrato pode ter mudado
      montar(); if (op.mudou) op.mudou();
    });
  }

  raiz.VruuumAmigos = { iniciar: iniciar, marcar: marcar, existe: existe, nome: nome, foto: foto, lista: lista };
})(this);
