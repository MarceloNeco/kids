/* Bagunçolândia — service worker: guarda o jogo inteiro no aparelho, de forma segura, pela peça comum ../sw-comum.js: a versão nova só entra
   quando chega INTEIRA (senão continua a anterior) e tudo abre da cópia do próprio jogo. Cache com o nome do app (nunca apaga o dos outros apps
   da mesma origem). Subir VERSAO a cada release (igual a APP_VERSION em app.js). */
var VERSAO = '0.8.47';
var ARQUIVOS = ['./', 'index.html', 'estilo.css', 'app.js', 'jogo.js', 'casa.js', 'figuras.js', 'cenas.js', 'boneco.js', 'abertura.js', 'desenho.js', 'sala.js', 'voz.js', 'som.js', 'calibrar.js', 'config.js', 'batida.js', 'spotify.js', 'esqueleto.js', 'libs/supabase.js', 'fontes/fredoka.woff2', 'icone-192.png', 'icone-512.png', 'manifest.webmanifest', 'versoes.json', '../recursos.js', '../carregando.js', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../trilha.js'];
// A parte da câmera (MediaPipe em libs/mediapipe/, ~28 MB) só baixava na primeira vez que alguém ligava o boneco;
// sem internet, essa primeira vez falhava. Agora fica guardada sozinha depois de abrir, mas só no Wi-Fi.
var PESADOS = ['libs/mediapipe/vision_bundle.mjs', 'libs/mediapipe/vision_wasm_internal.js', 'libs/mediapipe/vision_wasm_internal.wasm', 'libs/mediapipe/pose_landmarker_lite.task', 'libs/mediapipe/hand_landmarker.task'];
function guardarPesados() {
  var con = self.navigator && self.navigator.connection;
  if (con && (con.saveData || con.type === 'cellular')) return Promise.resolve();
  return caches.open(CACHE).then(function (c) {
    return PESADOS.reduce(function (fila, a) {
      return fila.then(function () {
        var url = new URL(a, self.registration.scope).href;
        return c.match(url).then(function (r) { return r || fetch(url).then(function (resp) { if (resp.ok) return c.put(url, resp); }); }).catch(function () {});
      });
    }, Promise.resolve());
  });
}
importScripts('../sw-comum.js');
// músicas: o navegador baixa aos pedaços enquanto toca (sem internet, o jogo toca a sintetizada)
var CACHE = BolinhoSW({ prefixo: 'bagunca-', versao: VERSAO, arquivos: ARQUIVOS, depois: guardarPesados, pular: function (url) { return /\/musicas\//.test(url.pathname); } });
