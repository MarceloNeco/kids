/* AQUA — service worker: guarda o jogo inteiro no aparelho, de forma segura, pela peça comum ../sw-comum.js: a versão
   nova só entra quando chega INTEIRA (senão continua a anterior) e tudo abre da cópia do próprio jogo. Músicas
   gravadas (*.mp3): o service worker não mexe (o navegador busca direto); os efeitos de sons/ ficam guardados.
   Subir VERSAO a cada release (igual a APP_VERSION em app.js e a versoes.json). */
var VERSAO = '0.4.1';
var ARQUIVOS = ['./', 'index.html', 'estilo.css', 'motor.js', 'cubo-motor.js', 'cubo3d.js', 'libs/three.module.min.js', 'som.js', 'desenho.js', 'fundo.js', 'app.js', 'icone.svg', 'icone-192.png', 'icone-512.png', 'manifest.webmanifest', 'versoes.json', 'sons/despejar.mp3', 'sons/glub.mp3', 'sons/rolha.mp3', 'sons/vidro.mp3', 'sons/brilho.mp3', 'sons/aplausos.mp3', 'sons/erro.mp3', 'sons/sanfona.mp3', 'cenas/foto-cachoeira.webp', 'cenas/foto-praia.webp', 'cenas/foto-flores.webp', 'cenas/foto-floresta.webp', 'cenas/foto-baloes.webp', 'cenas/foto-recife.webp', 'cenas/foto-bandeirinhas.webp', 'cenas/foto-nebulosa.webp', '../rabiscolandia/fontes/fredoka.woff2', '../recursos.js', '../carregando.js', '../idioma.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../trilha.js'];
importScripts('../sw-comum.js');
var CACHE = BolinhoSW({ prefixo: 'aqua-', versao: VERSAO, arquivos: ARQUIVOS, pular: function (url) {
  // músicas: o navegador busca direto; os efeitos da pasta sons/ (o som.js baixa cada um inteiro) ficam guardados
  var efeito = /\/aqua\/sons\/[^\/]+\.mp3$/i.test(url.pathname);
  return /\.mp3$/i.test(url.pathname) && !efeito;
} });
