/* Batalha Naval — service worker: guarda o jogo inteiro no aparelho, de forma segura, pela peça comum ../sw-comum.js: a versão
   nova só entra quando chega INTEIRA (senão continua a anterior) e tudo abre da cópia do próprio jogo. Músicas
   gravadas (*.mp3): o service worker não mexe (o navegador busca direto).
   Subir VERSAO a cada release (igual a APP_VERSION em app.js e a versoes.json). */
var VERSAO = '0.4.1';
var ARQUIVOS = ['./', 'index.html', 'estilo.css', 'logica.js', 'rede.js', 'som.js', 'navios.js', 'efeitos.js', 'app.js', 'icone-192.png', 'icone-512.png', 'manifest.webmanifest', 'versoes.json', 'pertinho.js', 'qr.js', 'libs/qrcode.js', 'libs/jsQR.js', '../recursos.js', '../carregando.js', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../trilha.js', '../rabiscolandia/fontes/fredoka.woff2'];
importScripts('../sw-comum.js');
var CACHE = BolinhoSW({ prefixo: 'batalha-naval-', versao: VERSAO, arquivos: ARQUIVOS, pular: function (url) { return /\.mp3$/i.test(url.pathname); } });
