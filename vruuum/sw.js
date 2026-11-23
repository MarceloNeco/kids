/* Vruuum! — service worker: guarda o jogo inteiro no aparelho, de forma segura, pela peça comum ../sw-comum.js: a versão nova só entra
   quando chega INTEIRA (senão continua a anterior) e tudo abre da cópia do próprio jogo. Músicas gravadas (35 MP3, ~65 MB): baixadas em segundo plano, uma por vez, depois de instalar
   (no 4G ou com economia de dados, só 6) e na primeira vez que tocam; sempre servidas inteiras da cópia (o <audio> pede pedaços, o cache não). Cache com o nome do app: só apaga caches "vruuum-" (nunca os dos outros apps
   da mesma origem). Subir VERSAO a cada release (igual a APP_VERSION em app.js e a versoes.json). */
var VERSAO = '1.41.0';
var ARQUIVOS = ['./', 'index.html', 'estilo.css', 'pista.js', 'motor.js', 'sprites.js', 'modelos3d.js', 'cavalo.js', 'veiculos.js', 'personagens.js', 'cabeca.js', 'desenho.js', 'rock.js', 'som.js', 'movimento.js', 'maos.js', 'selfie.js', 'amigos.js', 'app.js', 'baixar.js', 'duelo.js', 'rosto.tflite', 'fontes/fredoka.woff2', 'icone-192.png', 'icone-512.png', 'manifest.webmanifest', 'versoes.json', '../recursos.js', '../carregando.js', '../idioma.js', '../personagens.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../versao.js', '../trilha.js'].concat(['sons/aparece.mp3', 'sons/aplausos.mp3', 'sons/arara.mp3', 'sons/asas.mp3', 'sons/batida.mp3', 'sons/bip.mp3', 'sons/boing.mp3', 'sons/buzina.mp3', 'sons/caixa.mp3', 'sons/cavalo.mp3', 'sons/chegou.mp3', 'sons/cone.mp3', 'sons/derrapa.wav', 'sons/dino.mp3', 'sons/dracula.mp3', 'sons/risada.mp3', 'sons/escudo.mp3', 'sons/estrela-ar.mp3', 'sons/estrela.mp3', 'sons/explosao.mp3', 'sons/fogos.mp3', 'sons/galinha1.mp3', 'sons/galinha2.mp3', 'sons/galo.mp3', 'sons/gosma.mp3', 'sons/lama.mp3', 'sons/morcego.mp3', 'sons/motor.wav', 'sons/pipoca.mp3', 'sons/plop.mp3', 'sons/pulo.mp3', 'sons/ronco.mp3', 'sons/splat.mp3', 'sons/tum.mp3', 'sons/turbo.mp3', 'sons/vai.mp3']);   // sons gravados (1.11.1)
var CACHE_MUSICAS = 'vruuum-musicas-v1';   // não muda a cada versão: as músicas não baixam de novo
var MUSICAS = ['musicas/volatile-reaction.mp3', 'musicas/kart-grand-prix.mp3', 'musicas/heroic-age.mp3', 'musicas/lava.mp3', 'musicas/unholy-knight.mp3', 'musicas/las-dunas-champions.mp3', 'musicas/metalmania.mp3', 'musicas/ready-aim-fire.mp3', 'musicas/summon-the-rawk.mp3', 'musicas/noise-attack.mp3', 'musicas/hotrock.mp3', 'musicas/neolith.mp3', 'musicas/iron-bacon.mp3', 'musicas/take-the-lead.mp3', 'musicas/exhilarate.mp3', 'musicas/cool-hard-facts.mp3', 'musicas/bet-you-can.mp3', 'musicas/pump.mp3', 'musicas/breakdown.mp3', 'musicas/what-you-want.mp3', 'musicas/holizna-jams.mp3', 'musicas/holizna-punk.mp3', 'musicas/holizna-americana.mp3', 'musicas/holizna-grunge.mp3', 'musicas/holizna-classic.mp3', 'musicas/anthem-rock-this-house.mp3', 'musicas/anthem-bad-nostalgia.mp3', 'musicas/anthem-so-my-love.mp3', 'musicas/anthem-leave-the-country.mp3', 'musicas/holizna-way-of-the-samurai.mp3', 'musicas/retrofuture-clean.mp3', 'musicas/zap-beat.mp3', 'musicas/el-magicia.mp3', 'musicas/gearhead.mp3', 'musicas/bet-you-can-2.mp3'];
// guarda as músicas uma de cada vez, em segundo plano. Com "economia de dados" ligada ou no 4G, só as 6 primeiras;
// as outras ficam guardadas na primeira vez que tocam (o fetch abaixo guarda toda música tocada)
function guardarMusicas() {
  var con = self.navigator && self.navigator.connection, poupar = !!(con && (con.saveData || con.type === 'cellular'));
  var lista = poupar ? MUSICAS.slice(0, 6) : MUSICAS;
  return caches.open(CACHE_MUSICAS).then(function (c) {
    return lista.reduce(function (fila, m) {
      return fila.then(function () {
        var url = new URL(m, self.registration.scope).href;
        return c.match(url).then(function (r) { return r || fetch(url).then(function (resp) { if (resp.status === 200) return c.put(url, resp); }); }).catch(function () {});
      });
    }, Promise.resolve());
  });
}
importScripts('../sw-comum.js');
// músicas: a cópia guardada (sons/ na gaveta da versão, musicas/ na gaveta das músicas); senão a internet, e fica guardada
function musica(e, url) {
  if (!/\.mp3$/i.test(url.pathname)) return null;
  return caches.open(CACHE).then(function (c) { return c.match(url.href); }).then(function (r) {
    return r || caches.open(CACHE_MUSICAS).then(function (c) { return c.match(url.href); });
  }).then(function (r) {
    return r || fetch(new Request(url.href)).then(function (resp) {
      if (resp.status === 200) { var c2 = resp.clone(); caches.open(CACHE_MUSICAS).then(function (c) { return c.put(url.href, c2); }).catch(function () {}); }
      return resp;
    });
  });
}
var CACHE = BolinhoSW({ prefixo: 'vruuum-', versao: VERSAO, arquivos: ARQUIVOS, manter: [CACHE_MUSICAS], depois: guardarMusicas, rota: musica });
