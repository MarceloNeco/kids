/*
  Service worker comum dos jogos do Bolinho de Chuva (dono, 15/Nov/2026: "o jogo tem que se manter íntegro; só substitui
  pelo novo se tiver todas as peças; não baixou tudo, descarta; deu pau no meio, tem que ter recovery").
  Cada jogo, no próprio sw.js:
      var VERSAO = '1.2.3';                 // igual a APP_VERSION do app.js e à 1ª entrada do versoes.json
      var ARQUIVOS = ['./', 'index.html', …, '../idioma.js', …];   // tudo o que o jogo precisa para abrir sem internet
      importScripts('../sw-comum.js');
      var CACHE = BolinhoSW({ prefixo: 'meujogo-', versao: VERSAO, arquivos: ARQUIVOS });
  Opções extras (só os jogos que precisam): manter (gavetas que nunca são apagadas, ex.: músicas), depois (função que
  roda em segundo plano depois de ativar, ex.: guardar músicas), pular(url) (true = o service worker não mexe, ex.: MP3
  tocado aos pedaços) e rota(evento, url) (devolve a resposta de um tipo de arquivo especial, ou nada).

  Como funciona:
  1. Versão nova = gaveta nova (prefixo + v + VERSAO + peças comuns). A instalação baixa TODOS os ARQUIVOS da internet
     (sem cache do navegador, 4 de cada vez, cada um com uma segunda tentativa). Só quando o último chega, grava a marca
     "completa". Faltou um, deu erro ou a internet caiu: apaga a gaveta nova e a instalação falha — o jogo continua na
     versão anterior, inteira, e tenta de novo na próxima vez que abrir. Nunca existem duas versões misturadas.
  2. Só ativa uma gaveta completa; aí apaga as gavetas antigas do jogo (nunca as de outros jogos nem as de "manter").
  3. Recuperação: gaveta sem a marca (o aparelho desligou no meio, o navegador apagou algo) nunca é usada pela metade:
     na instalação seguinte ela é apagada e baixada de novo; e a gaveta ativa sem marca é completada sozinha na primeira
     abertura com internet.
  4. Abrir o jogo: tudo vem da gaveta do próprio jogo (rápido, até no tablet velho, e igual com ou sem internet). Nunca
     procura nas gavetas dos outros jogos (pegava peça comum antiga — pendência 46). Arquivo que não está na lista vem
     da internet e fica guardado na gaveta da versão. versoes.json pedido "sem cache" (o aviso de versão nova) vem
     da internet; pedido normal, da gaveta (é a versão que está rodando).
  5. Versão nova no site: o navegador confere o sw.js do jogo (e este arquivo) a cada abertura; mudou, baixa tudo em
     segundo plano (passo 1). A tela de "carregando" (carregando.js) espera essa conferência e, se houver versão nova,
     espera baixar e já abre nela; no meio de uma partida, o atualizar.js oferece "Atualizar".
  PECAS = impressão digital das peças comuns da raiz que os jogos guardam (../idioma.js, ../navegacao.js…). Mudou uma
  delas, rode  node ferramentas/pecas-comuns.js  (o vigia teste/sw-jogos.test.js avisa): todos os jogos baixam de novo.
  Escrito em JavaScript antigo (sem =>) de propósito: o tablet Fire mais velho também roda.
*/
var PECAS = 'd8acf0253e';
function BolinhoSW(op) {
  'use strict';
  var P = op.prefixo, CACHE = P + 'v' + op.versao + '-' + PECAS, MANTER = op.manter || [];
  var MARCA = new URL('__bolinho-completo__', self.registration.scope).href;
  var ARQ = op.arquivos;

  function completo(nome) {
    return caches.has(nome).then(function (tem) {
      return tem && caches.open(nome).then(function (c) { return c.match(MARCA); }).then(function (r) { return !!r; });
    });
  }
  // baixa um arquivo da internet (sem o cache do navegador), com uma segunda tentativa; só aceita resposta 200
  function baixar(a, tentativa) {
    var req = new Request(a, { cache: 'reload' });
    return fetch(req).then(function (r) {
      if (r.status !== 200) throw new Error(a + ': ' + r.status);
      // resposta que veio de redirecionamento não serve para abrir página: guarda uma cópia limpa
      return r.redirected ? r.blob().then(function (b) { return new Response(b, { status: 200, headers: r.headers }); }) : r;
    }).catch(function (e) { if (!tentativa) return baixar(a, 1); throw e; });
  }
  function encher(c, lista) {
    var fila = lista.slice(), erro = null;
    function proximo() {
      if (erro || !fila.length) return Promise.resolve();
      var a = fila.shift();
      return baixar(a).then(function (r) { return c.put(a, r); }).then(proximo, function (e) { erro = e; });
    }
    return Promise.all([proximo(), proximo(), proximo(), proximo()]).then(function () { if (erro) throw erro; });
  }
  function instalar() {
    return completo(CACHE).then(function (ok) {
      if (ok) return;   // a mesma versão já está inteira no aparelho
      // sobra de uma instalação que parou no meio: começa do zero
      return caches.delete(CACHE).then(function () { return caches.open(CACHE); }).then(function (c) {
        return encher(c, ARQ).then(function () { return c.put(MARCA, new Response(String(op.versao))); });
      }).catch(function (e) {
        // não baixou tudo: descarta a gaveta nova; a versão anterior continua valendo
        return caches.delete(CACHE).then(function () { throw e; });
      });
    });
  }
  // gaveta ativa sem a marca (não deveria acontecer): completa o que falta, com internet
  var curando = null;
  function curar() {
    if (curando) return curando;
    curando = completo(CACHE).then(function (ok) {
      if (ok) return;
      return caches.open(CACHE).then(function (c) {
        return Promise.all(ARQ.map(function (a) { return c.match(a).then(function (r) { return r ? null : a; }); })).then(function (faltam) {
          return encher(c, faltam.filter(Boolean)).then(function () { return c.put(MARCA, new Response(String(op.versao))); });
        });
      });
    }).then(function () { curando = null; }, function () { curando = null; });   // confere de novo na próxima abertura
    return curando;
  }

  self.addEventListener('install', function (e) {
    e.waitUntil(instalar().then(function () { return self.skipWaiting(); }));
  });
  self.addEventListener('activate', function (e) {
    e.waitUntil(completo(CACHE).then(function (ok) {
      return caches.keys().then(function (ks) {
        // só apaga as antigas com a nova inteira no lugar
        return Promise.all(ks.filter(function (k) { return ok && k.indexOf(P) === 0 && k !== CACHE && MANTER.indexOf(k) < 0; })
          .map(function (k) { return caches.delete(k); }));
      });
    }).then(function () { return self.clients.claim(); }).then(function () { if (op.depois) op.depois(); }));
  });

  function daGaveta(req, nav) {
    return caches.open(CACHE).then(function (c) {
      return c.match(req, { ignoreSearch: nav }).then(function (r) { return r || (nav ? c.match('./') : null); });
    });
  }
  function guardar(req, resp) {
    if (resp && resp.status === 200) { var c2 = resp.clone(); caches.open(CACHE).then(function (c) { return c.put(req, c2); }).catch(function () {}); }
    return resp;
  }
  self.addEventListener('fetch', function (e) {
    var req = e.request; if (req.method !== 'GET') return;
    var url = new URL(req.url);
    if (url.origin !== location.origin) return;
    if (op.pular && op.pular(url)) return;
    var especial = op.rota && op.rota(e, url);
    if (especial) { e.respondWith(especial); return; }
    var nav = req.mode === 'navigate';
    if (nav) e.waitUntil(curar());
    // conferir se tem versão nova: da internet; sem internet, a da gaveta
    if (/\/versoes\.json$/.test(url.pathname) && (req.cache === 'no-store' || req.cache === 'reload' || req.cache === 'no-cache')) {
      e.respondWith(fetch(req).catch(function () { return daGaveta(req, false).then(function (r) { return r || Response.error(); }); }));
      return;
    }
    var guardavel = !/[?&]code=/.test(url.search);   // volta do login (Bagunçolândia): nunca guarda
    e.respondWith(daGaveta(req, nav).then(function (r) {
      return r || fetch(req).then(function (resp) { return guardavel ? guardar(req, resp) : resp; });
    }));
  });
  return CACHE;
}
