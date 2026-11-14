/* Campo Minado — service worker: guarda a pasta no aparelho para abrir sem internet.
   Código (html, js, css, json, svg): rede primeiro com 4 s de espera, senão a cópia; fonte e imagens png: cópia primeiro.
   Músicas gravadas (*.mp3, da pasta da Rabiscolândia): o service worker não mexe (o navegador busca direto).
   Cache com o nome do app: só apaga caches "campo-minado-" (nunca os dos outros apps da mesma origem).
   Subir VERSAO a cada release (igual a APP_VERSION em app.js e a versoes.json). */
var VERSAO = '0.2.5';
var CACHE = 'campo-minado-v' + VERSAO;
var ARQUIVOS = ['./', 'index.html', 'estilo.css', 'campo.js', 'app.js', 'ourico.svg', 'flor.svg', 'icone.svg', 'icone-192.png', 'icone-512.png', 'manifest.webmanifest', 'versoes.json', '../rabiscolandia/fontes/fredoka.woff2', '../recursos.js', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../trilha.js'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return Promise.all(ARQUIVOS.map(function (a) { return c.add(a).catch(function () {}); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('campo-minado-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request; if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // músicas gravadas: o navegador busca direto (pedidos de áudio vêm em pedaços, "Range"; passar pelo service worker
  // atrapalha alguns celulares). Sem internet, o tocador pula as músicas e some, e o jogo segue.
  if (/\.mp3$/i.test(url.pathname)) return;
  if (/\.(woff2|png)$/i.test(url.pathname)) {
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
