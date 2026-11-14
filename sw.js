/*
  Service worker da estante do Bolinho de Chuva (solverone.com.br/kids/). Serve para duas coisas: o navegador
  aceitar instalar a estante como aplicativo e ela abrir mesmo sem internet. Rede primeiro (sempre a versão mais
  nova do site); sem resposta em 4 s, usa a cópia guardada. Cada jogo (/kids/<jogo>/) tem o próprio service
  worker, que cuida das páginas dele. O cache leva o nome da pasta (dgo-kids-vN) e só apaga caches do próprio
  Bolinho, porque todos os apps da SolverONE moram no mesmo endereço e dividem o cache.
  Este endereço (/kids/sw.js) é o mesmo da antiga página /kids do Portal: quem já tinha, atualiza sozinho.
  A cada mudança na estante, suba a VERSAO.
*/
var VERSAO = 24;
var PASTA = (self.registration.scope.replace(/\/$/, '').split('/').pop() || 'raiz');
var PREFIXO = 'dgo-' + PASTA + '-';
var CACHE = PREFIXO + 'v' + VERSAO;
var BASICO = ['./', 'manifest.webmanifest', 'estante.css', 'catalogo.js', 'jogos.js', 'kids.js', 'instalar.js', 'recursos.js', 'idioma.js', 'navegacao.js', 'trilha.js', 'versao.js',
  'radio.js', 'tela-cheia.js', 'icone-192.png', 'icone-512.png', 'icone-180.png',
  'campo-minado/icone.svg', 'batalha-naval/icone.svg', 'enigmas/icone.svg', 'labirinto/icone.svg', 'cozinha/icone.svg', 'a-garra/icone.svg', 'aqua/icone.svg', 'quem-e/icone.svg', 'glub-glub/icone-192.png',
  'cartoes-fundos.css', 'cartoes/baguncolandia.svg', 'cartoes/peluqueria.svg', 'cartoes/danca-na-sala.svg', 'cartoes/vruuum.svg',
  'cartoes/purpurina.svg', 'cartoes/rabiscolandia.svg', 'cartoes/generico.svg', 'baguncolandia/icone.svg',
  'bandeiras/br.svg', 'bandeiras/us.svg', 'bandeiras/es.svg'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return Promise.all(BASICO.map(function (u) { return c.add(u).catch(function () {}); })); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n.indexOf(PREFIXO) === 0 && n !== CACHE; })
      .map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url = new URL(req.url);
  var escopo = new URL(self.registration.scope);
  // Só o que é do próprio Bolinho (/kids/...). As páginas de cada jogo seguem com o service worker do jogo.
  if (req.method !== 'GET' || url.origin !== escopo.origin || url.pathname.indexOf(escopo.pathname) !== 0) return;
  // Música não passa por aqui: arquivo grande, tocado em pedaços pelo navegador; vem sempre da internet.
  if (/\.mp3$/i.test(url.pathname)) return;
  e.respondWith(new Promise(function (resolve) {
    var respondeu = false;
    function daCopia() {
      if (respondeu) return;
      caches.match(req, { ignoreSearch: true }).then(function (r) {
        if (respondeu) return;
        if (r) { respondeu = true; resolve(r); }
      });
    }
    var prazo = setTimeout(daCopia, 4000);
    fetch(req, { cache: 'no-cache' }).then(function (r) {
      clearTimeout(prazo);
      if (r && r.ok) { var copia = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copia); }); }
      if (!respondeu) { respondeu = true; resolve(r); }
    }).catch(function () {
      clearTimeout(prazo);
      caches.match(req, { ignoreSearch: true }).then(function (r) {
        if (!respondeu) { respondeu = true; resolve(r || Response.error()); }
      });
    });
  }));
});
