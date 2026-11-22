/* Service worker do Meu Pequeno Amiguinho: pela peça comum ../sw-comum.js (jogo íntegro no aparelho). As músicas
   gravadas (*.mp3): o service worker não mexe (o navegador busca direto).
   Subir VERSAO a cada release (igual a APP_VERSION em app.js e a versoes.json). */
var VERSAO = '0.3.0';
var ARQUIVOS = ['./', 'index.html', 'estilo.css', 'dados.js', 'arte.js', 'regras.js', 'voz.js', 'vivo.js', 'app.js', 'icone.svg', 'icone-192.png', 'icone-512.png', 'manifest.webmanifest', 'versoes.json', 'vozes/lista.json', '../rabiscolandia/fontes/fredoka.woff2', '../recursos.js', '../carregando.js', '../idioma.js', '../personagens.js', '../navegacao.js', '../atualizar.js', '../telacheia.js', '../trilha.js', '../instalar.js'];
importScripts('../sw-comum.js');
var CACHE = BolinhoSW({ prefixo: 'meu-amiguinho-', versao: VERSAO, arquivos: ARQUIVOS, pular: function (url) { return /\.mp3$/i.test(url.pathname); } });
