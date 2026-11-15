/* Cozinha — service worker: guarda o jogo inteiro no aparelho, de forma segura, pela peça comum ../sw-comum.js: a versão nova só entra
   quando chega INTEIRA (senão continua a anterior) e tudo abre da cópia do próprio jogo.
   Músicas (../rabiscolandia/musicas/*.mp3 e ../baguncolandia/musicas/*.mp3): o service worker não mexe (o navegador busca direto; sem internet,
   a trilha pula a música que não abre e some sem erro).
   Voz gravada da Dona Cida (voz/cida-*.mp3, v0.6.1): guardada na instalação e servida da cópia (funciona sem internet).
   Cache com o nome do app: só apaga caches "cozinha-" (nunca os dos outros apps da mesma origem).
   Subir VERSAO a cada release (igual a APP_VERSION em app.js e à primeira entrada de versoes.json). */
var VERSAO = '0.12.4';
var ARQUIVOS = ['./', 'index.html', 'estilo.css', 'dados.js', 'logica.js', 'desenhos.js', 'cenas.js', 'vila.js', 'app.js', 'cidade3d.js', 'lavar3d.js', 'cozinha3d.js',
  'libs/three.module.min.js', 'libs/three-LICENSE.txt', 'icone-192.png', 'icone-512.png', 'manifest.webmanifest', 'versoes.json', '../rabiscolandia/fontes/fredoka.woff2', '../recursos.js', '../carregando.js', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js',
  '../versao.js', '../trilha.js', 'fotos/acucar.jpg', 'fotos/alface.jpg', 'fotos/banana.jpg', 'fotos/batata.jpg', 'fotos/bolo-cenoura.jpg', 'fotos/brigadeiro.jpg', 'fotos/carne.jpg', 'fotos/cenoura.jpg', 'fotos/cheiro.jpg', 'fotos/chocolate.jpg',
  'fotos/churrasco.jpg', 'fotos/cookies.jpg', 'fotos/farinha.jpg', 'fotos/fermento.jpg', 'fotos/gelatina-po.jpg', 'fotos/gelatina.jpg', 'fotos/granulado.jpg', 'fotos/jabuticaba.jpg', 'fotos/laranja.jpg', 'fotos/leite.jpg', 'fotos/leitecond.jpg', 'fotos/limao.jpg',
  'fotos/maca.jpg', 'fotos/manteiga.jpg', 'fotos/mel.jpg', 'fotos/morango.jpg', 'fotos/oleo.jpg', 'fotos/omelete.jpg', 'fotos/ovo.jpg', 'fotos/panqueca.jpg', 'fotos/pao-queijo.jpg', 'fotos/pao.jpg', 'fotos/peixe-assado.jpg', 'fotos/peixe.jpg',
  'fotos/pizza.jpg', 'fotos/polvilho.jpg', 'fotos/queijo.jpg', 'fotos/sal.jpg', 'fotos/salada-frutas.jpg', 'fotos/sanduiche.jpg', 'fotos/suco-jabuticaba.jpg', 'fotos/suco-laranja.jpg', 'fotos/tomate.jpg', 'fotos/uva.jpg', 'fotos/vitamina.jpg', 'voz/cida-aqui-acucar.mp3',
  'voz/cida-aqui-farinha.mp3', 'voz/cida-aqui-leite.mp3', 'voz/cida-aqui-manteiga.mp3', 'voz/cida-aqui-mel.mp3', 'voz/cida-aqui-ovo.mp3', 'voz/cida-aqui-sal.mp3', 'voz/cida-bastante.mp3', 'voz/cida-diz.mp3', 'voz/cida-exemplo.mp3', 'voz/cida-oi-sem.mp3', 'voz/cida-oi.mp3', 'voz/cida-tchau-fim.mp3',
  'voz/cida-tchau.mp3', 'render/acucar.webp', 'render/alface.webp', 'render/banana.webp', 'render/batata.webp', 'render/carne.webp', 'render/cenoura.webp', 'render/cheiro.webp', 'render/chocolate.webp', 'render/farinha.webp', 'render/fermento.webp', 'render/gelatina-po.webp',
  'render/granulado.webp', 'render/jabuticaba.webp', 'render/laranja.webp', 'render/leite.webp', 'render/leitecond.webp', 'render/limao.webp', 'render/maca.webp', 'render/manteiga.webp', 'render/mel.webp', 'render/morango.webp', 'render/oleo.webp', 'render/ovo.webp',
  'render/pao.webp', 'render/peixe.webp', 'render/polvilho.webp', 'render/queijo.webp', 'render/sal.webp', 'render/tomate.webp', 'render/u-batedeira.webp', 'render/u-colher.webp', 'render/u-copo.webp', 'render/u-espatula.webp', 'render/u-espeto.webp', 'render/u-espremedor.webp',
  'render/u-fogao.webp', 'render/u-forma.webp', 'render/u-forno.webp', 'render/u-frigideira.webp', 'render/u-geladeira.webp', 'render/u-grelha.webp', 'render/u-liquidificador.webp', 'render/u-maos.webp', 'render/u-panela.webp', 'render/u-pia.webp', 'render/u-prato.webp', 'render/u-relogio.webp',
  'render/u-tabua.webp', 'render/u-tigela.webp', 'render/uva.webp'];
importScripts('../sw-comum.js');
// músicas (de outras pastas): o navegador busca direto; a voz gravada da Dona Cida está na lista e vem da cópia
var CACHE = BolinhoSW({ prefixo: 'cozinha-', versao: VERSAO, arquivos: ARQUIVOS, pular: function (url) { return /\.mp3$/i.test(url.pathname) && url.pathname.indexOf('/cozinha/voz/') < 0; } });
