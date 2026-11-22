/* Purpurina Nova Era — service worker (prefixo 'purpurinanova-': não pode começar com 'purpurina-', senão a Purpurina
   antiga apagaria a gaveta desta; o cache de músicas 'purpurina-musicas-v1' é o mesmo das duas, para não baixar duas vezes): guarda o jogo inteiro no aparelho, de forma segura, pela peça comum ../sw-comum.js: a versão nova só entra
   quando chega INTEIRA (senão continua a anterior) e tudo abre da cópia do próprio jogo. Músicas gravadas (MP3, ~47 MB): as 3 primeiras baixadas em segundo plano depois de instalar, as outras na primeira
   vez que tocam, num cache próprio que não muda a cada versão (não baixam de novo). Cache com o nome do app: só apaga caches "purpurina-" (nunca os dos outros apps
   da mesma origem). Subir VERSAO a cada release (igual a APP_VERSION em app.js e a versoes.json). */
var VERSAO = '0.9.15';
var ARQUIVOS = ['./', 'index.html', 'estilo.css', 'pecas.js', 'visual.js', 'boneca.js', 'animador.js', 'balada.js', 'som.js', 'app.js', 'sala.js', 'musica.js', 'tv.js', 'fontes/fredoka.woff2', 'icone-192.png', 'icone-512.png', 'manifest.webmanifest', 'versoes.json', 'gif.js', '../recursos.js', '../carregando.js', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../versao.js', '../trilha.js', '../janela.js', '../cofre.js', '../instalar.js', 'ia-foto.js'];
var CACHE_MUSICAS = 'purpurina-musicas-v1';
var MUSICAS = ['../purpurina/musicas/disco-medusae.mp3', '../purpurina/musicas/glitter-blast.mp3', '../purpurina/musicas/who-likes-to-party.mp3', '../purpurina/musicas/miami-viceroy.mp3', '../purpurina/musicas/boogie-party.mp3', '../purpurina/musicas/raving-energy.mp3', '../purpurina/musicas/airport-lounge.mp3', '../purpurina/musicas/cloud-dancer.mp3', '../purpurina/musicas/got-funk.mp3', '../purpurina/musicas/newer-wave.mp3', '../purpurina/musicas/moonlight-beach.mp3', '../purpurina/musicas/your-call.mp3', '../purpurina/musicas/club-seamus.mp3', '../purpurina/musicas/celebration.mp3', '../purpurina/musicas/funky-one.mp3', '../purpurina/musicas/neon-laser-horizon.mp3', '../purpurina/musicas/beauty-flow.mp3', '../purpurina/musicas/voxel-revolution.mp3', '../purpurina/musicas/c-funk.mp3', '../purpurina/musicas/shiny-tech.mp3', '../purpurina/musicas/island-meet-and-greet.mp3', '../purpurina/musicas/paradise-found.mp3', '../purpurina/musicas/late-night-radio.mp3', '../purpurina/musicas/vibing-over-venus.mp3', '../purpurina/musicas/chill-wave.mp3', '../purpurina/musicas/ethernight-club.mp3', '../purpurina/musicas/dream-catcher.mp3', '../purpurina/musicas/miami-nights.mp3', '../purpurina/musicas/twisting.mp3', '../peluqueria/musicas/digital-lemonade.mp3', '../peluqueria/musicas/enter-the-party.mp3', '../peluqueria/musicas/disco-con-tutti.mp3', '../peluqueria/musicas/funky-chunk.mp3', '../peluqueria/musicas/stringed-disco.mp3', '../peluqueria/musicas/abertura-show-your-moves.mp3', '../rabiscolandia/musicas/street-party.mp3', '../peluqueria/musicas/electro-cabello.mp3'];
// em segundo plano só as 3 primeiras (a rádio começa por elas); as outras ficam guardadas na primeira vez que tocam.
// Música que saiu da rádio sai também do aparelho.
function guardarMusicas() {
  return caches.open(CACHE_MUSICAS).then(function (c) {
    var todas = MUSICAS.map(function (m) { return new URL(m, self.registration.scope).href; });
    c.keys().then(function (ks) { ks.forEach(function (k) { if (todas.indexOf(k.url) < 0) c.delete(k); }); });
    return Promise.all(MUSICAS.slice(0, 3).map(function (m) {
      var url = new URL(m, self.registration.scope).href;
      return c.match(url).then(function (r) { return r || fetch(url).then(function (resp) { if (resp.status === 200) return c.put(url, resp); }); }).catch(function () {});
    }));
  });
}
importScripts('../sw-comum.js');
// música: sempre a cópia inteira (o <audio> pede pedaços, o cache não); senão a internet, e fica guardada
function musica(e, url) {
  if (!/\.mp3$/i.test(url.pathname)) return null;
  return caches.open(CACHE_MUSICAS).then(function (c) { return c.match(url.href); }).then(function (r) {
    return r || fetch(new Request(url.href)).then(function (resp) {
      if (resp.status === 200) { var c2 = resp.clone(); caches.open(CACHE_MUSICAS).then(function (c) { return c.put(url.href, c2); }).catch(function () {}); }
      return resp;
    });
  });
}
var CACHE = BolinhoSW({ prefixo: 'purpurinanova-', versao: VERSAO, arquivos: ARQUIVOS, manter: [CACHE_MUSICAS], depois: guardarMusicas, rota: musica });
