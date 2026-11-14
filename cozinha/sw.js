/* Cozinha — service worker: guarda a pasta no aparelho para abrir sem internet.
   Código (html, js, css, json): rede primeiro com 4 s de espera, senão a cópia; fonte, imagens e as fotos (fotos/*.jpg): cópia primeiro.
   Músicas (../rabiscolandia/musicas/*.mp3 e ../baguncolandia/musicas/*.mp3): o service worker não mexe (o navegador busca direto; sem internet,
   a trilha pula a música que não abre e some sem erro).
   Voz gravada da Dona Cida (voz/cida-*.mp3, v0.6.1): guardada na instalação e servida da cópia (funciona sem internet).
   Cache com o nome do app: só apaga caches "cozinha-" (nunca os dos outros apps da mesma origem).
   Subir VERSAO a cada release (igual a APP_VERSION em app.js e à primeira entrada de versoes.json). */
var VERSAO = '0.12.0';
var CACHE = 'cozinha-v' + VERSAO;
var ARQUIVOS = ['./', 'index.html', 'estilo.css', 'dados.js', 'logica.js', 'desenhos.js', 'cenas.js', 'vila.js', 'app.js', 'cidade3d.js', 'lavar3d.js', 'libs/three.module.min.js',
  'libs/three-LICENSE.txt', 'icone-192.png', 'icone-512.png', 'manifest.webmanifest', 'versoes.json', '../rabiscolandia/fontes/fredoka.woff2', '../recursos.js', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../versao.js',
  '../trilha.js', 'fotos/acucar.jpg', 'fotos/alface.jpg', 'fotos/banana.jpg', 'fotos/batata.jpg', 'fotos/bolo-cenoura.jpg', 'fotos/brigadeiro.jpg', 'fotos/carne.jpg', 'fotos/cenoura.jpg', 'fotos/cheiro.jpg', 'fotos/chocolate.jpg', 'fotos/churrasco.jpg',
  'fotos/cookies.jpg', 'fotos/farinha.jpg', 'fotos/fermento.jpg', 'fotos/gelatina-po.jpg', 'fotos/gelatina.jpg', 'fotos/granulado.jpg', 'fotos/jabuticaba.jpg', 'fotos/laranja.jpg', 'fotos/leite.jpg', 'fotos/leitecond.jpg', 'fotos/limao.jpg', 'fotos/maca.jpg',
  'fotos/manteiga.jpg', 'fotos/mel.jpg', 'fotos/morango.jpg', 'fotos/oleo.jpg', 'fotos/omelete.jpg', 'fotos/ovo.jpg', 'fotos/panqueca.jpg', 'fotos/pao-queijo.jpg', 'fotos/pao.jpg', 'fotos/peixe-assado.jpg', 'fotos/peixe.jpg', 'fotos/pizza.jpg',
  'fotos/polvilho.jpg', 'fotos/queijo.jpg', 'fotos/sal.jpg', 'fotos/salada-frutas.jpg', 'fotos/sanduiche.jpg', 'fotos/suco-jabuticaba.jpg', 'fotos/suco-laranja.jpg', 'fotos/tomate.jpg', 'fotos/uva.jpg', 'fotos/vitamina.jpg', 'voz/cida-aqui-acucar.mp3', 'voz/cida-aqui-farinha.mp3',
  'voz/cida-aqui-leite.mp3', 'voz/cida-aqui-manteiga.mp3', 'voz/cida-aqui-mel.mp3', 'voz/cida-aqui-ovo.mp3', 'voz/cida-aqui-sal.mp3', 'voz/cida-bastante.mp3', 'voz/cida-diz.mp3', 'voz/cida-exemplo.mp3', 'voz/cida-oi-sem.mp3', 'voz/cida-oi.mp3', 'voz/cida-tchau-fim.mp3', 'voz/cida-tchau.mp3',
  'render/acucar.webp', 'render/alface.webp', 'render/banana.webp', 'render/batata.webp', 'render/carne.webp', 'render/cenoura.webp', 'render/cheiro.webp', 'render/chocolate.webp', 'render/farinha.webp', 'render/fermento.webp', 'render/gelatina-po.webp', 'render/granulado.webp',
  'render/jabuticaba.webp', 'render/laranja.webp', 'render/leite.webp', 'render/leitecond.webp', 'render/limao.webp', 'render/maca.webp', 'render/manteiga.webp', 'render/mel.webp', 'render/morango.webp', 'render/oleo.webp', 'render/ovo.webp', 'render/pao.webp',
  'render/peixe.webp', 'render/polvilho.webp', 'render/queijo.webp', 'render/sal.webp', 'render/tomate.webp', 'render/u-liquidificador.webp', 'render/uva.webp'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return Promise.all(ARQUIVOS.map(function (a) { return c.add(a).catch(function () {}); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('cozinha-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request; if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (/\.mp3$/i.test(url.pathname) && url.pathname.indexOf('/cozinha/voz/') < 0) return;   // músicas: o navegador busca direto
  if (/\.(woff2|png|jpg|webp|mp3)$/i.test(url.pathname)) {   // fonte, imagens, fotos e a voz gravada da Dona Cida: cópia primeiro
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
