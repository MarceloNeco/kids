/*
  Navegação padrão — o mesmo arquivo para todos os jogos do Bolinho de Chuva (pedido do dono, 07/Nov/2026):
  todo jogo tem, sempre no mesmo lugar (canto de cima, à esquerda), um quadradinho 🏠 Início e uma portinha 🚪 Saída.
    - 🏠 Início: só aparece fora da tela de começo do jogo; leva de volta para ela.
    - 🚪 Saída: sempre à vista; sai do jogo. Com uma partida rolando, pergunta antes. No aplicativo instalado tenta
      fechar a janela; se ela continuar aberta (ou numa aba do navegador, que não se fecha sozinha), vai para a
      estante do Bolinho de Chuva (/kids/).
    - Voltar do celular: numa tela de dentro faz o mesmo que o 🏠; na tela de começo NÃO sai direto (diretriz): avisa
      "Toque em Voltar de novo para sair" e só o segundo Voltar sai (volta para a página de antes, normalmente a estante;
      no app instalado, fecha). A maioria dos jogos já cuida do Voltar (pushState/popstate); quem não cuida passa
      cuidarDoVoltar: true e este arquivo põe uma entrada no histórico ao sair da tela de começo.
    - Guarda (dono, 14/Nov/2026: "o Voltar às vezes acaba com o progresso e cai na home do celular"): no primeiro toque
      na tela de começo, este arquivo põe uma entrada de guarda no histórico (com toque, porque o Chrome do celular pula
      as entradas criadas sem toque — era isso que fazia o Voltar atravessar o jogo e fechar o app). Se o Voltar chegar
      na guarda com o jogo numa tela de dentro (alguma entrada do jogo foi pulada), o jogo volta ao começo em vez de
      fechar. Na tela de começo, sair da guarda mostra o aviso; a guarda volta no próximo toque. O jogo que já faz o
      próprio aviso passa guarda: false.
  Cada jogo inclui, no index.html, logo depois do idioma.js (sem defer: o app.js do jogo chama BolinhoNav.iniciar):
      <script src="../navegacao.js" data-fora-do-arquivo></script>
  põe '../navegacao.js' na lista ARQUIVOS do sw.js e, no app.js:
      BolinhoNav.iniciar({
        jogo: 'campo-minado',
        noInicio: function () { return telaAtual === 'menu'; },   // está na tela de começo?
        irParaInicio: function () { ... },                        // o que o 🏠 faz (o mesmo do Voltar)
        emAndamento: function () { return partidaRolando; },      // opcional: pergunta antes de sair
        antesDeSair: function () { ... },                         // opcional: arrumar antes de sair (ex.: avisar a rede)
        cuidarDoVoltar: false,                                     // true = o jogo não mexe no histórico
        guarda: true,                                              // false = o jogo já avisa "Voltar de novo para sair"
        posicao: 'topo-esquerda',                                  // ou 'topo-direita', se o canto esquerdo é do jogo
        desvio: { x: 0, y: 0 },                                    // opcional: afastar da borda (px)
        esconder: function () { return false; }                   // opcional: some (ex.: TV). Padrão: some com ?tv=
      });
  Para o jogo abrir espaço para a barra, ela publica no <html>: as classes "bn-nav" (barra à vista) e "bn-dentro"
  (🏠 à vista), e as medidas --nav-alto (do topo da tela até embaixo da barra, com folga) e --nav-largo (da borda até
  o fim da barra, com folga). Ex.: .bn-nav .barra { padding-left: var(--nav-largo); }
  Texto no idioma do <html lang> que o jogo põe (pt-BR, en ou es), que vem da escolha da estante (idioma.js).
*/
(function (raiz) {
  'use strict';
  if (raiz.BolinhoNav) return;
  var d = document, el = d.documentElement;
  var script = d.currentScript;
  var ESTANTE = (function () { try { return new URL('./', script && script.src ? script.src : location.href).href; } catch (e) { return '/kids/'; } })();
  var cfg = null, barra = null, btCasa = null, btSaida = null, aviso = null;
  var empurrado = false, ignorar = 0, ultimoInicio = null;
  var guarda = false, naGuarda = false, avisoVoltar = null, avisoTimer = 0;
  var hPush = history.pushState, hReplace = history.replaceState;

  function chamar(fn, padrao) { try { return typeof fn === 'function' ? fn() : padrao; } catch (e) { return padrao; } }
  function noInicio() { return !!chamar(cfg.noInicio, true); }
  function lingua() { var l = (el.lang || '').toLowerCase(); return l.indexOf('en') === 0 ? 'en' : l.indexOf('es') === 0 ? 'es' : 'pt'; }
  function instalado() {
    var mm = raiz.matchMedia;
    return !!(mm && (mm('(display-mode: standalone)').matches || mm('(display-mode: fullscreen)').matches || raiz.navigator.standalone));
  }
  function escondida() {
    if (cfg.esconder) return !!chamar(cfg.esconder, false);
    return /[?&]tv=/.test(location.search);
  }

  var CSS = '.bolinho-voltar{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 24px);z-index:2147482001;' +
    'transform:translate(-50%,20px);opacity:0;pointer-events:none;max-width:calc(100% - 32px);padding:12px 18px;border-radius:999px;' +
    'background:rgba(14,12,28,.92);color:#fff;border:1.5px solid rgba(255,255,255,.55);box-shadow:0 4px 16px rgba(0,0,0,.4);' +
    'font:700 16px/1.25 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-align:center;transition:opacity .2s,transform .2s}' +
    '.bolinho-voltar.ver{opacity:1;transform:translate(-50%,0)}' +
    '.bolinho-nav{position:fixed;z-index:2147482000;top:calc(env(safe-area-inset-top,0px) + 6px);' +
    'display:flex;align-items:center;gap:2px;padding:2px;border-radius:999px;background:rgba(14,12,28,.78);' +
    'border:1.5px solid rgba(255,255,255,.55);box-shadow:0 2px 10px rgba(0,0,0,.35);' +
    '-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);font:700 15px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.bolinho-nav.esq{left:calc(env(safe-area-inset-left,0px) + 6px)}.bolinho-nav.dir{right:calc(env(safe-area-inset-right,0px) + 6px)}' +
    '.bolinho-nav[hidden],.bolinho-nav button[hidden]{display:none}' +
    '.bolinho-nav button{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-width:44px;height:44px;margin:0;' +
    'padding:0 10px;border:0;border-radius:999px;background:transparent;color:#fff;font:inherit;cursor:pointer;' +
    'touch-action:manipulation;-webkit-tap-highlight-color:transparent}' +
    '.bolinho-nav .bn-casa{width:44px;padding:0;border-radius:12px;font-size:21px}' +
    '.bolinho-nav .bn-saida{gap:4px;padding:0 10px 0 6px}.bolinho-nav .bn-saida .i{font-size:20px}' +
    '.bolinho-nav button:hover{background:rgba(255,255,255,.14)}.bolinho-nav button:active{background:rgba(255,255,255,.26)}' +
    '.bolinho-nav button:focus-visible{outline:3px solid #ffd54a;outline-offset:1px}' +
    'html[lang^=en] .bolinho-nav .bn-pt,html[lang^=es] .bolinho-nav .bn-pt,html:not([lang^=en]) .bolinho-nav .bn-en,html:not([lang^=es]) .bolinho-nav .bn-es{display:none}' +
    '.bolinho-sair{position:fixed;inset:0;z-index:2147483200;display:flex;align-items:center;justify-content:center;padding:16px;' +
    'background:rgba(0,0,0,.55);font:600 17px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.bolinho-sair[hidden]{display:none}' +
    '.bolinho-sair .c{max-width:340px;width:100%;padding:20px 18px 16px;border-radius:20px;background:#fff;color:#22163a;text-align:center;' +
    'box-shadow:0 10px 40px rgba(0,0,0,.4)}.bolinho-sair .t{margin:0 0 6px;font-size:21px;font-weight:800}.bolinho-sair p{margin:0 0 16px}' +
    '.bolinho-sair .b{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}' +
    '.bolinho-sair button{min-height:48px;padding:0 18px;border:0;border-radius:999px;font-family:inherit;font-size:17px;font-weight:800;line-height:1;cursor:pointer}' +
    '.bolinho-sair .sim{background:#e8e2f5;color:#22163a}.bolinho-sair .nao{background:#7c3aed;color:#fff}' +
    '@media (prefers-reduced-motion:no-preference){.bolinho-sair .c{animation:bnSobe .2s ease-out}}' +
    '@keyframes bnSobe{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}';

  function txt(pt, en, es) { var l = lingua(); return l === 'en' ? en : l === 'es' ? es : pt; }

  function criar() {
    var st = d.createElement('style'); st.id = 'bolinho-nav-estilo'; st.textContent = CSS; d.head.appendChild(st);
    barra = d.createElement('nav');
    barra.className = 'bolinho-nav ' + (cfg.posicao === 'topo-direita' ? 'dir' : 'esq');
    barra.setAttribute('aria-label', 'Navegação');
    barra.innerHTML = '<button type="button" class="bn-casa" hidden><span aria-hidden="true">🏠</span></button>' +
      '<button type="button" class="bn-saida"><span class="i" aria-hidden="true">🚪</span><span class="bn-pt">Saída</span><span class="bn-en">Exit</span><span class="bn-es">Salir</span></button>';
    var dx = (cfg.desvio && cfg.desvio.x) || 0, dy = (cfg.desvio && cfg.desvio.y) || 0;
    if (dy) barra.style.top = 'calc(env(safe-area-inset-top,0px) + ' + (6 + dy) + 'px)';
    if (dx) barra.style[cfg.posicao === 'topo-direita' ? 'right' : 'left'] = 'calc(env(safe-area-inset-' + (cfg.posicao === 'topo-direita' ? 'right' : 'left') + ',0px) + ' + (6 + dx) + 'px)';
    btCasa = barra.querySelector('.bn-casa'); btSaida = barra.querySelector('.bn-saida');
    // o toque nos botões não passa para o jogo (o jogo pode estar ouvindo o dedo na tela toda)
    ['pointerdown', 'touchstart', 'mousedown'].forEach(function (ev) { barra.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true }); });
    btCasa.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); casa(); });
    btSaida.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); pedirSaida(); });
    d.body.appendChild(barra);
    atualizar();
  }

  // ---------- 🏠 Início ----------
  function casa() {
    if (noInicio()) return;
    if (cfg.cuidarDoVoltar && empurrado) { history.back(); return; }   // o popstate leva ao início
    chamar(cfg.irParaInicio);
    setTimeout(atualizar, 0);
  }

  // ---------- 🚪 Saída ----------
  function pedirSaida() {
    if (chamar(cfg.emAndamento, false)) perguntar(); else sair();
  }
  function perguntar() {
    if (!aviso) {
      aviso = d.createElement('div');
      aviso.className = 'bolinho-sair'; aviso.hidden = true;
      aviso.setAttribute('role', 'dialog'); aviso.setAttribute('aria-modal', 'true');
      aviso.innerHTML = '<div class="c"><p class="t"></p><p class="x"></p><div class="b">' +
        '<button type="button" class="sim"></button><button type="button" class="nao"></button></div></div>';
      aviso.addEventListener('click', function (e) {
        if (e.target === aviso || e.target.closest('.nao')) fecharAviso();
        else if (e.target.closest('.sim')) { fecharAviso(); sair(); }
      });
      ['pointerdown', 'touchstart', 'mousedown'].forEach(function (ev) { aviso.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true }); });
      aviso.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fecharAviso(); } });
      d.body.appendChild(aviso);
    }
    aviso.querySelector('.t').textContent = txt('🚪 Sair do jogo?', '🚪 Leave the game?', '🚪 ¿Salir del juego?');
    aviso.querySelector('.x').textContent = txt('A brincadeira que está rolando vai parar.', 'The game you\'re playing will stop.', 'El juego que está en marcha se va a detener.');
    aviso.querySelector('.sim').textContent = txt('🚪 Sair', '🚪 Leave', '🚪 Salir');
    aviso.querySelector('.nao').textContent = txt('▶ Continuar brincando', '▶ Keep playing', '▶ Seguir jugando');
    aviso.hidden = false;
    setTimeout(function () { aviso.querySelector('.nao').focus(); }, 30);
  }
  function fecharAviso() { if (aviso && !aviso.hidden) { aviso.hidden = true; try { btSaida.focus(); } catch (e) { /* ok */ } } }
  function irEstante() { location.href = ESTANTE; }
  function sair() {
    chamar(cfg.antesDeSair);
    if (instalado()) {
      try { raiz.close(); } catch (e) { /* o navegador não deixou */ }
      setTimeout(irEstante, 300);   // ainda aberta: vai para a estante
    } else irEstante();             // aba do navegador: a página não pode se fechar
  }

  // ---------- histórico (só para quem pediu cuidarDoVoltar) ----------
  function cuidarDoHistorico(inicio) {
    if (!cfg.cuidarDoVoltar) return;
    if (!inicio && !empurrado) { empurrado = true; try { history.pushState({ bolinhoNav: 1 }, ''); } catch (e) { empurrado = false; } }
    else if (inicio && empurrado) { empurrado = false; ignorar++; history.back(); }   // o jogo voltou ao início sozinho
  }
  // ---------- guarda do Voltar (todos os jogos, menos quem passa guarda: false) ----------
  function usarGuarda() { return cfg && cfg.guarda !== false && !escondida(); }
  // o jogo empilhou uma tela: saímos da guarda. replaceState em cima da guarda não pode apagar a marca dela.
  try {
    history.pushState = function () { naGuarda = false; return hPush.apply(history, arguments); };
    history.replaceState = function (st, t, u) {
      if (naGuarda) st = Object.assign({}, (st && typeof st === 'object') ? st : {}, { bolinhoGuarda: 1 });
      return arguments.length > 2 ? hReplace.call(history, st, t, u) : hReplace.call(history, st, t);
    };
  } catch (e) { /* navegador antigo: fica sem guarda */ }
  function armarGuarda() {
    if (guarda || !usarGuarda() || !noInicio()) return;
    guarda = true; naGuarda = true;
    try { hPush.call(history, { bolinhoGuarda: 1 }, ''); } catch (e) { guarda = naGuarda = false; }
  }
  ['pointerdown', 'keydown'].forEach(function (ev) { d.addEventListener(ev, armarGuarda, true); });
  function avisarVoltar() {
    if (!avisoVoltar) {
      avisoVoltar = d.createElement('div');
      avisoVoltar.className = 'bolinho-voltar'; avisoVoltar.setAttribute('role', 'status'); avisoVoltar.setAttribute('aria-live', 'polite');
      d.body.appendChild(avisoVoltar);
    }
    avisoVoltar.textContent = txt('↩️ Toque em Voltar de novo para sair', '↩️ Tap Back again to leave', '↩️ Toca Atrás otra vez para salir');
    avisoVoltar.classList.add('ver');
    clearTimeout(avisoTimer); avisoTimer = setTimeout(function () { avisoVoltar.classList.remove('ver'); }, 2500);
  }
  raiz.addEventListener('popstate', function (ev) {
    if (cfg && usarGuarda()) {
      var st = ev.state || history.state;
      if (st && st.bolinhoGuarda) {
        naGuarda = true;
        // chegou na guarda: tudo do jogo acima dela já saiu. Se o jogo ficou numa tela de dentro (o Chrome pulou a
        // entrada dele), volta ao começo em vez de deixar o próximo Voltar fechar o app.
        setTimeout(function () { if (naGuarda && !noInicio()) { chamar(cfg.irParaInicio); atualizar(); } }, 0);
      } else if (naGuarda) {
        naGuarda = false; guarda = false;
        if (!ignorar && noInicio()) avisarVoltar();   // saiu da guarda na tela de começo: o próximo Voltar sai
      }
    }
    if (aviso && !aviso.hidden) fecharAviso();
    if (!cfg || !cfg.cuidarDoVoltar) { setTimeout(atualizar, 0); return; }
    if (ignorar) { ignorar--; return; }
    if (empurrado) { empurrado = false; if (!noInicio()) chamar(cfg.irParaInicio); setTimeout(atualizar, 0); }
  });

  // ---------- mostrar / esconder e as medidas para o jogo ----------
  function atualizar() {
    if (!barra) return;
    var some = escondida(), inicio = noInicio();
    barra.hidden = some;
    btCasa.hidden = inicio;
    btCasa.setAttribute('aria-label', txt('Início', 'Home', 'Inicio')); btCasa.title = btCasa.getAttribute('aria-label');
    btSaida.setAttribute('aria-label', txt('Saída', 'Exit', 'Salir')); btSaida.title = txt('Sair do jogo', 'Leave the game', 'Salir del juego');
    el.classList.toggle('bn-nav', !some);
    el.classList.toggle('bn-dentro', !some && !inicio);
    var r = some ? null : barra.getBoundingClientRect();
    el.style.setProperty('--nav-alto', r ? Math.ceil(r.bottom + 6) + 'px' : '0px');
    el.style.setProperty('--nav-largo', r ? Math.ceil((cfg.posicao === 'topo-direita' ? raiz.innerWidth - r.left : r.right) + 6) + 'px' : '0px');
    if (inicio !== ultimoInicio) { ultimoInicio = inicio; cuidarDoHistorico(inicio); }
  }

  raiz.BolinhoNav = {
    iniciar: function (opcoes) {
      if (cfg) return;
      cfg = opcoes || {};
      var ir = function () { criar(); setInterval(atualizar, 250); };
      if (d.body) ir(); else d.addEventListener('DOMContentLoaded', ir);
      // depois de cada toque o jogo pode ter trocado de tela: confere logo
      d.addEventListener('click', function () { setTimeout(atualizar, 0); }, true);
      raiz.addEventListener('resize', function () { setTimeout(atualizar, 0); });
    },
    atualizar: function () { atualizar(); },
    sair: function () { sair(); },
    estante: ESTANTE
  };
})(window);
