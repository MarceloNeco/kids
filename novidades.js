/* ✨ Novidades da semana (pedido do dono, 14/Nov/2026): quando entra jogo novo na estante, em vez de um aviso seco de
   "atualize", aparece uma janela bonita com os jogos novos — ícone, nome, uma frase e ▶ para jogar.
   - Jogo novo = campo "novo" do catalogo.js com data de até 7 dias (BolinhoCatalogo.novos()).
   - Aparece toda vez que a estante abre ou é recarregada, enquanto houver jogo novo (dono, 14/Nov/2026), até a pessoa
     tocar em "Não mostrar mais esta mensagem" (guarda os jogos em localStorage "bolinho:novidades-ocultas"; jogo novo
     depois aparece de novo). "👍 Legal!", ✕, Esc e tocar fora só fecham. Voltando de um jogo para a estante não
     aparece (para não pular na frente a cada partida). (Sem entrada no histórico: ela abre sozinha, sem toque, e o Chrome pularia
     uma entrada criada sem toque — o Voltar sairia da estante.)
   - Na TV (?tv=) não aparece por cima sozinha: os cartões já têm o selo "✨ Novo".
   - Textos em PT/EN/ES pelo idioma.js. */
(function () {
  'use strict';
  var d = document, C = window.BolinhoCatalogo;
  if (!C || !C.novos || /[?&]tv=/.test(location.search)) return;
  // "Não mostrar mais" fica numa chave nova: a antiga ("bolinho:novidades-vistas") era gravada até pelo "Legal!" da 1ª versão
  // e escondia a janela de quem só tinha fechado (dono, 14/Nov/2026: "não apareceu"). A antiga é ignorada.
  var CHAVE = 'bolinho:novidades-ocultas';
  function T(pt, en, es) { return window.BolinhoIdioma ? BolinhoIdioma.t(pt, en, es) : pt; }
  function lingua() { return window.BolinhoIdioma ? BolinhoIdioma.atual() : 'pt'; }
  function vistos() { try { return JSON.parse(localStorage.getItem(CHAVE) || '[]') || []; } catch (e) { return []; } }
  function marcar(ids) { try { localStorage.setItem(CHAVE, JSON.stringify(vistos().concat(ids).filter(function (x, i, a) { return a.indexOf(x) === i; }).slice(-60))); } catch (e) {} }
  if (vistos().indexOf('*') >= 0) return;   // "*" = não mostrar (os testes de outras partes da estante usam)
  // voltando de um jogo para a estante (🚪, 🏠 do navegador): não aparece de novo; abrir ou recarregar a estante, aparece
  function veioDeUmJogo() {
    try { var r = new URL(d.referrer); return r.origin === location.origin && /\/kids\/./.test(r.pathname) && r.pathname !== location.pathname; } catch (e) { return false; }
  }
  if (veioDeUmJogo()) return;
  var novos = C.novos().filter(function (j) { return vistos().indexOf(j.id + '@' + j.novo) < 0; });
  if (!novos.length) return;

  var css = d.createElement('style');
  css.textContent =
    '.nov{position:fixed;inset:0;z-index:25;display:flex;align-items:center;justify-content:center;padding:1rem;background:rgba(5,4,20,.78)}' +
    '.nov[hidden]{display:none}' +
    '.nov-c{position:relative;width:min(30rem,100%);max-height:calc(100vh - 2rem);overflow-y:auto;padding:1.3rem 1.1rem 1.1rem;border-radius:26px;' +
    'background:linear-gradient(160deg,#2a1f66,#1a1446 60%);border:2px solid #c6ff3d;box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(198,255,61,.18);color:#f3f0ff;' +
    'animation:nov-entra .35s ease-out}' +
    '@keyframes nov-entra{from{transform:translateY(24px) scale(.96);opacity:0}to{transform:none;opacity:1}}' +
    '@media (prefers-reduced-motion:reduce){.nov-c{animation:none}}' +
    '.nov-x{position:absolute;top:.6rem;right:.6rem;width:44px;height:44px;border-radius:999px;border:1px solid #3a2f73;background:#221b4d;color:#f3f0ff;font-size:1.2rem;cursor:pointer}' +
    '.nov h2{margin:0 2.8rem .2rem 0;font-size:1.45rem;line-height:1.15}' +
    '.nov .sub{margin:0 0 1rem;color:#b3acd6}' +
    '.nov ul{list-style:none;margin:0;padding:0;display:grid;gap:.7rem}' +
    '.nov li a{display:flex;align-items:center;gap:.8rem;padding:.7rem;border-radius:18px;text-decoration:none;color:inherit;' +
    'background:rgba(255,255,255,.06);border:1.5px solid var(--c,#3a2f73)}' +
    '.nov li a:hover,.nov li a:focus-visible{background:rgba(255,255,255,.12);outline:3px solid #ffd166;outline-offset:2px}' +
    '.nov .ic{flex:none;width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:2.4rem;background:rgba(0,0,0,.25);box-shadow:0 0 18px var(--c,transparent)}' +
    '.nov .ic img{width:64px;height:64px;border-radius:16px;display:block}' +
    '.nov .tx{flex:1;min-width:0}' +
    '.nov .tx b{display:block;font-size:1.1rem}' +
    '.nov .tx span{display:block;color:#cfc9ee;font-size:.88rem;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
    '.nov .jg{flex:none;padding:.45rem .8rem;border-radius:999px;background:#c6ff3d;color:#1a1446;font-weight:800;font-size:.9rem}' +
    '.nov .ok{display:block;width:100%;margin-top:1rem;min-height:48px;border:0;border-radius:999px;background:linear-gradient(90deg,#c6ff3d,#3ee8ff);color:#1a1446;font:inherit;font-weight:800;font-size:1.05rem;cursor:pointer}' +
    '.nov .nunca{display:block;width:100%;margin-top:.5rem;min-height:44px;border:0;background:none;color:#b3acd6;font:inherit;font-size:.92rem;text-decoration:underline;cursor:pointer}' +
    '.nov .ok:focus-visible,.nov-x:focus-visible,.nov .nunca:focus-visible{outline:3px solid #ffd166;outline-offset:2px}';
  d.head.appendChild(css);

  var caixa = d.createElement('div');
  caixa.className = 'nov'; caixa.hidden = true;
  caixa.setAttribute('role', 'dialog'); caixa.setAttribute('aria-modal', 'true'); caixa.setAttribute('aria-labelledby', 'novTitulo');
  d.body.appendChild(caixa);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function montar() {
    var l = lingua(), h = '<div class="nov-c"><button type="button" class="nov-x" aria-label="' + T('Fechar', 'Close', 'Cerrar') + '">✕</button>' +
      '<h2 id="novTitulo">' + T('✨ Novidades da semana', '✨ New this week', '✨ Novedades de la semana') + '</h2>' +
      '<p class="sub">' + (novos.length === 1 ? T('Chegou um jogo novo no Bolinho:', 'A new game just arrived at Rainy Day Donuts:', 'Ha llegado un juego nuevo a Buñuelos de Lluvia:')
        : T('Chegaram ' + novos.length + ' jogos novos no Bolinho:', novos.length + ' new games just arrived at Rainy Day Donuts:', 'Han llegado ' + novos.length + ' juegos nuevos a Buñuelos de Lluvia:')) + '</p><ul>';
    novos.forEach(function (j) {
      var nome = (j.nomes && j.nomes[l]) || j.nome, txt = l === 'en' ? (j.en || j.texto) : l === 'es' ? (j.es || j.texto) : j.texto;
      h += '<li><a href="' + esc(j.url) + '" style="--c:' + esc(j.cor) + '" data-jogo="' + esc(j.id) + '">' +
        '<span class="ic">' + (j.img ? '<img src="' + esc(j.img) + '" alt="">' : esc(j.ico)) + '</span>' +
        '<span class="tx"><b>' + esc(nome) + '</b><span>' + esc(txt) + '</span></span>' +
        '<span class="jg">' + T('▶ Jogar', '▶ Play', '▶ Jugar') + '</span></a></li>';
    });
    caixa.innerHTML = h + '</ul><button type="button" class="ok">' + T('👍 Legal!', '👍 Cool!', '👍 ¡Genial!') + '</button>' +
      '<button type="button" class="nunca">' + T('Não mostrar mais esta mensagem', "Don't show this message again", 'No volver a mostrar este mensaje') + '</button></div>';
  }
  function naoMostrarMais() { marcar(novos.map(function (j) { return j.id + '@' + j.novo; })); }
  function abrir() {
    montar();
    caixa.hidden = false;
    caixa.querySelector('.ok').focus();
  }
  function fechar() {
    if (caixa.hidden) return;
    caixa.hidden = true;
  }
  caixa.addEventListener('click', function (e) {
    if (e.target.closest('.nunca')) { naoMostrarMais(); return fechar(); }
    if (e.target === caixa || e.target.closest('.nov-x') || e.target.closest('.ok')) return fechar();
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !caixa.hidden) fechar(); });
  if (window.BolinhoIdioma) BolinhoIdioma.aoMudar(function () { if (!caixa.hidden) montar(); });
  // depois que a estante aparece (sem atrapalhar a primeira olhada)
  setTimeout(abrir, 900);
})();
