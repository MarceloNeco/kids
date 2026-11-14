// Quem é? — conferência da página sem navegador. Rodar da raiz: node --test quem-e/teste/pagina.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const pasta = path.join(__dirname, '..'), raiz = path.join(pasta, '..');
const html = fs.readFileSync(path.join(pasta, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(pasta, 'app.js'), 'utf8');

test('peças comuns na ordem certa: recursos (app kids) → idioma → navegação', () => {
  const r = html.indexOf('src="../recursos.js" data-app="kids"'), i = html.indexOf('src="../idioma.js"'), n = html.indexOf('src="../navegacao.js" data-fora-do-arquivo');
  assert.ok(r > 0 && i > r && n > i, 'ordem ' + [r, i, n]);
  assert.ok(html.includes('data-recurso="quem-e"'));
  for (const f of ['../janela.js', '../trilha.js', '../telacheia.js', '../atualizar.js']) assert.ok(html.includes('src="' + f + '"'), f);
});

test('CSP sem script inline nem eval', () => {
  const csp = /http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)[1];
  assert.match(csp, /script-src 'self'/);
  assert.ok(!/unsafe-eval/.test(csp));
  assert.ok(!/<script>(?!<\/script>)|<script(?![^>]*\bsrc=)[^>]*>/.test(html), 'script inline');
  assert.ok(!/ on[a-z]+="/.test(html), 'evento inline');
});

test('navegação padrão e versão', () => {
  assert.match(app, /BolinhoNav\.iniciar\(\{\s*jogo: 'quem-e'/);
  assert.match(app, /var APP_VERSION = '0\.4\.1'/);
});

test('trilha: pelo menos 10 músicas gravadas que existem', () => {
  const ms = [...app.matchAll(/a: '\.\.\/([^']+\.mp3)'/g)].map(m => m[1]);
  assert.ok(ms.length >= 10, 'só ' + ms.length);
  for (const m of ms) assert.ok(fs.existsSync(path.join(raiz, m)), 'falta ' + m);
  assert.match(app, /Trilha\.iniciar\(\{ jogo: 'quem-e'/);
});

test('nada de nome de marca de terceiros', () => {
  const tudo = html + app + fs.readFileSync(path.join(pasta, 'logica.js'), 'utf8');
  assert.ok(!/cara a cara|akinator|guess who/i.test(tudo));
});

test('todo texto da tela tem PT, EN e ES; o idioma vem só da estante (sem botão próprio)', () => {
  for (const m of html.matchAll(/data-(?:t|rotulo|dica)="([^"]*)"/g)) assert.strictEqual(m[1].split('|').length, 3, m[1]);
  assert.ok(!html.includes('btLingua') && !app.includes('btLingua'), 'botão de idioma próprio');
  assert.ok(!/navigator\.language/.test(app), 'o idioma é o da estante (BolinhoIdioma.atual)');
  const tela = fs.readFileSync(path.join(pasta, 'adivinha-tela.js'), 'utf8');
  for (const js of [app, tela]) for (const m of js.matchAll(/\bt\('([^']*)', ['"][^'"]*['"]\)/g)) assert.fail('t() sem o espanhol: ' + m[0]);
});
