// Cozinha no Chromium (Playwright), jogando de verdade (ajudantes em navegador.js): node --test cozinha/teste/*.test.js (da raiz do repositório)
// Sobe um servidor pequeno na raiz do repositório e abre /cozinha/?teste (esperas curtinhas, frutas maduras).
// Joga receitas do Fácil do começo ao fim no tamanho de celular, tablet e computador, sem erro no console;
// confere o mercadinho com moedas e troco, a vizinha com obrigado, as fichas misturadas e o imprevisto do Difícil.
const test = require('node:test');
const assert = require('node:assert/strict');
const { iniciar, fechar, abrir, segurar, noLugar, voltarVila, tem, comecar, fazerPasso, cozinhar } = require('./navegador.js');

test.before(iniciar);
test.after(fechar);

async function vitaminaFacil(viewport, extra) {
  const { ctx, pg, erros } = await abrir(viewport, extra);
  await comecar(pg, 'facil', 'vitamina');
  assert.equal(await pg.locator('#cestaMapa .item').count(), 2, 'a cesta mostra os 2 ingredientes do Fácil');
  // pomar: colher uma banana madura
  await noLugar(pg, 'pomar');
  await pg.click('.fruta.madura[data-ing="banana"]');
  assert.equal(await tem(pg, 'banana'), 1);
  await voltarVila(pg);
  // a casa ainda não deixa cozinhar
  await pg.click('[data-lugar="casa"]');
  assert.ok(await pg.locator('#mapa.ativa').count(), 'sem tudo na cesta, fica na vila');
  assert.match(await pg.textContent('#aviso'), /Ainda falta/);
  // fazendinha: segurar para tirar o leite
  await noLugar(pg, 'vaca');
  await segurar(pg, '#btOrdenhar', 700);
  await pg.waitForFunction(() => (window.Cozinha.jogo().cesta.leite || 0) === 1);
  await voltarVila(pg);
  assert.ok(await pg.locator('[data-lugar="casa"].pronta').count(), 'a casa brilha com a cesta completa');
  await pg.click('[data-lugar="casa"]');
  await cozinhar(pg, true);
  assert.match(await pg.textContent('#prontoTitulo'), /Vitamina de banana/);
  assert.equal((await pg.textContent('#prontoEstrelas')).match(/⭐/g).length, 3, '3 estrelas sem erro');
  assert.match(await pg.textContent('#cartao'), /Receita da família/);
  assert.match(await pg.textContent('#cartao'), /1 banana/);
  const prog = await pg.evaluate(() => JSON.parse(localStorage.getItem('bolinho:cozinha:progresso')));
  assert.equal(prog.r.vitamina.facil, 3, 'progresso guardado');
  // de volta ao menu, a receita aparece com as estrelas
  await pg.click('#btOutra');
  assert.equal((await pg.textContent('[data-rec="vitamina"] .rec-est')).match(/⭐/g).length, 3);
  // sem rolagem para o lado
  assert.ok(await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'a página rola para o lado');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
}

test('celular em pé: vitamina de banana no Fácil, do começo ao fim', { timeout: 60000 }, async () => {
  await vitaminaFacil({ width: 390, height: 844 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
});

test('computador: vitamina de banana no Fácil, do começo ao fim', { timeout: 60000 }, async () => {
  await vitaminaFacil({ width: 1280, height: 800 });
});

test('tablet: bolo de cenoura no Fácil, juntando na horta, no galinheiro e no mercadinho de graça', { timeout: 90000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 800, height: 1280 }, { hasTouch: true });
  await comecar(pg, 'facil', 'bolo-cenoura');
  await noLugar(pg, 'horta');
  for (let i = 0; i < 2; i++) {
    const planta = pg.locator('.planta[data-ing="cenoura"]:not(:disabled)').first();
    for (let k = 0; k < 3; k++) await planta.click();
  }
  await pg.waitForFunction(() => window.Cozinha.jogo().cesta.cenoura === 2);
  await voltarVila(pg);
  await noLugar(pg, 'galinheiro');
  for (let i = 0; i < 2; i++) { await pg.locator('.galinha').nth(i).click(); await pg.locator('.ovo:not([hidden])').first().click(); }
  assert.equal(await tem(pg, 'ovo'), 2);
  await voltarVila(pg);
  await noLugar(pg, 'mercado');
  assert.match(await pg.textContent('.prateleira'), /grátis/);
  await pg.click('.produto[data-ing="farinha"]'); await pg.click('.produto[data-ing="farinha"]');
  assert.equal(await tem(pg, 'farinha'), 2);
  await voltarVila(pg);
  await pg.click('[data-lugar="casa"]');
  await cozinhar(pg, true);
  assert.match(await pg.textContent('#prontoTitulo'), /Bolo de cenoura/);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('Médio: mercadinho com moedas e troco, vizinha só entrega depois do obrigado, erro de utensílio conta', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { hasTouch: true });
  await comecar(pg, 'medio', 'brigadeiro');
  const m0 = await pg.evaluate(() => window.Cozinha.jogo().moedas);
  assert.ok(m0 >= 9, 'moedas suficientes no Médio');
  await noLugar(pg, 'mercado');
  await pg.click('.produto[data-ing="leitecond"]');
  await pg.waitForSelector('.caixa:not([hidden])');
  assert.ok(await pg.locator('.cx-pagar:disabled').count(), 'sem moeda no balcão não paga');
  await pg.click('.cx-carteira .moeda.m5');          // dá uma moeda de 5 para algo de 3
  await pg.click('.cx-pagar');
  assert.equal(await tem(pg, 'leitecond'), 1);
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().moedas), m0 - 3, 'pagou 3');
  assert.match(await pg.textContent('#aviso'), /Troco: 💰 2/);
  await voltarVila(pg);
  await noLugar(pg, 'vizinha');
  await pg.click('.pedido[data-ing="manteiga"]');
  assert.equal(await tem(pg, 'manteiga'), 0, 'ainda não agradeceu');
  await pg.click('#btObrigado');
  assert.equal(await tem(pg, 'manteiga'), 1);
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().favores), 2);
  await voltarVila(pg);
  // completa o resto e erra o utensílio uma vez na cozinha
  await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
  await pg.click('[data-lugar="casa"]');
  await pg.waitForSelector('#cozinha.ativa');
  await pg.click('#utensilios .utensilio:not([data-u="pia"])');
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().erros), 1);
  assert.ok(await pg.locator('[data-u="pia"].luz').count(), 'depois de errar, o utensílio certo brilha');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('Difícil: imprevisto ao chegar em casa e fichas misturadas que respeitam a ordem', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 1280, height: 800 });
  await comecar(pg, 'dificil', 'vitamina');
  assert.ok(await pg.locator('#sol:not([hidden])').count(), 'o sol aparece no Difícil');
  await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
  await pg.click('[data-lugar="casa"]');
  assert.ok(await pg.locator('#mapa.ativa').count(), 'o imprevisto segura na vila');
  assert.match(await pg.textContent('#aviso'), /Biscoito/);
  assert.equal(await pg.evaluate(() => { const j = window.Cozinha.jogo(); return j.precisa.every(x => (j.cesta[x.id] || 0) >= x.q); }), false);
  await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
  await pg.click('[data-lugar="casa"]');
  await pg.waitForSelector('#cozinha.ativa');
  assert.ok(await pg.locator('.ficha-bt').count() >= 5, 'fichas misturadas');
  await pg.click('.ficha-bt[data-passo="servir"]');
  assert.match(await pg.textContent('#aviso'), /Ainda não/);
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().erros), 1);
  await pg.click('.ficha-bt[data-passo="lavar"]');
  await pg.waitForFunction(() => window.Cozinha.jogo().cz.fase === 'utensilio');
  assert.equal(await pg.locator('.utensilio.luz').count(), 0, 'no Difícil o utensílio não brilha de cara');
  await fazerPasso(pg);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('inglês: troca de língua no menu e textos da receita em EN', { timeout: 30000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 });
  await pg.click('#btEntrar');
  if ((await pg.textContent('#btLingua')).trim() === 'EN') await pg.click('#btLingua');
  assert.match(await pg.textContent('#menu'), /Pick a recipe/);
  await pg.click('[data-rec="pizza"]');
  assert.match(await pg.textContent('#recIngredientes'), /cups of flour/);
  assert.equal(await pg.evaluate(() => document.documentElement.lang), 'en');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

// ---------- rio: o peixe fica preso no anzol, sobe pela linha e vai para o balde; os outros continuam nadando ----------
// posição (translate) do peixe preso, sem o balanço (rotate), para ver se ele sobe de verdade
const subidaDoPeixe = pg => pg.evaluate(async () => {
  const ys = [];
  for (let i = 0; i < 7; i++) {
    const f = document.querySelector('.cardume .peixe.fisgado');
    const m = f && /translate3d\([-\d.]+px,\s*([-\d.]+)px/.exec(f.style.transform);
    if (m) ys.push({ y: +m[1], rot: /rotate\(([-\d.]+)deg\)/.exec(f.style.transform)[1], fase: document.querySelector('.agua').dataset.fase });
    await new Promise(r => setTimeout(r, 90));
  }
  return ys;
});

test('rio no celular: o peixe é fisgado, sobe preso no anzol e vai para o balde; os outros peixes continuam lá', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: 'no-preference' });
  await comecar(pg, 'medio', 'peixe-assado');
  await noLugar(pg, 'rio');
  assert.equal(await pg.locator('.agua .pesca .vara').count(), 1, 'a vara está desenhada');
  assert.equal(await pg.locator('.agua .pesca .fio').count(), 1, 'a linha está desenhada');
  assert.equal(await pg.locator('.agua .pesca .anzol').count(), 1, 'o anzol está desenhado');
  assert.equal(await pg.locator('.cardume .peixe').count(), 3, '3 peixinhos nadando');
  await pg.waitForTimeout(300);
  await pg.tap('#btPuxar');
  await pg.waitForSelector('.agua[data-fase="sobe"]');
  assert.equal(await pg.locator('.cardume .peixe.fisgado').count(), 1, 'um peixe preso no anzol');
  const ys = await subidaDoPeixe(pg);
  const subindo = ys.filter(s => s.fase === 'sobe');
  assert.ok(subindo.length >= 4, 'acompanhou a subida: ' + JSON.stringify(ys));
  for (let i = 1; i < subindo.length; i++) assert.ok(subindo[i].y <= subindo[i - 1].y + 0.5, 'o peixe preso sobe a cada quadro: ' + JSON.stringify(subindo));
  assert.ok(subindo[subindo.length - 1].y < subindo[0].y - 30, 'subiu bastante: ' + JSON.stringify(subindo));
  assert.ok(new Set(subindo.map(s => s.rot)).size > 1, 'o peixe se mexe no anzol');
  // enquanto isso, os outros 2 peixes continuam nadando dentro do rio, visíveis
  const outros = await pg.evaluate(() => {
    const a = document.querySelector('.agua').getBoundingClientRect();
    return [...document.querySelectorAll('.cardume .peixe:not(.fisgado)')].map(f => { const r = f.getBoundingClientRect(); return { dentro: r.right > a.left && r.left < a.right && r.top > a.top && r.bottom < a.bottom, op: getComputedStyle(f).opacity }; });
  });
  assert.equal(outros.length, 2, 'os outros peixes continuam no rio');
  for (const o of outros) { assert.ok(o.dentro, 'peixe fora do rio'); assert.equal(o.op, '1', 'peixe sumiu'); }
  assert.equal(await tem(pg, 'peixe'), 0, 'ainda não chegou ao balde');
  await pg.waitForSelector('.agua[data-fase="volta"]', { timeout: 5000 });
  assert.equal(await tem(pg, 'peixe'), 1, 'o peixe caiu no balde e foi para a cesta');
  assert.match(await pg.textContent('#cestaLugar [data-ing="peixe"] b'), /^1\/1$/, 'a cesta mostra 1 de 1');
  assert.ok(await pg.locator('.balde .no-balde:not([hidden])').count(), 'tem peixe no balde');
  await pg.waitForSelector('.agua[data-fase="pronto"]', { timeout: 5000 });
  assert.equal(await pg.locator('.cardume .peixe').count(), 3, 'um peixe novo chegou nadando pelo lado');
  assert.equal(await pg.locator('.cardume .peixe.fisgado').count(), 0);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('rio com movimento reduzido: o peixe sobe reto, sem se mexer, e chega ao balde', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { hasTouch: true });
  await comecar(pg, 'facil', 'peixe-assado');
  await noLugar(pg, 'rio');
  await pg.click('#btPuxar');
  await pg.waitForSelector('.agua[data-fase="sobe"]');
  const subindo = (await subidaDoPeixe(pg)).filter(s => s.fase === 'sobe');
  assert.ok(subindo.length >= 3 && subindo[subindo.length - 1].y < subindo[0].y - 20, 'subiu: ' + JSON.stringify(subindo));
  assert.equal(new Set(subindo.map(s => s.rot)).size, 1, 'sem balanço no movimento reduzido');
  assert.equal(await pg.locator('.respingo .gota').count(), 0, 'sem respingo no movimento reduzido');
  await pg.waitForFunction(() => (window.Cozinha.jogo().cesta.peixe || 0) === 1, null, { timeout: 5000 });
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

// ---------- a vovozinha Dona Cida fala em voz alta (voz do navegador trocada por uma de mentira que anota as falas) ----------
function vozDeMentira() {
  window.__falas = [];
  class Fala extends EventTarget { constructor(t) { super(); this.text = t; this.lang = ''; this.rate = 1; this.pitch = 1; this.voice = null; this.onend = null; this.onerror = null; } }
  const vozes = [{ name: 'Daniel', lang: 'pt-BR' }, { name: 'Google português do Brasil', lang: 'pt-BR' }, { name: 'Fred', lang: 'en-US' }, { name: 'Samantha', lang: 'en-US' }];
  const ss = new EventTarget();
  Object.assign(ss, { speaking: false, pending: false, getVoices: () => vozes, pause() {}, resume() {}, cancel() {},
    speak(u) { window.__falas.push({ text: u.text, lang: u.lang, rate: u.rate, pitch: u.pitch, voz: u.voice && u.voice.name }); setTimeout(() => { u.dispatchEvent(new Event('end')); if (u.onend) u.onend(); }, 20); } });
  Object.defineProperty(window, 'speechSynthesis', { value: ss, configurable: true });
  window.SpeechSynthesisUtterance = Fala;
}
const falas = pg => pg.evaluate(() => window.__falas);
const daVovo = f => f.rate === 0.9 && f.pitch === 1.2;

test('Dona Cida fala: ao chegar, ao emprestar, no tchau e quando acabam os favores (voz de vovó, PT)', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { isMobile: true, hasTouch: true }, vozDeMentira);
  await comecar(pg, 'medio', 'brigadeiro');
  await noLugar(pg, 'vizinha');
  let f = (await falas(pg)).filter(daVovo);
  assert.equal(f.length, 1, 'falou ao chegar');
  assert.match(f[0].text, /que bom te ver/);
  assert.equal(f[0].lang, 'pt-BR'); assert.equal(f[0].voz, 'Google português do Brasil', 'escolhe uma voz feminina em português');
  assert.match(await pg.textContent('.casinha .balao'), /que bom te ver/, 'o balão mostra a fala');
  // os 3 favores do Médio, cada um com o obrigado
  for (const ing of ['manteiga', 'acucar', 'ovo']) {
    await pg.click('.pedido[data-ing="' + ing + '"]');
    await pg.click('#btObrigado');
  }
  await pg.click('.pedido[data-ing="mel"]');
  await pg.waitForTimeout(100);
  f = (await falas(pg)).filter(daVovo).map(x => x.text);
  assert.ok(f.some(x => /Aqui está 1 colher de manteiga/.test(x)), 'falou ao emprestar');
  assert.ok(f.some(x => /De nada.*Tchau/.test(x)), 'agradece e se despede');
  assert.ok(f.some(x => /acabaram os favores/.test(x)), 'avisa que acabaram os favores');
  assert.match(f[f.length - 1], /já emprestei bastante/, 'sem favores: fala quando a criança pede de novo');
  assert.equal(await tem(pg, 'mel'), 0);
  assert.match(await pg.textContent('.casinha .balao'), /já emprestei bastante/);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('Dona Cida em inglês fala em inglês; com a voz desligada ela não fala (só o balão)', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { hasTouch: true }, vozDeMentira);
  await pg.click('#btEntrar');
  if ((await pg.textContent('#btLingua')).trim() === 'EN') await pg.click('#btLingua');
  await pg.click('[data-nivel="facil"]'); await pg.click('[data-rec="omelete"]'); await pg.click('#btBuscar'); await pg.waitForSelector('#mapa.ativa');
  await noLugar(pg, 'vizinha');
  const f = (await falas(pg)).filter(daVovo);
  assert.equal(f.length, 1); assert.match(f[0].text, /how nice to see you/); assert.equal(f[0].lang, 'en-US'); assert.equal(f[0].voz, 'Samantha');
  await voltarVila(pg);
  // desliga a voz no menu e volta à casa dela
  await pg.click('#mapa .voltar'); await pg.waitForSelector('#receita.ativa'); await pg.click('#receita .voltar'); await pg.waitForSelector('#menu.ativa');
  await pg.click('#btVoz');
  assert.equal(await pg.getAttribute('#btVoz', 'aria-pressed'), 'false');
  const antes = (await falas(pg)).length;
  await pg.click('[data-rec="omelete"]'); await pg.click('#btBuscar'); await pg.waitForSelector('#mapa.ativa');
  await noLugar(pg, 'vizinha');
  await pg.click('.pedido[data-ing="ovo"]'); await pg.click('#btObrigado');
  await pg.waitForTimeout(100);
  assert.equal((await falas(pg)).length, antes, 'com a voz desligada, ninguém fala');
  assert.match(await pg.textContent('.casinha .balao'), /welcome/, 'mas o balão mostra o que ela disse');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

// ---------- o jogo também ensina: cada fruta na sua planta, cada legume onde cresce ----------
const PLANTA_DE = { banana: 'bananeira', maca: 'macieira', laranja: 'laranjeira', limao: 'limoeiro', morango: 'morangueiro', uva: 'parreira' };
const NOME_PLANTA = { bananeira: ['bananeira', 'banana plant'], macieira: ['macieira', 'apple tree'], laranjeira: ['laranjeira', 'orange tree'], limoeiro: ['limoeiro', 'lemon tree'], morangueiro: ['pé de morango', 'strawberry plant'], parreira: ['parreira', 'grapevine'] };

test('pomar: cada fruta só aparece na sua planta de verdade, com o nome da planta (a banana no cacho da bananeira)', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 412, height: 915 }, { isMobile: true, hasTouch: true });
  await comecar(pg, 'medio', 'salada-frutas');
  await noLugar(pg, 'pomar');
  const pes = await pg.evaluate(() => [...document.querySelectorAll('.pomar .pe')].map(pe => ({
    planta: pe.dataset.planta, nome: pe.querySelector('.pe-nome').textContent, desenho: !!pe.querySelector('svg.pl-desenho'),
    frutas: [...pe.querySelectorAll('.fruta')].map(f => f.dataset.ing) })));
  assert.deepEqual(pes.map(p => p.planta).sort(), ['bananeira', 'laranjeira', 'macieira', 'morangueiro', 'parreira'], 'só as plantas das frutas da receita');
  for (const p of pes) {
    assert.ok(p.desenho, p.planta + ' sem desenho');
    assert.ok(p.frutas.length >= 2, p.planta + ' sem frutas');
    for (const f of p.frutas) assert.equal(PLANTA_DE[f], p.planta, f + ' pendurada na planta errada (' + p.planta + ')');
    for (const n of NOME_PLANTA[p.planta]) assert.ok(p.nome.includes(n), p.planta + ': o nome embaixo devia dizer ' + n);
  }
  assert.equal(await pg.locator('.jogo-lugar .fruta').count(), await pg.locator('.pomar .pe .pe-quadro .fruta').count(), 'nenhuma fruta solta fora de uma planta');
  // a bananeira: folhas compridas, cacho com o coração roxo; as bananas são pencas no cacho
  assert.ok(await pg.locator('.pe[data-planta="bananeira"] svg.pl-desenho path[fill="#7b2d5b"]').count(), 'a bananeira tem o coração roxo');
  assert.ok(await pg.locator('.pe[data-planta="bananeira"] .fruta[data-ing="banana"] svg').count(), 'as bananas são pencas desenhadas');
  // colher ensina de onde vem
  await pg.click('.pe[data-planta="bananeira"] .fruta.madura[data-ing="banana"]');
  assert.equal(await tem(pg, 'banana'), 1);
  assert.match(await pg.textContent('#jogoLugar .fato'), /A banana nasce em cachos na bananeira/);
  assert.ok(await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'a página rola para o lado');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('pomar no Fácil da vitamina: a bananeira aparece com o nome, e no máximo mais uma planta', { timeout: 30000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 412, height: 915 }, { isMobile: true, hasTouch: true });
  await comecar(pg, 'facil', 'vitamina');
  await noLugar(pg, 'pomar');
  const plantas = await pg.$$eval('.pomar .pe', l => l.map(p => p.dataset.planta));
  assert.equal(plantas[0], 'bananeira'); assert.ok(plantas.length <= 2, 'plantas demais: ' + plantas);
  assert.match(await pg.textContent('.pe[data-planta="bananeira"] .pe-nome'), /bananeira.*banana plant/);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('horta: cenoura e batata embaixo da terra (puxar 3 vezes), tomate no tomateiro com estaca (um toque), com o nome da planta', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 412, height: 915 }, { isMobile: true, hasTouch: true });
  await comecar(pg, 'medio', 'peixe-assado');
  await noLugar(pg, 'horta');
  const formas = await pg.$$eval('.canteiro .planta', l => l.map(b => ({ ing: b.dataset.ing, forma: [...b.classList].find(c => c.startsWith('f-')), nome: b.querySelector('.pe-nome').textContent })));
  for (const f of formas) {
    const esperado = { cenoura: 'f-raiz', batata: 'f-raiz', tomate: 'f-estaca', alface: 'f-cabeca', cheiro: 'f-touceira' }[f.ing];
    assert.equal(f.forma, esperado, f.ing + ' cresce do jeito errado');
  }
  assert.ok(formas.some(f => f.ing === 'cenoura' && /pé de cenoura/.test(f.nome) && /carrot plant/.test(f.nome)));
  assert.ok(formas.some(f => f.ing === 'tomate' && /tomateiro/.test(f.nome)));
  // a cenoura fica embaixo da terra: precisa puxar 3 vezes
  const cen = pg.locator('.planta[data-ing="cenoura"]:not(:disabled)').first();
  await cen.click(); await cen.click();
  assert.equal(await tem(pg, 'cenoura'), 0, 'ainda presa na terra');
  await cen.click();
  assert.equal(await tem(pg, 'cenoura'), 1);
  assert.match(await pg.textContent('#jogoLugar .fato'), /embaixo da terra/);
  // o tomate se colhe do pé com um toque (o tomateiro fica)
  await pg.locator('.planta[data-ing="tomate"]:not(:disabled)').first().click();
  assert.equal(await tem(pg, 'tomate'), 1);
  assert.ok(await pg.locator('.planta[data-ing="tomate"].saiu .puxa svg').count(), 'o tomateiro continua no lugar');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

// ---------- pescaria com hora certa: o círculo de verdade do nível (?teste&pescareal) e os peixes parados pelo teste ----------
async function rioDeVerdade(nivel) {
  const { ctx, pg, erros } = await abrir({ width: 412, height: 915 }, { isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  await pg.goto(pg.url() + '&pescareal');
  await comecar(pg, nivel, 'peixe-assado');
  await noLugar(pg, 'rio');
  await pg.evaluate(() => window.Cozinha.rio.parar());
  return { ctx, pg, erros };
}
// um peixe no lugar pedido (distância do anzol, de -0.5 a 0.5), andando para dir; os outros bem longe
const posPeixe = (pg, dx, dir) => pg.evaluate(([dx, dir]) => { const r = window.Cozinha.rio; r.por(0, 0.5 + dx, dir); r.por(1, 0.08, 1); r.por(2, 0.92, -1); }, [dx, dir]);
const puxarAgora = async pg => { await pg.waitForSelector('.agua[data-fase="pronto"]'); await pg.tap('#btPuxar'); };

test('rio no Difícil: puxar cedo ou tarde erra (o peixe foge com respingo e "Quase!"); na hora certa, fisga', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await rioDeVerdade('dificil');
  const zona = await pg.evaluate(() => window.Cozinha.rio.zona());
  assert.ok(zona <= 0.06, 'círculo pequeno no Difícil: ' + zona);
  // cedo: o peixe ainda vem chegando (está à direita, nadando para a esquerda, a 0,10 do anzol)
  await posPeixe(pg, 0.10, -1);
  await puxarAgora(pg);
  assert.match(await pg.textContent('#aviso'), /Quase! Puxou cedo/);
  let p = (await pg.evaluate(() => window.Cozinha.rio.peixes()))[0];
  assert.ok(p.foge && p.dir === 1, 'o peixe se assustou e vira para longe do anzol');
  assert.equal(await pg.locator('.respingo').count() >= 1, true, 'respingo');
  assert.ok(await pg.locator('.respingo .gota').count() >= 1, 'um respinguinho de água');
  await pg.waitForTimeout(400);
  const p2 = (await pg.evaluate(() => window.Cozinha.rio.peixes()))[0];
  assert.ok(p2.x > p.x + 0.05, 'o peixe nadou para longe: ' + p.x + ' → ' + p2.x);
  assert.equal(await tem(pg, 'peixe'), 0, 'errou: a cesta não muda');
  // tarde: o peixe já passou (à esquerda, indo embora para a esquerda)
  await posPeixe(pg, -(zona + 0.03), -1);
  await puxarAgora(pg);
  assert.match(await pg.textContent('#aviso'), /Quase! Puxou tarde/);
  assert.equal(await tem(pg, 'peixe'), 0, 'errou de novo: a cesta não muda');
  // na hora certa: o peixe bem no círculo
  await posPeixe(pg, zona * 0.5, -1);
  await puxarAgora(pg);
  await pg.waitForSelector('.cardume .peixe.fisgado');
  await pg.waitForFunction(() => (window.Cozinha.jogo().cesta.peixe || 0) === 1, null, { timeout: 6000 });
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('rio no Fácil: o círculo é bem maior — o mesmo puxão que erra no Difícil fisga no Fácil', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await rioDeVerdade('facil');
  const zona = await pg.evaluate(() => window.Cozinha.rio.zona());
  assert.ok(zona >= 0.12, 'círculo largo no Fácil: ' + zona);
  await posPeixe(pg, 0.10, -1);   // no Difícil isso foi "Quase! Puxou cedo"
  await puxarAgora(pg);
  await pg.waitForSelector('.cardume .peixe.fisgado');
  await pg.waitForFunction(() => (window.Cozinha.jogo().cesta.peixe || 0) === 1, null, { timeout: 6000 });
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});
