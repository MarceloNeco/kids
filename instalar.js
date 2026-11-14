/*
  Botão fixo "Instalar o aplicativo" — usado pela estante do Bolinho de Chuva (/kids/)
  e pelos jogos. Cada página inclui:
    <script src="/kids/instalar.js" data-nome="Bolinho de Chuva" data-icone="icone-192.png"></script>
  e tem na própria pasta um manifest.webmanifest (com <link rel="manifest">) e um sw.js.

  Um botão só, para qualquer aparelho:
  - Chrome, Edge e Samsung no Android e Chrome/Edge no computador entregam a janela de instalar
    (beforeinstallprompt): o toque instala na hora.
  - Onde o navegador não tem essa janela (iPhone, Mac, Firefox, tablet Fire da Amazon, TV, navegador
    dentro de outro app), o toque abre o passo a passo daquele aparelho, detectado sem perguntar.
  - Já aberto como aplicativo, o botão some. "Já instalei" também esconde (se o navegador voltar a
    oferecer a instalação, é porque não está instalado, e o botão volta).
  Enquanto a janela de passos está aberta, <body> ganha a classe "bc-modal" (o kids.js deixa as
  setas e o OK do controle para ela).

  Nos jogos (botão "📲 Instalar" de cada cartão do Bolinho), o jogo inclui este arquivo com
    data-so-com="instalar"  → a barra só aparece quando o endereço tem ?instalar (quem só quer jogar não vê)
    data-flutuante          → barra por cima da tela do jogo, com ✕ para fechar, sem empurrar nada
    data-sw="nao"           → não registra sw.js (o próprio jogo já registra o dele)
  "Instalar um por um" (painel do Bolinho, jogos.js): o jogo abre com ?instalar=1&fila=1 e a barra ganha o botão
  "Próximo ›" (ou "Pular ›" antes de instalar), que leva ao próximo jogo da fila (localStorage "bolinho:fila") e,
  no fim, de volta ao Bolinho com ?fila=fim.
*/
(function () {
  function T(pt, en, es) { return window.BolinhoIdioma ? BolinhoIdioma.t(pt, en, es) : pt; }
  var script = document.currentScript;
  var NOME = (script && script.getAttribute('data-nome')) || 'Bolinho de Chuva';
  var ICONE = (script && script.getAttribute('data-icone')) || 'icone-192.png';
  var SO_COM = script && script.getAttribute('data-so-com');
  var FLUTUANTE = !!(script && script.hasAttribute('data-flutuante'));
  var FILA = /[?&]fila\b/.test(location.search);
  if (SO_COM && !new RegExp('[?&]' + SO_COM + '\\b').test(location.search)) return;
  var ua = navigator.userAgent;
  var CHAVE = 'bolinho:instalado:' + location.pathname;
  var pedido = null; // janela de instalar guardada pelo navegador

  function ler() { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } }
  function gravar(v) { try { if (v) localStorage.setItem(CHAVE, v); else localStorage.removeItem(CHAVE); } catch (e) {} }

  if ('serviceWorker' in navigator && !(script && script.getAttribute('data-sw') === 'nao')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }

  var comoApp = (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: minimal-ui)').matches)) || navigator.standalone === true;
  if (comoApp) return;

  var css = '' +
    '.bc-inst{position:sticky;top:0;z-index:10;display:flex;justify-content:center;width:100%;padding:.7rem 0 .8rem;pointer-events:none}' +
    '.bc-inst[hidden]{display:none}' +
    '.bc-btn{pointer-events:auto;display:inline-flex;align-items:center;gap:.6rem;min-height:48px;padding:.55rem 1.3rem .55rem .9rem;border:0;border-radius:999px;font:inherit;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-weight:800;font-size:1.05rem;color:#1a1446;background:#c6ff3d;background:linear-gradient(90deg,#c6ff3d,#3ee8ff);box-shadow:0 6px 20px rgba(62,232,255,.25);cursor:pointer}' +
    '.bc-btn svg{width:1.6rem;height:1.6rem;flex:none}' +
    '.bc-btn small{font-weight:600;font-size:.8rem;opacity:.75}' +
    '@media (max-width:22rem){.bc-btn small{display:none}}' +
    '.bc-btn:hover,.bc-btn:focus,.bc-btn:focus-visible{outline:3px solid #ffd166;outline-offset:3px}' +
    '.bc-btn.ok{background:#c6ff3d}' +
    '.bc-fundo{position:fixed;top:0;left:0;right:0;bottom:0;z-index:20;background:rgba(5,4,20,.7);display:flex;align-items:flex-end;justify-content:center;padding:1rem;opacity:0;transition:opacity .2s ease-out;text-align:left}' +
    '.bc-fundo[hidden]{display:none}' +
    '.bc-fundo.aberto{opacity:1}' +
    '.bc-passos{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:1rem;color:#f3f0ff;background:#221b4d;border:1px solid #3a2f73;border-radius:20px;max-width:30rem;width:100%;max-height:90vh;overflow:auto;padding:1.3rem 1.3rem 1.1rem;transform:translateY(24px);transition:transform .2s ease-out}' +
    '.bc-fundo.aberto .bc-passos{transform:none}' +
    '@media (min-width:40rem){.bc-fundo{align-items:center}}' +
    '.bc-topo{display:flex;align-items:center;gap:.7rem;margin-bottom:.8rem}' +
    '.bc-topo img{width:48px;height:48px;border-radius:12px}' +
    '.bc-passos h2{font-size:1.2rem;flex:1;margin:0;color:#f3f0ff;background:none}' +
    '.bc-fechar{width:44px;height:44px;border:0;border-radius:50%;background:#3a2f73;color:#f3f0ff;font-size:1.3rem;cursor:pointer;flex:none}' +
    '.bc-passos ol{padding-left:1.4rem;line-height:1.55;margin:.6rem 0}' +
    '.bc-passos li{margin:.35rem 0}' +
    '.bc-passos p{line-height:1.5;margin:.5rem 0;font-size:1rem;color:#f3f0ff}' +
    '.bc-passos .en{color:#b3acd6;font-size:.85rem;font-style:italic}' +
    '.bc-passos button .en,.bc-passos a .en{color:inherit;font-size:inherit;font-style:normal}' +
    '.bc-passos .aviso{background:rgba(255,209,102,.12);border-left:3px solid #ffd166;padding:.5rem .7rem;border-radius:8px}' +
    '.bc-passos a{color:#3ee8ff}' +
    '.bc-botoes{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1rem}' +
    '.bc-botoes a,.bc-botoes button{min-height:44px;padding:.5rem 1rem;border-radius:999px;font:inherit;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;border:0}' +
    '.bc-botoes a:focus,.bc-botoes button:focus,.bc-fechar:focus{outline:3px solid #ffd166;outline-offset:2px}' +
    '.bc-passos a.bc-forte{background:#c6ff3d;color:#1a1446}' +
    '.bc-leve{background:transparent;color:#f3f0ff;border:1px solid #3a2f73!important}' +
    '@media (prefers-reduced-motion:reduce){.bc-passos,.bc-fundo{transition:none}}' +
    '.bc-inst.bc-flut{position:fixed;left:0;right:0;top:0;z-index:2147483000;align-items:center;gap:.5rem;padding:.6rem .5rem;background:rgba(11,10,31,.88)}' +
    '.bc-flut .bc-x{pointer-events:auto;width:44px;height:44px;border:0;border-radius:50%;background:#3a2f73;color:#f3f0ff;font-size:1.2rem;cursor:pointer;flex:none}' +
    '.bc-fundo{z-index:2147483001}' +
    '.bc-prox{pointer-events:auto;min-height:48px;padding:.5rem 1rem;border-radius:999px;border:1px solid #3a2f73;background:#221b4d;color:#f3f0ff;font:inherit;font-weight:700;cursor:pointer}' +
    '.bc-prox.ok{border:0;background:#c6ff3d;color:#1a1446}' +
    '.bc-inst{gap:.5rem;flex-wrap:wrap}';
  var estilo = document.createElement('style');
  estilo.textContent = css;
  document.head.appendChild(estilo);

  var barra = document.createElement('div');
  barra.className = 'bc-inst';
  barra.innerHTML = '<button type="button" class="bc-btn" aria-haspopup="dialog">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M12 7v7"/><path d="M9 11l3 3 3-3"/><path d="M10.5 18.5h3"/></svg>' +
    '<span><span class="pt">Instalar o aplicativo</span><span class="en">Install the app</span><span class="es">Instalar la aplicación</span></span></button>';
  if (FLUTUANTE) {
    barra.className += ' bc-flut';
    var x = document.createElement('button');
    x.type = 'button'; x.className = 'bc-x'; x.textContent = '✕';
    x.setAttribute('aria-label', T('Fechar', 'Close', 'Cerrar'));
    x.addEventListener('click', function () { barra.hidden = true; });
    barra.appendChild(x);
  }
  // "Instalar um por um": botão para seguir para o próximo jogo da fila
  var bProx = null;
  function lerFila() { try { return JSON.parse(localStorage.getItem('bolinho:fila') || '[]') || []; } catch (e) { return []; } }
  function proximo() {
    var fila = lerFila(), seg = fila.shift();
    try { localStorage.setItem('bolinho:fila', JSON.stringify(fila)); } catch (e) {}
    location.href = seg ? seg.url + '?instalar=1&fila=1' : '/kids/?fila=fim';
  }
  function rotuloProx(feito) {
    var seg = lerFila()[0];
    bProx.textContent = seg ? (feito ? T('Próximo: ', 'Next: ', 'Siguiente: ') + seg.nome + ' ›' : T('Pular ›', 'Skip ›', 'Saltar ›')) : (feito ? T('Terminar ›', 'Finish ›', 'Terminar ›') : T('Pular e terminar ›', 'Skip and finish ›', 'Saltar y terminar ›'));
    bProx.className = feito ? 'bc-btn bc-prox ok' : 'bc-prox';
  }
  if (FILA) {
    bProx = document.createElement('button');
    bProx.type = 'button';
    bProx.addEventListener('click', proximo);
    barra.insertBefore(bProx, barra.children[1] || null);
    rotuloProx(false);
  }
  document.body.insertBefore(barra, document.body.firstChild);
  var botao = barra.querySelector('button');
  var texto = barra.querySelector('span');
  if (ler() && !FILA) barra.hidden = true;

  var fundo = document.createElement('div');
  fundo.className = 'bc-fundo';
  fundo.hidden = true;
  fundo.innerHTML = '<div class="bc-passos" role="dialog" aria-modal="true" aria-labelledby="bcTitulo">' +
    '<div class="bc-topo"><img src="' + ICONE + '" alt=""><h2 id="bcTitulo">' + T('Instalar o ', 'Install ', 'Instalar ') + NOME + '</h2>' +
    '<button type="button" class="bc-fechar" aria-label="' + T('Fechar', 'Close', 'Cerrar') + '">✕</button></div>' +
    '<div class="bc-corpo"></div>' +
    '<div class="bc-botoes"><button type="button" class="bc-leve bc-ja"><span class="pt">✓ Já instalei</span><span class="en">✓ I installed it</span><span class="es">✓ Ya la instalé</span></button></div></div>';
  document.body.appendChild(fundo);
  var corpo = fundo.querySelector('.bc-corpo');

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    pedido = e;
    gravar(null);       // o navegador diz que ainda não está instalado
    barra.hidden = false;
  });
  window.addEventListener('appinstalled', function () { pedido = null; gravar('1'); pronto(); });

  function pronto() {
    botao.className = 'bc-btn ok';
    texto.innerHTML = T('✓ Instalado! Procure o ícone ', '✓ Installed! Look for the icon ', '✓ ¡Instalada! Busca el ícono ') + NOME;
    if (FILA) { barra.hidden = false; rotuloProx(true); return; }   // na fila, a barra fica para seguir ao próximo
    setTimeout(function () { barra.hidden = true; }, 6000);
  }

  // Qual aparelho e navegador é (para escrever o passo a passo certo).
  var tv = /SmartTV|SMART-TV|Web0S|WebOS|Tizen|NetCast|HbbTV|BRAVIA|VIDAA|Roku|AFT[A-Z]|Android TV|GoogleTV|CrKey/i.test(ua);
  var fire = /Silk\//.test(ua) && !tv;   // tablet Fire da Amazon (navegador Silk)
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var android = /Android/.test(ua);
  var samsung = /SamsungBrowser/.test(ua) && !tv;
  var dentroDeApp = /FBAN|FBAV|Instagram|Line\/|WhatsApp|; wv\)|GSA\//.test(ua);
  var firefox = /Firefox|FxiOS/.test(ua);
  var edge = /Edg\//.test(ua);
  var macSafari = /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox/.test(ua) && !ios;
  var endereco = location.href.split('#')[0];

  function linkChrome() {
    return 'intent://' + location.host + location.pathname + location.search + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(endereco) + ';end';
  }

  // Passo a passo de cada aparelho, no idioma escolhido na estante (idioma.js).
  function passos() {
    var N = NOME;
    if (tv) return T('<p>Na TV não existe "instalar" pelo navegador, mas dá para deixar o ' + N + ' a um clique:</p>' +
      '<ol><li>Com esta página aberta, aperte o botão de <b>menu</b> do navegador da TV (às vezes é a engrenagem ou os <b>três pontinhos</b>).</li>' +
      '<li>Escolha <b>Adicionar aos favoritos</b> (em algumas TVs aparece <b>Fixar na tela inicial</b> ou <b>Adicionar à página inicial</b>: use esse, se tiver).</li>' +
      '<li>Da próxima vez, abra o navegador e escolha <b>' + N + '</b> nos favoritos.</li></ol>' +
      '<p class="aviso">TV LG: dá para ter o ícone na barra de apps, igual ao Netflix. Peça para alguém seguir no computador o <a href="https://github.com/MarceloNeco/kids/blob/main/tv-lg-kids/LEIA-ME.md" target="_blank" rel="noopener">passo a passo da TV LG</a>.</p>',
      '<p>TVs can\'t "install" sites from the browser, but you can keep ' + N + ' just one click away:</p>' +
      '<ol><li>With this page open, press the TV browser\'s <b>menu</b> button (sometimes it\'s a gear or <b>three dots</b>).</li>' +
      '<li>Choose <b>Add to favorites</b> (some TVs show <b>Pin to home</b> or <b>Add to home page</b>: use that one if you have it).</li>' +
      '<li>Next time, open the browser and pick <b>' + N + '</b> from your favorites.</li></ol>' +
      '<p class="aviso">LG TV: you can have the icon in the apps bar, just like Netflix. Ask someone to follow the <a href="https://github.com/MarceloNeco/kids/blob/main/tv-lg-kids/LEIA-ME.md" target="_blank" rel="noopener">LG TV step-by-step guide</a> on a computer.</p>',
      '<p>En la tele no se puede "instalar" desde el navegador, pero puedes dejar ' + N + ' a un clic:</p>' +
      '<ol><li>Con esta página abierta, aprieta el botón de <b>menú</b> del navegador de la tele (a veces es un engranaje o <b>tres puntitos</b>).</li>' +
      '<li>Elige <b>Agregar a favoritos</b> (en algunas teles aparece <b>Fijar en el inicio</b> o <b>Agregar a la página de inicio</b>: usa esa, si la tiene).</li>' +
      '<li>La próxima vez, abre el navegador y elige <b>' + N + '</b> en favoritos.</li></ol>' +
      '<p class="aviso">Tele LG: puedes tener el ícono en la barra de apps, igual que Netflix. Pide a alguien que siga en la computadora la <a href="https://github.com/MarceloNeco/kids/blob/main/tv-lg-kids/LEIA-ME.md" target="_blank" rel="noopener">guía paso a paso de la tele LG</a>.</p>');
    if (fire) return T('<p>No tablet Fire, o navegador da Amazon (Silk) põe o ícone na tela inicial assim:</p>' +
      '<ol><li>Toque nos <b>três pontinhos ⋮</b>, no canto de cima, à direita da barra de endereço.</li>' +
      '<li>Toque em <b>Adicionar à tela inicial</b> (em inglês: <b>Add to Home Screen</b>). Se não estiver na lista, role a lista para baixo.</li>' +
      '<li>Deixe o nome <b>' + N + '</b> e toque em <b>Adicionar</b>.</li>' +
      '<li>Volte para a tela inicial do tablet e abra pelo <b>ícone do ' + N + '</b> (não pelo navegador).</li></ol>' +
      '<p class="aviso">📺 <b>É assim que fica em tela cheia no Fire.</b> Aberto pelo ícone, o ' + N + ' abre sem a barra de endereço, como um aplicativo. No navegador do Fire a barra não some — ele não tem tela cheia.</p>' +
      '<p class="aviso">Se o tablet estiver no perfil de criança (Amazon Kids) e essa opção não aparecer, faça estes passos no perfil do adulto.</p>',
      '<p>On a Fire tablet, the Amazon browser (Silk) puts the icon on the home screen like this:</p>' +
      '<ol><li>Tap the <b>three dots ⋮</b> in the top corner, to the right of the address bar.</li>' +
      '<li>Tap <b>Add to Home Screen</b>. If it isn\'t on the list, scroll down.</li>' +
      '<li>Keep the name <b>' + N + '</b> and tap <b>Add</b>.</li>' +
      '<li>Go back to the tablet\'s home screen and open it from the <b>' + N + ' icon</b> (not from the browser).</li></ol>' +
      '<p class="aviso">📺 <b>That\'s how you get full screen on a Fire.</b> Opened from the icon, ' + N + ' has no address bar, just like an app. In the Fire browser the bar never goes away: it has no full screen.</p>' +
      '<p class="aviso">If the tablet is on a child profile (Amazon Kids) and you can\'t see this option, do these steps on the adult profile.</p>',
      '<p>En la tableta Fire, el navegador de Amazon (Silk) pone el ícono en la pantalla de inicio así:</p>' +
      '<ol><li>Toca los <b>tres puntitos ⋮</b> arriba, a la derecha de la barra de direcciones.</li>' +
      '<li>Toca <b>Agregar a la pantalla de inicio</b> (en inglés: <b>Add to Home Screen</b>). Si no está en la lista, baja un poco.</li>' +
      '<li>Deja el nombre <b>' + N + '</b> y toca <b>Agregar</b>.</li>' +
      '<li>Vuelve a la pantalla de inicio de la tableta y ábrelo desde el <b>ícono de ' + N + '</b> (no desde el navegador).</li></ol>' +
      '<p class="aviso">📺 <b>Así se ve en pantalla completa en la Fire.</b> Abierto desde el ícono, ' + N + ' se abre sin la barra de direcciones, como una aplicación. En el navegador de la Fire la barra no desaparece: no tiene pantalla completa.</p>' +
      '<p class="aviso">Si la tableta está en el perfil infantil (Amazon Kids) y no aparece esta opción, haz estos pasos en el perfil del adulto.</p>');
    if (ios) return T('<ol><li>Abra esta página no <b>Safari</b> (se estiver dentro de outro app, toque em <b>Abrir no Safari</b>).</li>' +
      '<li>Toque em <b>Compartilhar</b> (o quadrado com a seta para cima ⬆, embaixo ou no topo da tela).</li>' +
      '<li>Role a lista e toque em <b>Adicionar à Tela de Início</b>.</li>' +
      '<li>Toque em <b>Adicionar</b>. O ícone aparece junto dos seus apps.</li></ol>',
      '<ol><li>Open this page in <b>Safari</b> (if you\'re inside another app, tap <b>Open in Safari</b>).</li>' +
      '<li>Tap <b>Share</b> (the square with the up arrow ⬆, at the bottom or top of the screen).</li>' +
      '<li>Scroll down the list and tap <b>Add to Home Screen</b>.</li>' +
      '<li>Tap <b>Add</b>. The icon shows up with your other apps.</li></ol>',
      '<ol><li>Abre esta página en <b>Safari</b> (si estás dentro de otra app, toca <b>Abrir en Safari</b>).</li>' +
      '<li>Toca <b>Compartir</b> (el cuadrito con la flecha hacia arriba ⬆, abajo o arriba de la pantalla).</li>' +
      '<li>Baja en la lista y toca <b>Agregar a pantalla de inicio</b>.</li>' +
      '<li>Toca <b>Agregar</b>. El ícono aparece junto a tus apps.</li></ol>');
    if (samsung) return T('<p>No navegador da Samsung, instalar pode mostrar um alerta do Google ("app de risco"). O ' + N + ' não tem risco nenhum: o alerta é do jeito que esse navegador instala. Pelo <b>Chrome</b> instala sem alerta:</p>' +
      '<ol><li>Toque em <b>Abrir no Chrome</b> (botão abaixo).</li>' +
      '<li>No Chrome, toque de novo em <b>Instalar o aplicativo</b>, no topo da página.</li>' +
      '<li>Toque em <b>Instalar</b>. Pronto: o ícone aparece na tela do celular.</li></ol>' +
      '<p class="aviso">Já apareceu o alerta? Toque em <b>OK</b> e siga os passos acima.</p>',
      '<p>In the Samsung browser, installing may show a Google warning ("risky app"). ' + N + ' is completely safe: the warning comes from the way that browser installs. With <b>Chrome</b> it installs with no warning:</p>' +
      '<ol><li>Tap <b>Open in Chrome</b> (button below).</li>' +
      '<li>In Chrome, tap <b>Install the app</b> again, at the top of the page.</li>' +
      '<li>Tap <b>Install</b>. Done: the icon shows up on your phone\'s screen.</li></ol>' +
      '<p class="aviso">Already got the warning? Tap <b>OK</b> and follow the steps above.</p>',
      '<p>En el navegador de Samsung, instalar puede mostrar una alerta de Google ("app de riesgo"). ' + N + ' no tiene ningún riesgo: la alerta sale por la forma en que instala ese navegador. Con <b>Chrome</b> se instala sin alerta:</p>' +
      '<ol><li>Toca <b>Abrir en Chrome</b> (botón de abajo).</li>' +
      '<li>En Chrome, toca otra vez <b>Instalar la aplicación</b>, arriba de la página.</li>' +
      '<li>Toca <b>Instalar</b>. Listo: el ícono aparece en la pantalla del celular.</li></ol>' +
      '<p class="aviso">¿Ya te salió la alerta? Toca <b>OK</b> y sigue los pasos de arriba.</p>') + '<div class="bc-botoes"><a class="bc-forte" href="' + linkChrome() + '">' + T('Abrir no Chrome', 'Open in Chrome', 'Abrir en Chrome') + '</a></div>';
    if (android && dentroDeApp) return T('<p>Você abriu esta página dentro de outro app (WhatsApp, Instagram…). Para instalar, abra no Chrome:</p>' +
      '<ol><li>Toque em <b>Abrir no Chrome</b> (botão abaixo) ou nos <b>três pontinhos ⋮</b> e em <b>Abrir no navegador</b>.</li>' +
      '<li>No Chrome, toque em <b>Instalar o aplicativo</b>, no topo da página.</li></ol>',
      '<p>You opened this page inside another app (WhatsApp, Instagram…). To install it, open it in Chrome:</p>' +
      '<ol><li>Tap <b>Open in Chrome</b> (button below), or the <b>three dots ⋮</b> and <b>Open in browser</b>.</li>' +
      '<li>In Chrome, tap <b>Install the app</b> at the top of the page.</li></ol>',
      '<p>Abriste esta página dentro de otra app (WhatsApp, Instagram…). Para instalarla, ábrela en Chrome:</p>' +
      '<ol><li>Toca <b>Abrir en Chrome</b> (botón de abajo) o los <b>tres puntitos ⋮</b> y <b>Abrir en el navegador</b>.</li>' +
      '<li>En Chrome, toca <b>Instalar la aplicación</b>, arriba de la página.</li></ol>') + '<div class="bc-botoes"><a class="bc-forte" href="' + linkChrome() + '">' + T('Abrir no Chrome', 'Open in Chrome', 'Abrir en Chrome') + '</a></div>';
    if (android) return T('<ol><li>Toque nos <b>três pontinhos ⋮</b> do navegador (no canto de cima ou de baixo).</li>' +
      '<li>Toque em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</li>' +
      '<li>Confirme em <b>Instalar</b>. O ícone aparece junto dos seus apps.</li></ol>' +
      '<p class="aviso">Se essa opção não aparecer, talvez já esteja instalado: procure o ícone <b>' + N + '</b> nos seus apps.</p>',
      '<ol><li>Tap the browser\'s <b>three dots ⋮</b> (in the top or bottom corner).</li>' +
      '<li>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li>' +
      '<li>Confirm with <b>Install</b>. The icon shows up with your other apps.</li></ol>' +
      '<p class="aviso">If you can\'t see that option, it may already be installed: look for the <b>' + N + '</b> icon in your apps.</p>',
      '<ol><li>Toca los <b>tres puntitos ⋮</b> del navegador (arriba o abajo).</li>' +
      '<li>Toca <b>Instalar app</b> o <b>Agregar a la pantalla principal</b>.</li>' +
      '<li>Confirma con <b>Instalar</b>. El ícono aparece junto a tus apps.</li></ol>' +
      '<p class="aviso">Si no aparece esa opción, quizá ya esté instalada: busca el ícono <b>' + N + '</b> en tus apps.</p>');
    if (macSafari) return T('<ol><li>No menu do topo da tela, clique em <b>Arquivo</b>.</li>' +
      '<li>Clique em <b>Adicionar ao Dock</b> e em <b>Adicionar</b>.</li></ol>',
      '<ol><li>In the menu at the top of the screen, click <b>File</b>.</li>' +
      '<li>Click <b>Add to Dock</b>, then <b>Add</b>.</li></ol>',
      '<ol><li>En el menú de arriba de la pantalla, haz clic en <b>Archivo</b>.</li>' +
      '<li>Haz clic en <b>Agregar al Dock</b> y en <b>Agregar</b>.</li></ol>');
    if (firefox) return T('<p>O Firefox do computador não instala sites como aplicativo. Abra esta mesma página no <b>Chrome</b> ou no <b>Edge</b> e toque em <b>Instalar o aplicativo</b>.</p>' +
      '<p>Ou, para ter só um atalho: aperte <b>Ctrl + D</b> (no Mac, <b>⌘ + D</b>) para guardar nos favoritos.</p>',
      '<p>Firefox on a computer can\'t install sites as apps. Open this same page in <b>Chrome</b> or <b>Edge</b> and tap <b>Install the app</b>.</p>' +
      '<p>Or, for just a shortcut: press <b>Ctrl + D</b> (on a Mac, <b>⌘ + D</b>) to save it to your bookmarks.</p>',
      '<p>Firefox en la computadora no instala sitios como aplicación. Abre esta misma página en <b>Chrome</b> o en <b>Edge</b> y toca <b>Instalar la aplicación</b>.</p>' +
      '<p>O, para tener solo un acceso directo: aprieta <b>Ctrl + D</b> (en Mac, <b>⌘ + D</b>) para guardarla en favoritos.</p>');
    if (edge) return T('<ol><li>Clique nos <b>três pontinhos ⋯</b> no canto de cima do Edge.</li>' +
      '<li>Clique em <b>Aplicativos</b> → <b>Instalar este site como um aplicativo</b>.</li>' +
      '<li>Clique em <b>Instalar</b>. Abre na janela própria e ganha ícone no menu Iniciar.</li></ol>' +
      '<p class="aviso">Se a opção não aparecer, já deve estar instalado: procure <b>' + N + '</b> no menu Iniciar.</p>',
      '<ol><li>Click the <b>three dots ⋯</b> in the top corner of Edge.</li>' +
      '<li>Click <b>Apps</b> → <b>Install this site as an app</b>.</li>' +
      '<li>Click <b>Install</b>. It opens in its own window and gets an icon in the Start menu.</li></ol>' +
      '<p class="aviso">If the option isn\'t there, it\'s probably already installed: look for <b>' + N + '</b> in the Start menu.</p>',
      '<ol><li>Haz clic en los <b>tres puntitos ⋯</b> arriba en Edge.</li>' +
      '<li>Haz clic en <b>Aplicaciones</b> → <b>Instalar este sitio como una aplicación</b>.</li>' +
      '<li>Haz clic en <b>Instalar</b>. Se abre en su propia ventana y tiene ícono en el menú Inicio.</li></ol>' +
      '<p class="aviso">Si no aparece la opción, seguro ya está instalada: busca <b>' + N + '</b> en el menú Inicio.</p>');
    return T('<ol><li>Clique no ícone de <b>instalar</b> no fim da barra de endereço (um monitor com uma seta ⤓), se aparecer.</li>' +
      '<li>Ou clique nos <b>três pontinhos ⋮</b> → <b>Transmitir, salvar e compartilhar</b> → <b>Instalar página como app</b>.</li>' +
      '<li>Clique em <b>Instalar</b>. Abre na janela própria, com ícone na área de trabalho.</li></ol>' +
      '<p class="aviso">Se nada disso aparecer, já deve estar instalado: procure <b>' + N + '</b> nos seus programas.</p>',
      '<ol><li>Click the <b>install</b> icon at the end of the address bar (a screen with an arrow ⤓), if you see it.</li>' +
      '<li>Or click the <b>three dots ⋮</b> → <b>Cast, save and share</b> → <b>Install page as app</b>.</li>' +
      '<li>Click <b>Install</b>. It opens in its own window, with an icon on your desktop.</li></ol>' +
      '<p class="aviso">If none of this shows up, it\'s probably already installed: look for <b>' + N + '</b> in your programs.</p>',
      '<ol><li>Haz clic en el ícono de <b>instalar</b> al final de la barra de direcciones (una pantalla con una flecha ⤓), si aparece.</li>' +
      '<li>O haz clic en los <b>tres puntitos ⋮</b> → <b>Transmitir, guardar y compartir</b> → <b>Instalar página como app</b>.</li>' +
      '<li>Haz clic en <b>Instalar</b>. Se abre en su propia ventana, con ícono en el escritorio.</li></ol>' +
      '<p class="aviso">Si no aparece nada de esto, seguro ya está instalada: busca <b>' + N + '</b> en tus programas.</p>');
  }

  // Janela de passos: abre com movimento curto, fecha no ✕, no Esc, tocando fora e no Voltar do celular.
  var naHistoria = false;
  function abrir() {
    corpo.innerHTML = passos();
    fundo.hidden = false;
    document.body.classList.add('bc-modal');
    requestAnimationFrame(function () { fundo.classList.add('aberto'); });
    fundo.querySelector('.bc-fechar').focus();
    try { history.pushState({ bcPassos: 1 }, ''); naHistoria = true; } catch (e) {}
  }
  function fechar(pelaHistoria) {
    if (fundo.hidden) return;
    fundo.classList.remove('aberto');
    fundo.hidden = true;
    document.body.classList.remove('bc-modal');
    if (!barra.hidden) botao.focus();
    if (naHistoria && !pelaHistoria) { naHistoria = false; history.back(); }
    naHistoria = false;
  }
  window.addEventListener('popstate', function () { if (!fundo.hidden) fechar(true); });
  fundo.querySelector('.bc-fechar').addEventListener('click', function () { fechar(); });
  fundo.addEventListener('click', function (e) { if (e.target === fundo) fechar(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.keyCode === 27) fechar(); });
  fundo.querySelector('.bc-ja').addEventListener('click', function () {
    gravar('1'); fechar();
    if (FILA) return pronto();
    barra.hidden = true;
  });

  botao.addEventListener('click', function () {
    if (!pedido) { abrir(); return; }
    var p = pedido;
    pedido = null; // a janela do navegador só pode ser usada uma vez
    p.prompt();
    p.userChoice.then(function (r) {
      if (r && r.outcome === 'accepted') { gravar('1'); pronto(); }
    }).catch(function () {});
  });
})();
