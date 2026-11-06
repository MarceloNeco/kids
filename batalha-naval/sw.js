/* Batalha Naval — service worker: guarda a pasta no aparelho para abrir sem internet (contra o computador e passar o
   aparelho funcionam sem internet; jogar com amigos em aparelhos diferentes precisa dela).
   Código (html, js, css, json): rede primeiro com 4 s de espera, senão a cópia; fonte, imagens e a biblioteca da rede
   (supabase-js em ../baguncolandia/libs/, só baixa quando alguém joga com amigos): cópia primeiro.
   Músicas gravadas (../vruuum/musicas/*.mp3): o service worker não mexe (o navegador busca direto).
   Cache com o nome do app: só apaga caches "batalha-naval-" (nunca os dos outros jogos da mesma origem).
   Subir VERSAO a cada release (igual a APP_VERSION em app.js e a versoes.json). */
var VERSAO = '0.1.0';
var CACHE = 'batalha-naval-v' + VERSAO;
var ARQUIVOS = ['./', 'index.html', 'estilo.css', 'logica.js', 'rede.js', 'som.js', 'app.js', 'icone-192.png', 'icone-512.png', 'manifest.webmanifest', 'versoes.json', '../recursos.js', '../atualizar.js', '../telacheia.js', '../trilha.js', '../rabiscolandia/fontes/fredoka.woff2'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return Promise.all(ARQUIVOS.map(function (a) { return c.add(a).catch(function () {}); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('batalha-naval-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request; if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (/\.mp3$/i.test(url.pathname)) return;
  if (/\.(woff2|png)$/i.test(url.pathname) || /\/libs\//.test(url.pathname)) {
    e.respondWith(caches.match(req).then(function (r) { return r || fetch(req).then(function (resp) { if (resp.status === 200) { var c2 = resp.clone(); caches.open(CACHE).then(function (c) { return c.put(req, c2); }).catch(function () {}); } return resp; }); }));
    return;
  }
  var nav = req.mode === 'navigate';
  e.respondWith(new Promise(function (ok) {
    var feito = false, pedido = fetch(req, { cache: 'no-cache' });
    var t = setTimeout(function () { if (!feito) { feito = true; caches.match(req, { ignoreSearch: nav }).then(function (r) { ok(r || pedido); }); } }, 4000);
    pedido.then(function (resp) {
      if (resp.status === 200) { var c2 = resp.clone(); caches.open(CACHE).then(function (c) { return c.put(req, c2); }).catch(function () {}); }
      if (!feito) { feito = true; clearTimeout(t); ok(resp); }
    }).catch(function () { if (!feito) { feito = true; clearTimeout(t); caches.match(req, { ignoreSearch: nav }).then(function (r) { ok(r || Response.error()); }); } });
  }));
});
