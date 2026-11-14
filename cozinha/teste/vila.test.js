// A vila "3D" (v0.7.0, pedido do dono de 14/Nov/2026): cada lugar é um bloquinho desenhado (vila.js), com ruas entre
// eles; o cozinheirinho começa na porta de casa e ANDA pelas ruas até o lugar tocado; uma faixa diz a próxima missão
// e, no Fácil e no Médio, uma seta pula em cima do lugar; depois de pegar tudo de um lugar ele SEGUE SOZINHO para o
// próximo (e para casa com a cesta cheia). No Difícil ele só volta à vila (a criança escolhe).
// node --test cozinha/teste/*.test.js (da raiz do repositório kids)
const test = require('node:test');
const assert = require('node:assert/strict');
const VI = require('../vila.js');
const D = require('../dados.js');
const { iniciar, fechar, abrir, comecar, noLugar, voltarVila, segurar, tem } = require('./navegador.js');

test.before(iniciar);
test.after(fechar);

test('vila.js: cada lugar da vila tem o seu bloquinho desenhado, e o cozinheirinho, o carro e a nuvem existem', () => {
  for (const l of D.LUGARES) {
    assert.ok(VI.LUGARES_DESENHADOS.includes(l.id), 'sem desenho: ' + l.id);
    const svg = VI.bloco(l.id);
    assert.match(svg, /^<svg class="bloco b-[a-z]+" viewBox="0 -10 200 185"/);
    assert.ok(svg.length > 1500, l.id + ': desenho pequeno demais');
    assert.ok(!/NaN|undefined/.test(svg), l.id + ': desenho quebrado');
  }
  assert.match(VI.bloco('vaca'), /class="v-pas"/, 'o cata-vento gira');
  assert.match(VI.bloco('mercado'), /MERCADO/);
  assert.match(VI.boneco(), /v-pe1[\s\S]*v-pe2[\s\S]*v-chapeu/, 'o cozinheirinho tem pernas que andam e chapéu');
  // nomes de classe com "v-" para não confundir com as peças dos mini-jogos (ex.: .galinha do galinheiro)
  for (const l of D.LUGARES) assert.ok(!/class="(galinha|copa|onda|rabo|chapeu)"/.test(VI.bloco(l.id)), l.id);
});

test('mapa: bloquinhos, ruas, o cozinheirinho na porta de casa e a faixa da missão com a seta (Médio)', { timeout: 30000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  await comecar(pg, 'medio', 'pao-queijo');
  assert.equal(await pg.locator('#vila .lugar svg.bloco').count(), 8);
  await pg.waitForFunction(() => document.querySelector('#vila .ruas path'));
  assert.ok(await pg.evaluate(() => document.querySelector('#vila .ruas path').getAttribute('d').split('M').length > 4), 'ruas desenhadas');
  // o cozinheirinho começa na porta de casa (na rua embaixo do bloco da casa)
  const perto = await pg.evaluate(() => {
    const b = document.querySelector('#vila .boneco').getBoundingClientRect(), c = document.querySelector('[data-lugar="casa"]').getBoundingClientRect();
    return { x: b.left + b.width / 2 >= c.left && b.left + b.width / 2 <= c.right, y: Math.abs(b.bottom - c.bottom) < 40 };
  });
  assert.deepEqual(perto, { x: true, y: true }, 'na porta de casa');
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().pos), 'casa');
  // missão: a próxima coisa e o lugar; a seta em cima desse lugar (ovos → galinheiro, que é da natureza)
  assert.match(await pg.textContent('#missao'), /Agora: buscar .*2 ovos.*Galinheiro/);
  assert.equal(await pg.locator('.lugar.proximo').count(), 1);
  assert.equal(await pg.getAttribute('.lugar.proximo', 'data-lugar'), 'galinheiro');
  assert.equal(await pg.locator('.lugar.proximo .seta').count(), 1);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('Difícil: a faixa mostra o que falta, sem dizer aonde ir, e não tem seta', { timeout: 30000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 915, height: 412 }, { isMobile: true, hasTouch: true });
  await comecar(pg, 'dificil', 'omelete');
  assert.match(await pg.textContent('#missao'), /Falta: /);
  assert.equal(await pg.locator('.lugar.proximo, .lugar .seta').count(), 0);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('o cozinheirinho ANDA pela rua até o lugar (com movimento) e entra; com movimento reduzido chega na hora', { timeout: 60000 }, async () => {
  const r = await abrir({ width: 390, height: 844 }, { isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  const pg = r.pg;
  await pg.goto(pg.url() + '&devagar');
  await pg.addStyleTag({ content: '.tela-inteira-bt{display:none!important}' });
  await comecar(pg, 'facil', 'vitamina');
  await pg.waitForFunction(() => document.querySelector('#vila .boneco').style.transform.includes('translate'));
  const pos = () => pg.evaluate(() => { const b = document.querySelector('#vila .boneco').getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top)]; });
  const p0 = await pos();
  await pg.click('[data-lugar="rio"]', { force: true });
  await pg.waitForTimeout(350);
  assert.equal(await pg.locator('#vila .boneco.anda').count(), 1, 'andando (as pernas mexem)');
  const p1 = await pos();
  assert.notDeepEqual(p1, p0, 'saiu do lugar');
  assert.equal(await pg.locator('#mapa.ativa').count(), 1, 'ainda na vila enquanto anda');
  await pg.waitForSelector('#lugar.ativa', { timeout: 6000 });
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().pos), 'rio');
  assert.deepEqual(r.erros, [], 'erros no console');
  await r.ctx.close();
  // movimento reduzido: entra direto
  const q = await abrir({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  await comecar(q.pg, 'facil', 'vitamina');
  await noLugar(q.pg, 'horta');
  assert.equal(await q.pg.evaluate(() => window.Cozinha.jogo().pos), 'horta');
  await q.ctx.close();
});

test('missão fluida (Fácil): pegou tudo de um lugar, ele segue sozinho para o próximo e, com a cesta cheia, vai para casa cozinhar', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  await pg.goto(pg.url() + '&seguir');
  await comecar(pg, 'facil', 'vitamina');
  assert.equal(await pg.getAttribute('.lugar.proximo', 'data-lugar'), 'pomar');
  await noLugar(pg, 'pomar');
  await pg.click('.fruta.madura[data-ing="banana"]');
  assert.equal(await tem(pg, 'banana'), 1);
  // sozinho: volta à vila e anda até a fazendinha (o leite)
  await pg.waitForFunction(() => window.Cozinha.atual() === 'lugar' && document.querySelector('#lugarTitulo').textContent.includes('Mimosa'), null, { timeout: 8000 });
  assert.match(await pg.textContent('#aviso'), /Pronto aqui! Agora: .*Mimosa/);
  await segurar(pg, '#btOrdenhar', 700);
  await pg.waitForFunction(() => (window.Cozinha.jogo().cesta.leite || 0) === 1);
  // cesta cheia: vai sozinho para casa e começa a cozinhar
  await pg.waitForSelector('#cozinha.ativa', { timeout: 8000 });
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().pos), 'casa');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('missão no Difícil: depois de pegar tudo de um lugar, volta para a vila, mas a criança escolhe aonde ir', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  await pg.goto(pg.url() + '&seguir');
  await comecar(pg, 'dificil', 'vitamina');
  await noLugar(pg, 'pomar');
  const falta = await pg.evaluate(() => window.Cozinha.jogo().precisa.find(x => x.id === 'banana').q);
  for (let i = 0; i < falta; i++) { await pg.click('.fruta.madura[data-ing="banana"]'); await pg.waitForFunction(n => (window.Cozinha.jogo().cesta.banana || 0) >= n, i + 1); }
  await pg.waitForSelector('#mapa.ativa', { timeout: 8000 });
  await pg.waitForTimeout(1200);
  assert.equal(await pg.locator('#mapa.ativa').count(), 1, 'fica na vila esperando a escolha');
  assert.equal(await pg.evaluate(() => window.Cozinha.jogo().pos), 'pomar');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});
