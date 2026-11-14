// Mão na Massa v0.5.0 — cenas animadas, foto, bolinha da música e celular deitado (Chromium/Playwright):
// node --test cozinha/teste/*.test.js (da raiz do repositório kids)
// - despejar: o utensílio inclina PARA o lado do recipiente (bico em cima dele), o jorro cai dentro e o recipiente enche;
// - pôr ingrediente: o pacote inclina para o recipiente e ele fica mais cheio;
// - lavar as mãos: torneira, água, duas mãos esfregando junto com o dedo, espuma e "Mãos limpinhas!";
// - receita pronta: o menininho come (garfo vai à boca, mastiga, lambe os lábios, "Hmm!") e a foto vira um PNG
//   (compartilhar no celular, baixar no computador);
// - a bolinha 🎵 da música (canto de baixo à direita) não cobre a cesta nem botões, em pé e deitado;
// - celular deitado (915 × 412 e 844 × 390): toda tela cabe, sem rolar para o lado, botões principais à vista.
const test = require('node:test');
const assert = require('node:assert/strict');
const { iniciar, fechar, abrir, circulos, comecar, noLugar, voltarVila } = require('./navegador.js');

test.before(iniciar);
test.after(fechar);

// com movimento (as animações de verdade, ?teste&devagar) e cliques que não esperam as animações sem fim pararem
async function abrirMov(viewport, extra, antes) {
  const r = await abrir(viewport, Object.assign({ reducedMotion: 'no-preference' }, extra || {}), antes);
  await r.pg.goto(r.pg.url() + '&devagar');
  // a abinha "Tela inteira" (../telacheia.js, no meio da borda esquerda) aparece no teste porque o navegador do teste não
  // entra em tela cheia; com os cartões de receita maiores (fotos, v0.6.0) ela fica em cima do primeiro cartão e o clique
  // forçado (sem esperar) acertava nela. No celular de verdade ela some na tela cheia.
  await r.pg.addStyleTag({ content: '.tela-inteira-bt{display:none!important}' });
  const click0 = r.pg.click.bind(r.pg);
  r.pg.click = (s, o) => click0(s, Object.assign({ force: true }, o));
  return r;
}
async function naCozinha(pg, nivel, rec) {
  await comecar(pg, nivel, rec);
  await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.imprevistoFeito = true; j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
  await pg.click('[data-lugar="casa"]');
  await pg.waitForSelector('#cozinha.ativa');
}
// pula para um passo (os anteriores contam como feitos), com o que já estaria dentro de cada utensílio
async function irAoPasso(pg, passo, dentro) {
  await pg.evaluate(([id, dentro]) => {
    const j = window.Cozinha.jogo(), i = id ? j.passos.findIndex(p => p.id === id) : j.passos.length;
    j.cz.feitos = j.passos.slice(0, i).map(p => p.id); j.cz.fase = 'feito'; j.cz.dentro = dentro || {};
    window.Cozinha.mostrar('cozinha');
  }, [passo, dentro]);
  if (passo) await pg.waitForFunction(id => window.Cozinha.jogo().cz.atual === id && window.Cozinha.jogo().cz.fase === 'utensilio', passo);
}
const feitos = pg => pg.evaluate(() => window.Cozinha.jogo().cz.feitos.length);

// ---------- despejar ----------
const medirDespejo = pg => pg.evaluate(() => {
  const d = document.querySelector('#palco .despejo'), f = d.querySelector('.fonte'), r = d.querySelector('.recip');
  const rf = f.getBoundingClientRect(), rr = r.getBoundingClientRect(), j = d.querySelector('.jorro'), rj = j.getBoundingClientRect(), m = f.getCTM();
  return { tr: f.getAttribute('transform'), css: getComputedStyle(f).transform, fase: d.dataset.fase, giro: +f.dataset.giro, ang: Math.atan2(m.b, m.a) * 180 / Math.PI, fonteX: rf.left + rf.width / 2,
    alvo: { l: rr.left, r: rr.right, t: rr.top, b: rr.bottom, x: rr.left + rr.width / 2 }, jorro: { w: +j.getAttribute('stroke-width'), l: rj.left, r: rj.right, t: rj.top, b: rj.bottom },
    nivel: +d.querySelector('.recip .enche').dataset.nivel };
});
async function despejo(viewport, rec, passo, de, para, dentro) {
  const { ctx, pg, erros } = await abrirMov(viewport, { hasTouch: true, isMobile: true });
  await naCozinha(pg, 'facil', rec);
  await irAoPasso(pg, passo, dentro);
  await pg.click('[data-u="' + para + '"]');
  await pg.waitForSelector('#palco .despejo[data-fase="pronto"]');
  assert.equal(await pg.locator('#palco .despejo .fonte.f-' + de).count(), 1, 'desenha ' + de + ' como fonte');
  const m0 = await medirDespejo(pg), n = await feitos(pg);
  assert.ok(m0.alvo.x > m0.fonteX + 20, 'o recipiente fica à direita da fonte');
  assert.ok(Math.abs(m0.ang) < 1, 'antes de tocar, a fonte está em pé');
  await pg.click('#palco .origem');
  await pg.waitForSelector('#palco .despejo[data-fase="despejando"]', { timeout: 4000 });
  await pg.waitForTimeout(250);   // o jorro engrossa no começo
  const m1 = await medirDespejo(pg);
  // inclina no sentido horário (ângulo positivo na tela) = a boca vai para a direita, onde está o recipiente
  assert.ok(m1.ang > 45 && m1.giro > 45, 'inclina PARA o recipiente: ' + m1.ang.toFixed(1) + '°');
  assert.ok(m1.jorro.w > 2, 'o jorro aparece: ' + m1.jorro.w);
  assert.ok(m1.jorro.l >= m1.alvo.l - 4 && m1.jorro.r <= m1.alvo.r + 4, 'o jorro cai em cima do recipiente: ' + JSON.stringify([m1.jorro, m1.alvo]));
  assert.ok(m1.jorro.t < m1.alvo.t + 10 && m1.jorro.b > m1.alvo.t && m1.jorro.b <= m1.alvo.b + 2, 'do bico (em cima) até dentro do recipiente');
  await pg.waitForTimeout(350);
  const m2 = await medirDespejo(pg);
  assert.ok(m2.nivel > m1.nivel + 0.05, 'o recipiente enche: ' + m1.nivel + ' → ' + m2.nivel);
  await pg.waitForFunction(k => window.Cozinha.jogo().cz.feitos.length > k, n, { timeout: 6000 });
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
}

test('despejar: o liquidificador inclina para a tigela, o jorro de massa cai dentro e a tigela enche', { timeout: 60000 }, async () => {
  await despejo({ width: 412, height: 915 }, 'bolo-cenoura', 'juntar', 'liquidificador', 'tigela', { liquidificador: ['cenoura', 'ovo'], tigela: ['farinha'] });
});
test('despejar (deitado): o espremedor inclina para o copo e o suco cai dentro', { timeout: 60000 }, async () => {
  await despejo({ width: 915, height: 412 }, 'suco-laranja', 'desp', 'espremedor', 'copo', { espremedor: ['laranja'] });
});

test('despejar com movimento reduzido: já aparece inclinado para o recipiente, cheio, e o passo termina', { timeout: 30000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 412, height: 915 });
  await naCozinha(pg, 'facil', 'omelete');
  await irAoPasso(pg, 'desp', { tigela: ['ovo', 'tomate'] });
  await pg.click('[data-u="frigideira"]'); const n = await feitos(pg);
  await pg.click('#palco .origem');
  await pg.waitForTimeout(80);
  const m = await medirDespejo(pg);
  assert.ok(m.ang > 45, 'inclinado para a frigideira: ' + JSON.stringify(m)); assert.ok(m.nivel > 0.5, 'frigideira com a massa');
  await pg.waitForFunction(k => window.Cozinha.jogo().cz.feitos.length > k, n, { timeout: 4000 });
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('pôr ingrediente: o pacote de farinha inclina para a tigela, cai pó e a tigela fica mais cheia', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrirMov({ width: 412, height: 915 }, { hasTouch: true, isMobile: true });
  await naCozinha(pg, 'facil', 'bolo-cenoura');
  await irAoPasso(pg, 'secos');
  await pg.click('[data-u="tigela"]');
  await pg.waitForSelector('#palco .destino .recip');
  const n0 = await pg.evaluate(() => +document.querySelector('#palco .destino .enche').dataset.nivel);
  await pg.click('#palco .chip-ing[data-ing="farinha"]');
  await pg.waitForTimeout(520);
  const v = await pg.evaluate(() => {
    const p = document.querySelector('.particula.ing-voa'), b = document.querySelector('#palco .destino .boca').getBoundingClientRect(), r = p.getBoundingClientRect();
    const m = new DOMMatrix(getComputedStyle(p).transform);
    return { inclina: +p.dataset.inclina, ang: Math.atan2(m.b, m.a) * 180 / Math.PI, x: r.left + r.width / 2, bocaX: b.left };
  });
  assert.ok(v.x < v.bocaX, 'o pacote fica à esquerda da boca da tigela');
  assert.ok(v.inclina > 0 && v.ang > 30, 'e inclina para a direita (para a tigela): ' + v.ang.toFixed(1) + '°');
  await pg.waitForFunction(n0 => +document.querySelector('#palco .destino .enche').dataset.nivel > n0, n0, { timeout: 4000 });
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

// ---------- lavar as mãos ----------
test('lavar as mãos: torneira com água, duas mãos que esfregam junto com o dedo, espuma e "Mãos limpinhas!"', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await abrirMov({ width: 412, height: 915 }, { hasTouch: true, isMobile: true });
  await naCozinha(pg, 'facil', 'vitamina');
  await pg.click('[data-u="pia"]');
  await pg.waitForSelector('#palco .pia-giro .cena-pia');
  for (const s of ['.agua-cai', '.agua-luz', '.mao-e', '.mao-d', '.maos .mao.m-esq', '.maos .mao.m-dir']) assert.equal(await pg.locator('#palco .cena-pia ' + s).count(), 1, 'falta ' + s);
  const total = await pg.locator('#palco .cena-pia .bolha').count();
  assert.ok(total >= 10, 'bolhas de espuma: ' + total);
  assert.equal(await pg.locator('#palco .cena-pia .bolha.vis').count(), 0, 'sem espuma antes de esfregar');
  assert.equal(await pg.evaluate(() => getComputedStyle(document.querySelector('.agua-luz')).animationName), 'aguaCorre', 'a água corre');
  const antes = await pg.getAttribute('#palco .mao-e', 'transform');
  await circulos(pg, '#palco .alvo-giro', 0.7);
  const meio = await pg.locator('#palco .cena-pia .bolha.vis').count();
  assert.ok(meio > 0 && meio < total, 'a espuma aparece aos poucos: ' + meio);
  assert.notEqual(await pg.getAttribute('#palco .mao-e', 'transform'), antes, 'as mãos esfregam');
  const n = await feitos(pg);
  await circulos(pg, '#palco .alvo-giro', 1.2);
  await pg.waitForSelector('#palco .pia-giro.limpo');
  assert.match(await pg.textContent('#palco .limpinho'), /Mãos limpinhas!/);
  assert.ok(await pg.locator('#palco .limpinho').isVisible());
  await pg.waitForFunction(k => window.Cozinha.jogo().cz.feitos.length > k, n, { timeout: 5000 });
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

// ---------- receita pronta: o menininho comendo e a foto ----------
async function prontoMov(viewport, extra, antes) {
  const r = await abrirMov(viewport, extra, antes);
  await naCozinha(r.pg, 'facil', 'bolo-cenoura');
  await irAoPasso(r.pg, null);
  await r.pg.waitForSelector('#pronto.ativa');
  return r;
}
const ehPng = b => b[0] === 0x89 && b.slice(1, 4).toString() === 'PNG';

test('pronto: o menininho come de verdade (garfo à boca, mastiga, lambe os lábios, "Hmm!") com vapor e brilho', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await prontoMov({ width: 412, height: 915 }, { hasTouch: true, isMobile: true });
  assert.equal(await pg.locator('#prontoPrato svg.menino.animado').count(), 1, 'o menininho aparece animado');
  for (const s of ['.garfo', '.faquinha', '.boca', '.lingua', '.hmm', '.vapor path', '.chapeu']) assert.ok(await pg.locator('#prontoPrato .menino ' + s).count() >= 1, 'falta ' + s);
  const q = await pg.evaluate(async () => {
    const s = document.querySelector('#prontoPrato svg'), g = x => s.querySelector(x), v = { garfo: new Set(), boca: new Set(), lingua: new Set(), hmm: [], felizes: new Set() };
    for (let i = 0; i < 58; i++) {
      v.garfo.add(g('.garfo').getAttribute('transform')); v.boca.add(g('.boca').getAttribute('d')); v.lingua.add(g('.lingua').getAttribute('opacity'));
      v.hmm.push(+g('.hmm').getAttribute('opacity')); v.felizes.add(g('.olhos-felizes').getAttribute('opacity'));
      await new Promise(r => setTimeout(r, 100));
    }
    return { garfo: v.garfo.size, boca: v.boca.size, lingua: [...v.lingua], hmmMax: Math.max(...v.hmm), hmmMin: Math.min(...v.hmm), felizes: [...v.felizes] };
  });
  assert.ok(q.garfo > 10, 'o garfo vai e volta: ' + q.garfo);
  assert.ok(q.boca > 8, 'a boca abre e mastiga: ' + q.boca);
  assert.ok(q.lingua.includes('1') && q.lingua.includes('0'), 'a língua lambe os lábios e volta');
  assert.ok(q.hmmMax > 0.9 && q.hmmMin < 0.1, '"Hmm!" aparece e some');
  assert.ok(q.felizes.includes('1') && q.felizes.includes('0'), 'olhos felizes enquanto mastiga');
  assert.equal(await pg.evaluate(() => getComputedStyle(document.querySelector('#prontoPrato .vapor path')).animationName), 'vaporM', 'vapor subindo do prato');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('pronto com movimento reduzido: o menininho fica parado numa pose feliz (lambendo os lábios, "Hmm!")', { timeout: 30000 }, async () => {
  const { ctx, pg, erros } = await abrir({ width: 412, height: 915 });
  await naCozinha(pg, 'facil', 'vitamina'); await irAoPasso(pg, null); await pg.waitForSelector('#pronto.ativa');
  assert.equal(await pg.locator('#prontoPrato svg.menino').count(), 1);
  assert.equal(await pg.locator('#prontoPrato svg.menino.animado').count(), 0, 'sem animação');
  assert.notEqual(await pg.getAttribute('#prontoPrato .lingua', 'opacity'), '0');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

function compartilharDeMentira() {
  window.__compart = null;
  navigator.canShare = d => !!(d && d.files && d.files.length);
  navigator.share = async d => {
    const f = d.files[0], b = new Uint8Array(await f.arrayBuffer());
    window.__compart = { nome: f.name, tipo: f.type, tam: f.size, png: b[0] === 0x89 && String.fromCharCode(b[1], b[2], b[3]) === 'PNG', w: (b[16] << 24 | b[17] << 16 | b[18] << 8 | b[19]), h: (b[20] << 24 | b[21] << 16 | b[22] << 8 | b[23]), titulo: d.title };
  };
}
test('📷 Guardar a foto no celular: abre o compartilhar com um PNG 1080 × 1350 do prato com o menininho', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await prontoMov({ width: 412, height: 915 }, { hasTouch: true, isMobile: true }, compartilharDeMentira);
  assert.match(await pg.textContent('#btFoto'), /Guardar a foto/);
  await pg.click('#btFoto');
  await pg.waitForFunction(() => window.__compart, null, { timeout: 15000 });
  const c = await pg.evaluate(() => window.__compart);
  assert.equal(c.tipo, 'image/png'); assert.ok(c.png, 'é PNG de verdade');
  assert.match(c.nome, /^mao-na-massa-bolo-cenoura-\d{4}-\d\d-\d\d\.png$/);
  assert.equal(c.w + 'x' + c.h, '1080x1350');
  assert.ok(c.tam > 60000, 'imagem de verdade (não vazia): ' + c.tam + ' bytes');
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

test('📷 Guardar a foto no computador: baixa o PNG', { timeout: 60000 }, async () => {
  const { ctx, pg, erros } = await prontoMov({ width: 1280, height: 800 }, { acceptDownloads: true });
  const [dl] = await Promise.all([pg.waitForEvent('download', { timeout: 15000 }), pg.click('#btFoto')]);
  assert.match(dl.suggestedFilename(), /^mao-na-massa-bolo-cenoura-.*\.png$/);
  const b = require('fs').readFileSync(await dl.path());
  assert.ok(ehPng(b), 'PNG'); assert.ok(b.length > 60000, 'tamanho ' + b.length);
  assert.match(await pg.textContent('#aviso'), /Foto guardada/);
  assert.deepEqual(erros, [], 'erros no console');
  await ctx.close();
});

// ---------- a bolinha 🎵 da música (recolhida, no canto de baixo à direita) não cobre nada importante ----------
// Olha, com a página no começo e no fim (na cozinha, em todas as posições da rolagem), cada botão/item que está
// inteiro na tela e por cima de tudo.
const cobertos = (pg, rolando) => pg.evaluate(async rolando => {
  const tr = document.querySelector('.trilha'); tr.classList.add('mini');
  const res = [], alto = document.documentElement.scrollHeight - innerHeight, pos = [0];
  if (rolando) for (let y = 60; y < alto; y += 60) pos.push(y);
  pos.push(alto);
  for (const y of pos) {
    const fim = y === alto && y > 0;
    window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40));
    const b = tr.getBoundingClientRect(); tr.style.visibility = 'hidden';
    for (const el of document.querySelectorAll('.tela.ativa button, .tela.ativa [role=button], .tela.ativa .cesta .item, .tela.ativa .utensilio')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || r.top < 0 || r.left < 0 || r.bottom > innerHeight || r.right > innerWidth) continue;
      const topo = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (!topo || !(el === topo || el.contains(topo))) continue;
      if (r.right > b.left + 1 && r.left < b.right - 1 && r.bottom > b.top + 1 && r.top < b.bottom - 1) res.push((el.id || el.className || el.tagName) + ' ' + (el.textContent || '').trim().slice(0, 20) + ' (rolagem ' + Math.round(y) + ')');
    }
    tr.style.visibility = '';
  }
  window.scrollTo(0, 0);
  return res;
}, !!rolando);
for (const vp of [{ width: 390, height: 844 }, { width: 412, height: 915 }, { width: 915, height: 412 }]) {
  test('bolinha da música em ' + vp.width + '×' + vp.height + ': não cobre a cesta, os utensílios nem os botões', { timeout: 90000 }, async () => {
    const { ctx, pg, erros } = await abrir(vp, { hasTouch: true, isMobile: true });
    await pg.waitForSelector('.trilha');
    await comecar(pg, 'medio', 'bolo-cenoura');
    await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.cesta.cenoura = 1; j.cesta.ovo = 3; j.cesta.oleo = 1; });
    const onde = {};
    onde.mapa = await cobertos(pg);
    for (const l of ['pomar', 'horta', 'mercado', 'vizinha', 'rio']) { await noLugar(pg, l); onde[l] = await cobertos(pg); await voltarVila(pg); }
    await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.imprevistoFeito = true; j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
    await pg.click('[data-lugar="casa"]'); await pg.waitForSelector('#cozinha.ativa');
    onde.utensilios = await cobertos(pg, true);
    await irAoPasso(pg, 'liq'); await pg.click('[data-u="liquidificador"]'); await pg.waitForSelector('#palco .chip-ing');
    onde.ingredientes = await cobertos(pg, true);
    await irAoPasso(pg, null); await pg.waitForSelector('#pronto.ativa');
    onde.pronto = await cobertos(pg);
    for (const k in onde) assert.deepEqual(onde[k], [], 'a bolinha cobre em ' + k);
    // e a cesta guarda o canto: nenhum item da cesta embaixo da bolinha
    assert.deepEqual(erros, [], 'erros no console');
    await ctx.close();
  });
}

// ---------- celular deitado: cada tela cabe ----------
async function cabe(pg, nome, seletores) {
  const r = await pg.evaluate(sel => {
    const W = innerWidth, H = innerHeight, cesta = document.querySelector('.tela.ativa .cesta'), limite = cesta ? cesta.getBoundingClientRect().top : H;
    const fora = [];
    for (const s of sel) {
      const els = [...document.querySelectorAll(s)].filter(e => e.getBoundingClientRect().width > 0);
      if (!els.length) fora.push(s + ' (não existe)');
      for (const e of els) { const b = e.getBoundingClientRect(); if (b.left < -1 || b.right > W + 1 || b.top < -1 || b.bottom > limite + 1) fora.push(s + ' ' + JSON.stringify([Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)])); }
    }
    return { rola: document.documentElement.scrollWidth > W + 1, fora, W, H, limite };
  }, seletores);
  assert.equal(r.rola, false, nome + ': a página rola para o lado');
  assert.deepEqual(r.fora, [], nome + ': fora da tela (' + r.W + '×' + r.H + ', até ' + Math.round(r.limite) + ')');
}
for (const vp of [{ width: 915, height: 412 }, { width: 844, height: 390 }]) {
  test('celular deitado ' + vp.width + '×' + vp.height + ': todas as telas cabem, sem rolar para o lado', { timeout: 120000 }, async () => {
    const { ctx, pg, erros } = await abrir(vp, { hasTouch: true, isMobile: true });
    await cabe(pg, 'entrada', ['#btEntrar']);
    await pg.click('#btEntrar');
    await cabe(pg, 'menu', ['#niveis .nivel']);
    await pg.click('[data-nivel="dificil"]'); await pg.click('[data-rec="peixe-assado"]'); await pg.waitForSelector('#receita.ativa');
    await cabe(pg, 'ficha da receita', ['#btBuscar', '#recIngredientes li']);
    await pg.click('#btBuscar'); await pg.waitForSelector('#mapa.ativa');
    await cabe(pg, 'vila', ['.vila .lugar']);
    const chave = { rio: ['.agua', '#btPuxar'], pomar: ['.pomar .pe'], horta: ['.canteiro .planta'], galinheiro: ['.galinha'], vaca: ['.mimosa', '#btOrdenhar'], mercado: ['.prateleira .produto'], vizinha: ['.casinha', '.pedido'] };
    for (const l in chave) { await noLugar(pg, l); await cabe(pg, l, ['#lugar .voltar'].concat(chave[l])); await voltarVila(pg); }
    await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.imprevistoFeito = true; j.precisa.forEach(x => { j.cesta[x.id] = x.q; }); });
    await pg.click('[data-lugar="casa"]'); await pg.waitForSelector('#cozinha.ativa');
    await cabe(pg, 'cozinha (fichas)', ['#utensilios .utensilio', '#cozinha .voltar']);
    await pg.click('.ficha-bt[data-passo="lavar"]'); await pg.waitForFunction(() => window.Cozinha.jogo().cz.fase === 'utensilio');
    await pg.click('[data-u="pia"]');
    await cabe(pg, 'cozinha (lavar)', ['#palco .alvo-giro', '#palco .bt-alt', '#utensilios .utensilio']);
    await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.cz.feitos = j.passos.filter(p => p.id !== 'temperar' && p.id !== 'legumes' && p.id !== 'assar' && p.id !== 'servir').map(p => p.id); j.cz.fase = 'feito'; window.Cozinha.mostrar('cozinha'); });
    await pg.click('.ficha-bt[data-passo="temperar"]'); await pg.waitForFunction(() => window.Cozinha.jogo().cz.fase === 'utensilio');
    await pg.click('[data-u="forma"]');
    await cabe(pg, 'cozinha (pôr na assadeira)', ['#palco .destino', '#palco .chip-ing', '#utensilios .utensilio']);
    await pg.evaluate(() => { const j = window.Cozinha.jogo(); j.cz.feitos = j.passos.map(p => p.id); j.cz.fase = 'feito'; window.Cozinha.mostrar('cozinha'); });
    await pg.waitForSelector('#pronto.ativa');
    await cabe(pg, 'pronto', ['#prontoPrato', '#btFoto', '#btDeNovo', '#btOutra']);
    assert.deepEqual(erros, [], 'erros no console');
    await ctx.close();
  });
}
