/*
  Personagens que viajam entre os jogos — peça comum (dono, 22/Nov/2026: "intercambiar os personagens (...) uma conexão,
  uma integralidade entre os joguinhos"). Um jogo EXPORTA a personagem que a criança montou (o amiguinho do Meu Pequeno
  Amiguinho, a menina da Purpurina...) e outro jogo IMPORTA (o amiguinho vira piloto no Vruuum!, vai no colo da Purpurina).

  Uso:
    jogo:  <script src="../personagens.js" data-fora-do-arquivo></script>  logo depois do ../idioma.js
           (e '../personagens.js' no ARQUIVOS do sw.js do jogo; depois rode  node ferramentas/pecas-comuns.js)

    BolinhoPersonagens.salvar({ id, jogo, nome, tipo, retrato, corpo, atualizado }) -> Promise (o item guardado, ou null)
        id        texto único, com o jogo na frente: 'amiguinho:12', 'purpurina:minha'. Salvar de novo o mesmo id atualiza.
        jogo      a pasta do jogo que criou: 'meu-amiguinho', 'purpurina', 'purpurina-nova', 'vruuum'...
        nome      o nome que aparece embaixo do retrato (até 40 letras)
        tipo      'pessoa' | 'bicho' | 'robo'
        retrato   imagem do rosto/busto, 256×256, fundo transparente (dataURL; também aceita um <canvas> ou <img>)
        corpo     opcional: o corpo inteiro, 384×512, fundo transparente (dataURL, <canvas> ou <img>)
        atualizado opcional: quando mudou (Date.now()); sem ele, agora
    BolinhoPersonagens.listar(filtro)  -> lista (na hora, sem esperar), do mais novo para o mais velho:
        [{ id, jogo, nome, tipo, atualizado, mini, temCorpo }]   mini = retratinho 64×64 (dataURL) para botões
        filtro opcional: { jogo: 'meu-amiguinho' }, { tipo: 'bicho' }, { excetoJogo: 'vruuum' } (pode juntar)
    BolinhoPersonagens.pegar(id)    -> Promise ({ id, jogo, nome, tipo, atualizado, mini, temCorpo, retrato, corpo } ou null)
    BolinhoPersonagens.remover(id)  -> Promise (true se tinha)
    BolinhoPersonagens.aoMudar(fn)  -> função que desliga o aviso. fn({ acao: 'salvou'|'removeu'|'outra-aba', id })
        avisa também quando outra aba (outro jogo aberto ao mesmo tempo) salva ou remove (evento "storage").

  Onde fica (tudo no aparelho; NADA vai para a internet):
  - índice leve em localStorage "bolinho:personagens" ({ v: 1, lista: [...] }, com o retratinho de 64 px);
  - as imagens grandes em IndexedDB (banco "bolinho-personagens", loja "imagens", uma por id).
  - Até 40 personagens: passando disso, saem os mais antigos. Imagens comprimidas (WebP quando o navegador sabe; senão
    PNG), no máximo ~60 KB cada (diminui a imagem até caber).
  - Sem IndexedDB (navegador antigo, modo privado que não deixa): só o localStorage, com o retrato pequeno (96 px) e sem
    o corpo; pegar() devolve o retrato pequeno e corpo null.
  - Nunca lança erro para o jogo: dando errado, salvar() devolve null, listar() devolve [] e pegar() devolve null.
  Escrito em JavaScript antigo (sem =>) de propósito: o tablet Fire mais velho também roda.
*/
(function (raiz) {
  'use strict';
  if (raiz.BolinhoPersonagens) return;

  var CHAVE = 'bolinho:personagens', BANCO = 'bolinho-personagens', LOJA = 'imagens';
  var MAX = 40, MAX_BYTES = 60000, MINI = 64, PEQUENO = 96;
  var TIPOS = ['pessoa', 'bicho', 'robo'];
  var ouvintes = [];

  function agora() { return Date.now(); }

  // ---------- índice (localStorage) ----------
  function lerLista() {
    try {
      var v = JSON.parse(raiz.localStorage.getItem(CHAVE) || 'null');
      return v && v.lista && v.lista.length !== undefined ? v.lista.filter(function (p) { return p && typeof p.id === 'string'; }) : [];
    } catch (e) { return []; }
  }
  function gravarLista(l) {
    try { raiz.localStorage.setItem(CHAVE, JSON.stringify({ v: 1, lista: l })); return true; } catch (e) { return false; }
  }
  function publico(p) {
    return { id: p.id, jogo: p.jogo, nome: p.nome, tipo: p.tipo, atualizado: p.atualizado, mini: p.mini || p.pequeno || null, temCorpo: !!p.temCorpo };
  }
  function avisar(acao, id) {
    ouvintes.slice().forEach(function (fn) { try { fn({ acao: acao, id: id }); } catch (e) { /* o jogo errou: os outros continuam */ } });
  }

  // ---------- banco das imagens (IndexedDB) ----------
  var banco = null;   // Promise do banco aberto (ou de null, sem IndexedDB)
  function abrirBanco() {
    if (banco) return banco;
    banco = new Promise(function (ok) {
      var feito = false, fim = function (db) { if (!feito) { feito = true; ok(db); } };
      try {
        if (!raiz.indexedDB) { fim(null); return; }
        var r = raiz.indexedDB.open(BANCO, 1);
        r.onupgradeneeded = function () { try { if (!r.result.objectStoreNames.contains(LOJA)) r.result.createObjectStore(LOJA, { keyPath: 'id' }); } catch (e) { /* ok */ } };
        r.onsuccess = function () { fim(r.result); };
        r.onerror = function () { fim(null); };
        r.onblocked = function () { fim(null); };
        setTimeout(function () { fim(null); }, 4000);   // navegador que nunca responde: segue sem o banco
      } catch (e) { fim(null); }
    });
    return banco;
  }
  function noBanco(modo, fazer) {   // fazer(loja) -> pedido; devolve Promise do resultado (ou null se der errado)
    return abrirBanco().then(function (db) {
      if (!db) return null;
      return new Promise(function (ok) {
        try {
          var tx = db.transaction(LOJA, modo), pedido = fazer(tx.objectStore(LOJA)), res = null;
          if (pedido) pedido.onsuccess = function () { res = pedido.result; };
          tx.oncomplete = function () { ok(res === undefined ? true : res); };
          tx.onerror = tx.onabort = function () { ok(null); };
        } catch (e) { ok(null); }
      });
    });
  }

  // ---------- imagens: carregar e comprimir ----------
  function carregarImagem(fonte) {
    return new Promise(function (ok) {
      try {
        if (!fonte) { ok(null); return; }
        if (fonte.getContext) { ok(fonte); return; }   // já é um <canvas>
        if (fonte.tagName && fonte.complete && fonte.naturalWidth) { ok(fonte); return; }
        var img = new raiz.Image();
        img.onload = function () { ok(img.naturalWidth ? img : null); };
        img.onerror = function () { ok(null); };
        img.src = typeof fonte === 'string' ? fonte : fonte.src;
      } catch (e) { ok(null); }
    });
  }
  function bytes(url) { return Math.round((url.length - url.indexOf(',') - 1) * 0.75); }
  // desenha a imagem inteira, centrada, num quadro w×h (sem esticar) e devolve o dataURL com até `limite` bytes
  function comprimir(img, w, h, limite) {
    try {
      var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
      if (!iw || !ih) return null;
      var escala = 1;
      for (var volta = 0; volta < 6; volta++) {
        var cw = Math.max(16, Math.round(w * escala)), ch = Math.max(16, Math.round(h * escala));
        var cv = raiz.document.createElement('canvas'); cv.width = cw; cv.height = ch;
        var c = cv.getContext('2d'), f = Math.min(cw / iw, ch / ih), dw = iw * f, dh = ih * f;
        c.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
        var q = [0.9, 0.78, 0.62], url = null;
        for (var i = 0; i < q.length; i++) {
          url = cv.toDataURL('image/webp', q[i]);
          if (url.indexOf('data:image/webp') !== 0) { url = cv.toDataURL('image/png'); break; }   // não sabe WebP
          if (bytes(url) <= limite) break;
        }
        if (bytes(url) <= limite) return url;
        escala *= 0.8;   // ainda grande: diminui a imagem
      }
      return null;
    } catch (e) { return null; }   // imagem de outro endereço (canvas "sujo") ou sem memória
  }

  // ---------- o que o jogo usa ----------
  function listar(filtro) {
    try {
      filtro = filtro || {};
      return lerLista().filter(function (p) {
        if (filtro.jogo && p.jogo !== filtro.jogo) return false;
        if (filtro.tipo && p.tipo !== filtro.tipo) return false;
        if (filtro.excetoJogo && p.jogo === filtro.excetoJogo) return false;
        return true;
      }).sort(function (a, b) { return (b.atualizado || 0) - (a.atualizado || 0); }).map(publico);
    } catch (e) { return []; }
  }

  function salvar(p) {
    try {
      if (!p || typeof p.id !== 'string' || !p.id || typeof p.jogo !== 'string' || !p.jogo || !p.retrato) return Promise.resolve(null);
      var item = {
        id: p.id.slice(0, 80), jogo: p.jogo.slice(0, 40), nome: String(p.nome == null ? '' : p.nome).trim().slice(0, 40),
        tipo: TIPOS.indexOf(p.tipo) >= 0 ? p.tipo : 'pessoa', atualizado: +p.atualizado || agora()
      };
      return Promise.all([carregarImagem(p.retrato), carregarImagem(p.corpo), abrirBanco()]).then(function (r) {
        if (!r[0]) return null;
        var db = r[2], retrato = db ? comprimir(r[0], 256, 256, MAX_BYTES) : null, corpo = db && r[1] ? comprimir(r[1], 384, 512, MAX_BYTES) : null;
        item.mini = comprimir(r[0], MINI, MINI, 6000);
        item.temCorpo = !!corpo;
        if (!db || !retrato) { item.pequeno = comprimir(r[0], PEQUENO, PEQUENO, 12000); item.mini = null; item.temCorpo = false; item.semBanco = true; }
        if (!item.mini && !item.pequeno) return null;
        var gravar = db && retrato ? noBanco('readwrite', function (loja) { return loja.put({ id: item.id, retrato: retrato, corpo: corpo }); }) : Promise.resolve(true);
        return gravar.then(function (ok) {
          if (!ok) { item.pequeno = comprimir(r[0], PEQUENO, PEQUENO, 12000); item.mini = null; item.temCorpo = false; item.semBanco = true; if (!item.pequeno) return null; }
          var lista = lerLista().filter(function (x) { return x.id !== item.id; });
          lista.unshift(item);
          lista.sort(function (a, b) { return (b.atualizado || 0) - (a.atualizado || 0); });
          // o que acabou de salvar fica sempre; passando de MAX, saem os mais antigos
          var sai = [];
          while (lista.length > MAX) { var k = lista.length - 1; if (lista[k].id === item.id) k--; sai.push(lista.splice(k, 1)[0]); }
          if (!gravarLista(lista)) {   // localStorage cheio: tenta abrir espaço tirando os mais antigos
            while (lista.length > 1 && !gravarLista(lista)) { var j = lista.length - 1; if (lista[j].id === item.id) j--; sai.push(lista.splice(j, 1)[0]); }
            if (!lerLista().some(function (x) { return x.id === item.id; })) { if (ok && !item.semBanco) apagarImagens(item.id); return null; }
          }
          sai.forEach(function (x) { apagarImagens(x.id); });
          avisar('salvou', item.id);
          return publico(item);
        });
      }).then(null, function () { return null; });
    } catch (e) { return Promise.resolve(null); }
  }

  function apagarImagens(id) { return noBanco('readwrite', function (loja) { return loja['delete'](id); }); }

  function pegar(id) {
    try {
      var p = null;
      lerLista().forEach(function (x) { if (x.id === id) p = x; });
      if (!p) return Promise.resolve(null);
      var res = publico(p);
      if (p.semBanco) { res.retrato = p.pequeno || p.mini || null; res.corpo = null; return Promise.resolve(res); }
      return noBanco('readonly', function (loja) { return loja.get(id); }).then(function (img) {
        res.retrato = img && img.retrato ? img.retrato : (p.mini || null);
        res.corpo = img && img.corpo ? img.corpo : null;
        return res;
      }).then(null, function () { res.retrato = p.mini || null; res.corpo = null; return res; });
    } catch (e) { return Promise.resolve(null); }
  }

  function remover(id) {
    try {
      var lista = lerLista(), resto = lista.filter(function (x) { return x.id !== id; });
      if (resto.length === lista.length) return Promise.resolve(false);
      gravarLista(resto);
      avisar('removeu', id);
      return apagarImagens(id).then(function () { return true; }, function () { return true; });
    } catch (e) { return Promise.resolve(false); }
  }

  function aoMudar(fn) {
    if (typeof fn !== 'function') return function () {};
    ouvintes.push(fn);
    return function () { var i = ouvintes.indexOf(fn); if (i >= 0) ouvintes.splice(i, 1); };
  }
  try {
    raiz.addEventListener('storage', function (e) { if (!e || e.key === CHAVE || e.key === null) avisar('outra-aba', null); });
  } catch (e) { /* sem janela: segue */ }

  raiz.BolinhoPersonagens = { salvar: salvar, listar: listar, pegar: pegar, remover: remover, aoMudar: aoMudar, MAX: MAX };
})(this);
