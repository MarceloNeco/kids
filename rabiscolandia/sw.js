/* Rabiscolândia — service worker: guarda o jogo inteiro no aparelho, de forma segura, pela peça comum ../sw-comum.js: a versão
   nova só entra quando chega INTEIRA (senão continua a anterior) e tudo abre da cópia do próprio jogo. Músicas
   gravadas (*.mp3): o service worker não mexe (o navegador busca direto).
   Subir VERSAO a cada release (igual a APP_VERSION em app.js e a versoes.json). */
var VERSAO = '0.1.18';
var ARQUIVOS = ['./', 'index.html', 'estilo.css', 'folha.js', 'paginas.js', 'fundos.js', 'adesivos.js', 'som.js', 'pintura.js', 'mao.js', 'tour.js', 'app.js', 'sala.js', 'tv.js', 'fontes/fredoka.woff2', 'icone-192.png', 'icone-512.png', 'manifest.webmanifest', 'versoes.json', '../recursos.js', '../carregando.js', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../versao.js', '../trilha.js'];
importScripts('../sw-comum.js');
var CACHE = BolinhoSW({ prefixo: 'rabiscolandia-', versao: VERSAO, arquivos: ARQUIVOS, pular: function (url) { return /\.mp3$/i.test(url.pathname); } });
