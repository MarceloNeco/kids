// Quem é? — A Meleca Adivinha no Chromium. Rodar da raiz: node --test quem-e/teste/adivinha-navegador.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');
const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
let browser, base;
test.before(async () => { await new Promise(r => server.listen(0, '127.0.0.1', r)); base = 'http://127.0.0.1:' + server.address().port + '/quem-e/'; browser = await chromium.launch(); });
test.after(async () => { if (browser) await browser.close(); server.close(); });

async function pagina(ctx, url) {
  const pg = await ctx.newPage(); pg.errosPg = [];
  pg.on('pageerror', e => pg.errosPg.push(e.message));
  await pg.goto(url); await pg.waitForFunction(() => window.QEDebug && window.QEDebug.pronto);
  return pg;
}
async function abrirAdivinha(viewport) {
  const ctx = await browser.newContext({ locale: 'pt-BR', viewport: viewport || { width: 390, height: 844 } });
  const pg = await pagina(ctx, base + '?teste');
  pg.reqs = []; pg.on('request', r => pg.reqs.push(r.url()));
  pg.on('response', r => { if (r.status() >= 400 && !/solverone-dados/.test(r.url())) pg.errosPg.push(r.status() + ' ' + r.url()); });
  await pg.click('#btPink'); await pg.click('#btAdivinha'); await pg.waitForSelector('#nivelAdivinha.ativa');
  return { ctx, pg };
}
// responde como o personagem até a meleca chutar; devolve o personagem chutado
// ⚙️ área de adulto: segurar o botão (no ?teste, 0,3 s) e acertar a conta (no ?teste, doze vezes sete)
async function entrarAdulto(pg) {
  await pg.waitForSelector('#nivelAdivinha.ativa');
  await pg.hover('#btAreaAdulto'); await pg.mouse.down(); await pg.waitForTimeout(450); await pg.mouse.up();
  await pg.waitForSelector('#contaAdulto');
  assert.match(await pg.textContent('dialog.sj[open] .qe-aviso p'), /doze vezes sete/);
  await pg.fill('#contaAdulto', '84'); await pg.keyboard.press('Enter');
  await pg.waitForSelector('#adulto.ativa');
}
async function responderComo(pg, id, max = 60) {
  for (let i = 0; i < max; i++) {
    if (await pg.locator('#advChute:not([hidden])').count()) return pg.evaluate(() => QEDebugAdv.chute().id);
    if (await pg.locator('#advPerdi:not([hidden])').count()) return null;
    const a = await pg.evaluate(() => { const j = QEDebugAdv.jogo(); return j && j.proxima(); });
    if (!a || a.tipo !== 'pergunta') { await pg.waitForTimeout(30); continue; }
    const r = await pg.evaluate(([p, q]) => QEDebugAdv.respostaDe(p, q), [id, a.id]);
    await pg.click('#advRespostas .resp[data-r="' + r + '"]');
  }
  throw new Error('não chutou');
}

test('a meleca adivinha o João Alves no Infantil e faz a festa especial', async () => {
  const { ctx, pg } = await abrirAdivinha();
  await pg.click('#btInfantil'); await pg.waitForSelector('#adivinha.ativa');
  let chute = await responderComo(pg, 'joao-alves');
  for (let k = 0; k < 4 && chute !== 'joao-alves'; k++) { await pg.click('#btErrou'); chute = await responderComo(pg, 'joao-alves'); }
  assert.equal(chute, 'joao-alves');
  assert.match(await pg.textContent('#advChuteNome'), /João Alves/);
  await pg.click('#btAcertou');
  await pg.waitForSelector('#advJoao:not([hidden])');
  await pg.click('[data-joao="wick"]');
  await pg.waitForSelector('#advFim:not([hidden])');
  assert.match(await pg.textContent('#advFimTxt'), /Wick/);
  assert.deepEqual(pg.errosPg, []);
  assert.ok(!pg.reqs.some(u => /elevenlabs/.test(u)), 'chamou a ElevenLabs sem chave');
  await ctx.close();
});

test('a meleca adivinha vários personagens da lista pronta em cada nível', async () => {
  const { ctx, pg } = await abrirAdivinha();
  const alvos = await pg.evaluate(() => { const ps = QEDebugAdv.base.personagens; const pega = n => ps.filter(p => p.niveis.includes(n)); return { I: pega('I').slice(5, 8).map(p => p.id), F: pega('F').slice(-3).map(p => p.id), A: pega('A').slice(40, 42).map(p => p.id) }; });
  for (const [nivel, bt] of [['I', '#btInfantil'], ['F', '#btFamilia'], ['A', '#btAdulto']]) {
    for (const id of alvos[nivel]) {
      await pg.evaluate(() => document.querySelector('.bolinho-nav .bn-casa') && document.querySelector('.bolinho-nav .bn-casa').click());
      await pg.waitForSelector('#inicio.ativa'); await pg.click('#btPink'); await pg.click('#btAdivinha'); await pg.click(bt);
      let chute = await responderComo(pg, id);
      for (let k = 0; k < 4 && chute && chute !== id; k++) { await pg.click('#btErrou'); chute = await responderComo(pg, id); }
      assert.equal(chute, id, nivel + ': não acertou ' + id);
    }
  }
  assert.deepEqual(pg.errosPg, []);
  await ctx.close();
});

test('quando perde, aprende alguém novo e guarda só no aparelho', async () => {
  const { ctx, pg } = await abrirAdivinha();
  await pg.click('#btFamilia');
  for (let i = 0; i < 300; i++) {
    if (await pg.locator('#advPerdi:not([hidden])').count()) break;
    if (await pg.locator('#advChute:not([hidden])').count()) { await pg.click('#btErrou', { timeout: 1000 }).catch(() => {}); continue; }
    if (await pg.locator('#advRespostas:not([hidden])').count()) await pg.click('#advRespostas .resp[data-r="?"]', { timeout: 1000 }).catch(() => {}); else await pg.waitForTimeout(20);
  }
  await pg.waitForSelector('#advPerdi:not([hidden])');
  await pg.fill('#advNome', 'Meu irmão Theo'); await pg.click('#advEmojis .emoji-bt >> nth=1');
  await pg.click('#btEnsinarSalvar');
  await pg.waitForSelector('#advFim:not([hidden])');
  const l = await pg.evaluate(() => QEDebugAdv.aprender.lista());
  assert.equal(l.length, 1); assert.equal(l[0].nome, 'Meu irmão Theo'); assert.equal(l[0].niveis, 'FA');
  assert.equal(l[0].todos, false, 'aprendido depois de perder é da família');
  await pg.click('#btAdvNivel'); await entrarAdulto(pg); await pg.click('#btAprendidos');
  await pg.waitForSelector('#aprendidos.ativa');
  assert.match(await pg.textContent('#listaAprendidos'), /Meu irmão Theo/);
  await pg.click('#listaAprendidos li button >> nth=1'); await pg.click('#listaAprendidos li button >> nth=1');
  assert.equal((await pg.evaluate(() => QEDebugAdv.aprender.lista())).length, 0);
  assert.deepEqual(pg.errosPg, []);
  await ctx.close();
});

test('área de adulto: criança não vê os botões; toque curto explica; conta errada não entra', async () => {
  const { ctx, pg } = await abrirAdivinha();
  for (const id of ['#btEnsinar', '#btAprendidos', '#btVozAnimada', '#btParaTodos']) assert.equal(await pg.isVisible(id), false, id + ' à vista');
  await pg.click('#btAreaAdulto');
  assert.ok(await pg.isVisible('#adultoDica'), 'toque curto: explica que é para segurar');
  assert.equal(await pg.locator('dialog.sj[open]').count(), 0);
  await pg.hover('#btAreaAdulto'); await pg.mouse.down(); await pg.waitForTimeout(450); await pg.mouse.up();
  await pg.fill('#contaAdulto', '83'); await pg.keyboard.press('Enter');
  assert.match(await pg.textContent('dialog.sj[open] .status'), /adultos/);
  assert.equal(await pg.isVisible('#adulto.ativa'), false);
  await pg.fill('#contaAdulto', '84'); await pg.keyboard.press('Enter');
  await pg.waitForSelector('#adulto.ativa');
  assert.deepEqual(pg.errosPg, []);
  await ctx.close();
});

test('criar alguém da família e ver o "Já chega" depois das perguntas do núcleo', async () => {
  const { ctx, pg } = await abrirAdivinha();
  await entrarAdulto(pg); await pg.click('#btEnsinar');
  assert.equal(await pg.getAttribute('[data-familia="1"]', 'aria-checked'), 'true', 'começa como família');
  await pg.fill('#advNome', 'Vovó Cida'); await pg.click('#btEnsinarSalvar');
  // um bicho de verdade, o resto "não sei": depois do núcleo ainda sobram muitos parecidos, e aí aparece o "Já chega"
  const verdade = { bicho: 's', pessoa: 'n', coisa: 'n', real: 's' };
  let n = 0;
  while (!(await pg.isVisible('#btJaChega')) && !(await pg.isVisible('#advFim')) && n < 60) {
    const e = await pg.evaluate(() => QEDebugAdv.ensino());
    await pg.click('#advRespostas .resp[data-r="' + (verdade[e.atual] || '?') + '"]'); n++;
  }
  assert.ok(await pg.isVisible('#btJaChega'), 'sem "Já chega" depois do núcleo (' + n + ' perguntas)');
  assert.ok(n >= 10 && n < 60, 'perguntas do núcleo: ' + n);
  await pg.click('#btJaChega');
  await pg.waitForSelector('#advFim:not([hidden])');
  const l = await pg.evaluate(() => QEDebugAdv.aprender.lista());
  assert.equal(l[0].nome, 'Vovó Cida'); assert.equal(l[0].niveis, 'IFA'); assert.equal(l[0].todos, false); assert.equal(l[0].r.casa, 's');
  assert.deepEqual(l[0].r, { bicho: 's', pessoa: 'n', coisa: 'n', real: 's', casa: 's' }, 'só as respostas certas (sem os "não sei") e o "é da casa"');
  await ctx.close();
});

test('criar alguém que não é da família: a meleca pergunta até não sobrar parecido, e vai no arquivo para todo mundo', async () => {
  const { ctx, pg } = await abrirAdivinha();
  await entrarAdulto(pg); await pg.click('#btEnsinar');
  await pg.click('[data-familia="0"]'); await pg.click('[data-criar-nivel="F"]');
  await pg.fill('#advNome', 'Capitão Bigode'); await pg.click('#btEnsinarSalvar');
  // um pirata de desenho, homem, de barba, que é vilão; o resto "não"
  const verdade = { pessoa: 's', desenho: 's', masculino: 's', barba: 's', vilao: 's', engracado: 's', real: 'n' };
  let n = 0, parecidos = [];
  for (; n < 140; n++) {
    if (await pg.isVisible('#advFim')) break;
    const e = await pg.evaluate(() => QEDebugAdv.ensino());
    if (e.parecidos !== undefined) parecidos.push(e.parecidos);
    await pg.click('#advRespostas .resp[data-r="' + (verdade[e.atual] || 'n') + '"]');
  }
  await pg.waitForSelector('#advFim:not([hidden])');
  assert.ok(parecidos[0] > parecidos[parecidos.length - 1], 'os parecidos não diminuíram: ' + parecidos.slice(0, 3) + '…' + parecidos.slice(-3));
  const p = (await pg.evaluate(() => QEDebugAdv.aprender.lista()))[0];
  assert.equal(p.todos, true); assert.equal(p.r.casa, 'n'); assert.equal(p.niveis, 'FA');
  // na lista aparece 🌎; o arquivo para todos leva ele
  await pg.click('#btAdvNivel'); await entrarAdulto(pg);
  await pg.click('#btParaTodos');
  await pg.waitForFunction(() => /Arquivo pronto/.test(document.getElementById('adultoStatus').textContent));
  const arq = JSON.parse(await pg.evaluate(() => QEDebugAdv.aprender.exportarParaTodos()));
  assert.deepEqual(arq.aprendidos.map(x => x.nome), ['Capitão Bigode']);
  await pg.click('#btAprendidos'); await pg.waitForSelector('#aprendidos.ativa');
  assert.equal((await pg.textContent('#listaAprendidos .apr-quem')).trim(), '🌎');
  assert.deepEqual(pg.errosPg, []);
  await ctx.close();
});

test('voz animada: a janela abre e fecha; sem chave nada vai para a internet', async () => {
  const { ctx, pg } = await abrirAdivinha();
  await entrarAdulto(pg); await pg.click('#btVozAnimada');
  await pg.waitForSelector('dialog.sj[open] .voz-caixa');
  await pg.keyboard.press('Escape');
  await pg.waitForFunction(() => !document.querySelector('dialog.sj[open]'));
  assert.ok(!pg.reqs.some(u => /elevenlabs/.test(u)));
  assert.deepEqual(pg.errosPg, []);
  await ctx.close();
});

for (const vp of [{ width: 360, height: 640 }, { width: 740, height: 360 }]) {
  test('a tela da pergunta cabe sem rolar em ' + vp.width + '×' + vp.height, async () => {
    const { ctx, pg } = await abrirAdivinha(vp);
    await pg.click('#btFamilia'); await pg.waitForSelector('#advRespostas:not([hidden])');
    const r = await pg.evaluate(() => { const b = [...document.querySelectorAll('#advRespostas .resp')].map(x => x.getBoundingClientRect()); return { fora: b.filter(x => x.bottom > innerHeight + 1).length, rola: document.scrollingElement.scrollHeight - innerHeight }; });
    assert.equal(r.fora, 0, 'botões de resposta fora da tela');
    await ctx.close();
  });
}

test('revisão: 🏠 no meio da adivinhação para tudo; 🚪 pergunta antes de sair', async () => {
  const { ctx, pg } = await abrirAdivinha();
  await pg.click('#btFamilia'); await pg.waitForSelector('#advRespostas:not([hidden])');
  assert.equal(await pg.evaluate(() => window.BolinhoNav && document.documentElement.classList.contains('bn-nav')), true);
  await pg.click('#advRespostas .resp[data-r="s"]');
  await pg.click('.bolinho-nav .bn-casa');
  await pg.waitForSelector('#inicio.ativa');
  await pg.waitForTimeout(1500);
  assert.equal(await pg.evaluate(() => document.querySelector('.tela.ativa').id), 'inicio');
  assert.equal(await pg.evaluate(() => QEDebugAdv.jogo()), null);
  await pg.click('#btPink'); await pg.click('#btAdivinha'); await pg.click('#btFamilia'); await pg.waitForSelector('#advRespostas:not([hidden])');
  await pg.click('.bolinho-nav .bn-saida');
  await pg.waitForSelector('.bolinho-sair:not([hidden])', { timeout: 3000 });
  await ctx.close();
});

test('revisão: nome que só tem símbolos não trava; "Não é" esconde o chute na hora', async () => {
  const { ctx, pg } = await abrirAdivinha();
  await pg.click('#btFamilia');
  let viuChute = false;
  for (let i = 0; i < 400; i++) {
    if (await pg.locator('#advPerdi:not([hidden])').count()) break;
    if (await pg.locator('#advChute:not([hidden])').count()) {
      await pg.click('#btErrou', { timeout: 1000 }).catch(() => {});
      if (!viuChute) { viuChute = true; assert.equal(await pg.locator('#advChute:not([hidden])').count(), 0, 'o chute continuou na tela depois do "Não é"'); }
      continue;
    }
    if (await pg.locator('#advRespostas:not([hidden])').count()) await pg.click('#advRespostas .resp[data-r="?"]', { timeout: 1000 }).catch(() => {}); else await pg.waitForTimeout(20);
  }
  await pg.waitForSelector('#advPerdi:not([hidden])');
  await pg.fill('#advNome', '<>"');
  await pg.click('#btEnsinarSalvar');
  await pg.waitForTimeout(200);
  assert.equal(await pg.locator('#advPerdi:not([hidden])').count(), 1, 'saiu do formulário com nome inválido');
  assert.deepEqual(pg.errosPg, []);
  await ctx.close();
});

// três idiomas (14/Nov/2026): o idioma vem da estante (../idioma.js, localStorage "bolinho:idioma"); os nomes ficam,
// as perguntas, respostas e falas mudam, a voz é a do idioma escolhido e o aprender continua funcionando
test('espanhol escolhido na estante: perguntas, falas e voz em espanhol, e aprende alguém novo', async () => {
  const ctx = await browser.newContext({ locale: 'pt-BR', viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => {
    localStorage.setItem('bolinho:idioma', 'es');
    window.__falas = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    const vozes = [{ name: 'PT', lang: 'pt-BR', localService: true }, { name: 'ES', lang: 'es-ES', localService: true }, { name: 'EN', lang: 'en-US', localService: true }];
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speak: u => { window.__falas.push({ texto: u.text, lang: u.lang, voz: u.voice && u.voice.name }); setTimeout(() => u.onend && u.onend(), 5); }, cancel: () => {}, getVoices: () => vozes, speaking: false, addEventListener: () => {} } });
  });
  const pg = await pagina(ctx, base + '?teste');
  assert.match(await pg.evaluate(() => document.documentElement.lang), /^es(-ES)?$/);
  assert.equal(await pg.$('#btLingua'), null, 'sem botão de idioma próprio');
  assert.equal((await pg.textContent('.logo-txt')).trim(), '¿Quién es');
  await pg.click('#btPink');
  assert.match(await pg.textContent('#btAdivinha'), /El Slime Adivina/);
  await pg.click('#btAdivinha'); await pg.waitForSelector('#nivelAdivinha.ativa');
  await pg.click('#btFamilia'); await pg.waitForSelector('#adivinha.ativa');
  await pg.waitForFunction(() => /^¿.*\?$/.test(document.getElementById('advPergunta').textContent));
  assert.equal((await pg.textContent('#advRespostas .resp[data-r="s"]')).trim(), '👍 Sí');
  assert.equal((await pg.textContent('#advRespostas .resp[data-r="?"]')).trim(), '🤷 No lo sé');
  await pg.waitForFunction(() => window.__falas.some(f => /^¿/.test(f.texto)));
  const falas = await pg.evaluate(() => window.__falas);
  assert.ok(falas.every(f => f.lang === 'es-ES' && f.voz === 'ES'), JSON.stringify(falas.slice(0, 3)));
  for (let i = 0; i < 300; i++) {
    if (await pg.locator('#advPerdi:not([hidden])').count()) break;
    if (await pg.locator('#advChute:not([hidden])').count()) { await pg.click('#btErrou', { timeout: 1000 }).catch(() => {}); continue; }
    if (await pg.locator('#advRespostas:not([hidden])').count()) await pg.click('#advRespostas .resp[data-r="?"]', { timeout: 1000 }).catch(() => {}); else await pg.waitForTimeout(20);
  }
  await pg.waitForSelector('#advPerdi:not([hidden])');
  assert.match(await pg.textContent('#advPerdiTxt'), /¡Me has ganado!/);
  await pg.fill('#advNome', 'Mi prima Lucía'); await pg.click('#btEnsinarSalvar');
  await pg.waitForSelector('#advFim:not([hidden])');
  assert.match(await pg.textContent('#advFimTxt'), /Ahora ya conozco a Mi prima Lucía/);
  assert.equal((await pg.evaluate(() => QEDebugAdv.aprender.lista()))[0].nome, 'Mi prima Lucía');
  assert.deepEqual(pg.errosPg, []);
  await ctx.close();
});
