/* GLUB GLUB — service worker: guarda a pasta no aparelho para abrir sem internet.
   Código (html, js, css, json): rede primeiro com 4 s de espera, senão a cópia; fonte e imagens: cópia primeiro.
   Músicas (pastas musicas/ dos outros jogos): o service worker não mexe (o navegador busca direto;
   sem internet a trilha pula as que não abrem e some, e o jogo segue com os efeitos).
   Cache com o nome do app: só apaga caches "glub-glub-" (nunca os dos outros jogos da mesma origem).
   Subir VERSAO a cada release (igual a APP_VERSION em app.js e a versoes.json). */
var VERSAO = '0.1.2';
var CACHE = 'glub-glub-v' + VERSAO;
var ARQUIVOS = ['./', 'index.html', 'estilo.css', 'regras.js', 'arte.js', 'som.js', 'app.js', 'icone-192.png', 'icone-512.png', 'manifest.webmanifest', 'versoes.json', '../rabiscolandia/fontes/fredoka.woff2', '../recursos.js', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../trilha.js', '../instalar.js',
  'img/abissal.webp', 'img/agua-viva.webp', 'img/bagre.webp', 'img/baiacu.webp', 'img/baleia.webp', 'img/bau.webp', 'img/bota.webp', 'img/caranguejo.webp', 'img/cavalo-marinho.webp', 'img/chinelo.webp', 'img/cirurgiao.webp', 'img/garrafa.webp', 'img/juca.webp', 'img/lagosta.webp', 'img/lambari.webp', 'img/lanterna.webp', 'img/lata.webp', 'img/lili.webp', 'img/martelo.webp', 'img/mergulhador.webp', 'img/morsa.webp', 'img/orca.webp', 'img/pacu.webp', 'img/palhaco.webp', 'img/pet.webp', 'img/piaba.webp', 'img/pirarucu.webp', 'img/pneu.webp', 'img/polvo.webp', 'img/sereia.webp', 'img/tartaruga.webp', 'img/tilapia.webp', 'img/traira.webp', 'img/tubarao-baleia.webp', 'img/tubarao.webp'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return Promise.all(ARQUIVOS.map(function (a) { return c.add(a).catch(function () {}); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('glub-glub-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request; if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (/\.mp3$/i.test(url.pathname)) return;
  if (/\.(woff2|png|webp)$/i.test(url.pathname)) {
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
