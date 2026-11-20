/* Peluqueria — service worker: guarda o jogo inteiro no aparelho, de forma segura, pela peça comum ../sw-comum.js: a versão nova só entra
   quando chega INTEIRA (senão continua a anterior) e tudo abre da cópia do próprio jogo. MP3: cópia primeiro (os MP3 são guardados sozinhos depois de abrir, no Wi-Fi; ver guardarMusicas). Cache com o nome do app: só
   apaga caches "peluqueria-" (nunca os dos outros apps da mesma origem).
   Subir VERSAO a cada release (igual a APP_VERSION em app.js e a versoes.json). */
var VERSAO = '0.6.16';
var ARQUIVOS = ['./', 'index.html', 'estilo.css', 'app.js', 'jogo.js', 'cenarios.js', 'itens.js', 'desenho.js', 'som.js', 'voz.js', 'gesto.js', 'partida.js', 'sala.js', 'esqueleto.js', 'tv.js', 'controle.js', '../baguncolandia/libs/supabase.js', 'musicas/musicas.json', 'musicas/abertura-show-your-moves.mp3', 'marcar.html', 'marcar.js', 'fontes/fredoka.woff2', 'icone-192.png', 'icone-512.png', 'manifest.webmanifest', 'versoes.json', 'meus/cenarios.json', 'meus/itens.json', 'cenarios/cenarios.json', 'itens/itens.json', 'cenarios/cachorro.jpg', 'cenarios/gato.jpg', 'cenarios/leao.jpg', 'cenarios/coruja.jpg', 'cenarios/cavalo.jpg', 'cenarios/pinguim.jpg', 'cenarios/coelho.jpg', 'cenarios/panda-vermelho.jpg', 'cenarios/tigre.jpg', 'cenarios/girafa.jpg', 'cenarios/bebe.svg', 'cenarios/boneco-de-neve.svg', 'cenarios/cachorro.svg', 'cenarios/cavalo.svg', 'cenarios/coruja.svg', 'cenarios/gato.svg', 'cenarios/leao.svg', 'cenarios/pinguim.svg', 'cenarios/robo.svg', 'cenarios/sapo.svg', 'cenarios/tubarao.svg', 'cenarios/vovo.svg', 'efeitos/uhul-1.mp3', 'efeitos/uhul-2.mp3', 'itens/bigode.svg', 'itens/boca-tubarao.svg', 'itens/bone.svg', 'itens/capacete-viking.svg', 'itens/cartola.svg', 'itens/chapeu-pirata.svg', 'itens/coroa.svg', 'itens/fone.svg', 'itens/gravata-borboleta.svg', 'itens/laco.svg', 'itens/microfone.svg', 'itens/nariz-palhaco.svg', 'itens/oculos-escuros.svg', 'itens/peruca-oculos.svg', 'itens/pirulito.svg', 'itens/sorvete.svg', '../recursos.js', '../carregando.js', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../versao.js', '../trilha.js'];
// guarda as músicas (lista em musicas/musicas.json) uma de cada vez, em segundo plano, para jogar sem internet.
// Com "economia de dados" ligada ou no 4G, só as 6 primeiras; as outras entram na primeira vez que tocam.
function guardarMusicas() {
  var con = self.navigator && self.navigator.connection, poupar = !!(con && (con.saveData || con.type === 'cellular'));
  var base = self.registration.scope;
  return fetch(new URL('musicas/musicas.json', base).href).then(function (r) { return r.json(); }).then(function (lista) {
    lista = lista.map(function (m) { return m.arquivo; }).filter(Boolean);
    if (poupar) lista = lista.slice(0, 6);
    return caches.open(CACHE).then(function (c) {
      return lista.reduce(function (fila, a) {
        return fila.then(function () {
          var url = new URL('musicas/' + a, base).href;
          return c.match(url).then(function (r) { return r || fetch(url).then(function (resp) { if (resp.status === 200) return c.put(url, resp); }); }).catch(function () {});
        });
      }, Promise.resolve());
    });
  }).catch(function () {});
}
importScripts('../sw-comum.js');
// MP3: o <audio> pede pedaços (Range → 206), que o cache não aceita: serve a cópia inteira (200) pela URL, ou busca e guarda
function musica(e, url) {
  if (!/\.mp3$/i.test(url.pathname)) return null;
  return caches.open(CACHE).then(function (c) { return c.match(url.href); }).then(function (r) {
    return r || fetch(new Request(url.href)).then(function (resp) {
      if (resp.status === 200) { var c2 = resp.clone(); caches.open(CACHE).then(function (c) { return c.put(url.href, c2); }).catch(function () {}); }
      return resp;
    });
  });
}
var CACHE = BolinhoSW({ prefixo: 'peluqueria-', versao: VERSAO, arquivos: ARQUIVOS, depois: guardarMusicas, rota: musica });
