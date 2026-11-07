// A Batalha Naval de verdade no Chromium (Playwright): node --test batalha-naval/teste/navegador.test.js
// Servidor pequeno dentro do teste (a pasta kids inteira). Com ?teste, o "canal" entre aparelhos é um BroadcastChannel
// do próprio navegador: várias abas do mesmo navegador fazem o papel de vários celulares (sem internet, sem Supabase).
// Confere: abre sem erro no celular e no computador, arrumar a frota (tocar, girar, arrastar), partida inteira contra o
// computador, passar o aparelho com a tela de "não espie", e partidas inteiras em rede com 2 e 3 abas, inclusive
// recarregando uma aba no meio.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('playwright');

const raiz = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml', '.md': 'text/markdown; charset=utf-8' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.startsWith('/solverone-dados/')) { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(p.endsWith('/kids.json') ? '{"recursos":{"ingles":{"ligado":true}}}' : '{}'); return; }   // e o inglês ligado (../idioma.js): o teste troca o idioma   // interruptores do RootifyONE (no site de verdade existem)
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
let base, browser;
test.before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/batalha-naval/';
  browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
});
test.after(async () => { await browser.close(); server.close(); });

function vigiar(pg) {
  const erros = [];
  pg.on('console', m => { if (m.type() === 'error') erros.push(m.text() + ' @' + ((m.location() && m.location().url) || '')); });
  pg.on('pageerror', e => erros.push('pageerror: ' + e.message));
  return erros;
}
async function novaAba(ctx, url = base + '?teste') {
  const pg = await ctx.newPage(); const erros = vigiar(pg);
  await pg.goto(url); await pg.waitForSelector('#inicio.ativa');
  return { pg, erros };
}
const visivel = (pg, sel) => pg.$eval(sel, el => !el.hidden && el.getClientRects().length > 0).catch(() => false);

test('abre sem erro no celular em pé e no computador, nas duas línguas, sem rolar para o lado', async () => {
  for (const [vp, toque] of [[{ width: 360, height: 740 }, true], [{ width: 1280, height: 800 }, false], [{ width: 800, height: 1280 }, true]]) {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: toque, locale: 'pt-BR' });
    const { pg, erros } = await novaAba(ctx);
    assert.match(await pg.textContent('#versao'), /0\.3\.3/);
    assert.equal(await pg.textContent('#btPC'), '🤖 Contra o computador');
    await pg.click('#btLingua');
    assert.equal(await pg.textContent('#btPC'), '🤖 Against the computer');
    await pg.click('#btLingua');
    for (const tela of ['inicio']) assert.ok(await visivel(pg, '#' + tela));
    // uma partida contra o computador aberta, para medir as telas de jogo
    await pg.click('#btPC'); await pg.click('[data-nivel="dificil"]');
    await pg.click('#btSortear'); await pg.click('#btPronto');
    await pg.waitForSelector('#jogo.ativa');
    const larg = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(larg <= 0, 'rola para o lado em ' + vp.width + 'px: ' + larg);
    const alvo = await pg.$eval('#tabAlvo', el => el.getBoundingClientRect().width);
    assert.ok(alvo >= Math.min(vp.width, vp.height) * 0.5, 'mar do adversário pequeno demais: ' + alvo);
    assert.ok(await pg.evaluate(() => !!window.Trilha && document.querySelector('.trilha') !== null), 'tocador de música');
    assert.deepEqual(erros, [], 'erros no console (' + vp.width + 'px)');
    await ctx.close();
  }
});

test('músicas: pelo menos 10, todas existem e têm crédito', async () => {
  const ctx = await browser.newContext();
  const { pg } = await novaAba(ctx);
  const musicas = await pg.evaluate(() => window.BNApp.MUSICAS);
  assert.ok(musicas.length >= 10);
  const creditos = fs.readFileSync(path.join(raiz, 'batalha-naval', 'CREDITOS.md'), 'utf8');
  for (const m of musicas) {
    assert.ok(fs.existsSync(path.join(raiz, 'batalha-naval', m.a)), 'falta ' + m.a);
    assert.ok(creditos.includes(path.basename(m.a)), 'sem crédito em CREDITOS.md: ' + m.a);
    assert.ok(!/unholy-knight|metalmania|noise-attack|iron-bacon/.test(m.a), 'música pesada demais: ' + m.a);
  }
  await ctx.close();
});

test('arrumar a frota: tocar põe, tocar no navio gira, arrastar muda de lugar, Pronto só com tudo no mar', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 800 } });
  const { pg, erros } = await novaAba(ctx);
  await pg.click('#btPC'); await pg.click('[data-nivel="facil"]');
  const casa = async (x, y) => { const b = await pg.$eval('#arrTab', (el, [x, y]) => { const r = el._c[y][x].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, [x, y]); return { x: b[0], y: b[1] }; };
  const navios = () => pg.$$eval('#arrTab .c.nv', l => l.length);
  const toque = async (x, y) => { const c = await casa(x, y); await pg.mouse.click(c.x, c.y); };
  assert.equal(await pg.$eval('#btPronto', b => b.disabled), true);
  await toque(0, 0);                                          // o navio-mãe (4) já vem escolhido: A1, deitado
  assert.equal(await navios(), 4);
  assert.deepEqual(await pg.$eval('#arrTab', el => [0, 1, 2, 3].map(x => el._c[0][x].classList.contains('nv'))), [true, true, true, true]);
  await toque(1, 0);                                          // tocar nele: gira (fica em pé, A1 a A4)
  assert.deepEqual(await pg.$eval('#arrTab', el => [0, 1, 2, 3].map(y => el._c[y][0].classList.contains('nv'))), [true, true, true, true]);
  await toque(7, 7);                                          // próximo navio (3) num canto: ajusta para caber (F8 a H8)
  assert.equal(await navios(), 7);
  assert.ok(await pg.$eval('#arrTab', el => el._c[7][5].classList.contains('nv') && el._c[7][7].classList.contains('nv')));
  // arrastar o de 3 casas de H8 para C3
  const de = await casa(6, 7), para = await casa(3, 2);
  await pg.mouse.move(de.x, de.y); await pg.mouse.down(); await pg.mouse.move(de.x + 20, de.y - 20, { steps: 3 }); await pg.mouse.move(para.x, para.y, { steps: 6 }); await pg.mouse.up();
  assert.ok(await pg.$eval('#arrTab', el => el._c[2][2].classList.contains('nv') && el._c[2][4].classList.contains('nv') && !el._c[7][6].classList.contains('nv')), 'arrastar não mudou o navio de lugar');
  // por cima de outro não pode
  await toque(0, 1);
  assert.equal(await navios(), 7, 'pôs por cima de outro navio');
  assert.equal(await pg.$eval('#btPronto', b => b.disabled), true);
  await pg.click('#btSortear');
  assert.equal(await navios(), 11);
  assert.equal(await pg.$eval('#btPronto', b => b.disabled), false);
  assert.deepEqual(erros, []);
  await ctx.close();
});

async function jogarAteFim(abas, max = 900) {
  for (let i = 0; i < max; i++) {
    let todos = true;
    for (const { pg } of abas) {
      if (!(await visivel(pg, '#fimCaixa'))) todos = false;
      const minha = await pg.$eval('#banner', b => b.classList.contains('minha')).catch(() => false);
      if (minha) { const c = await pg.$('#tabAlvo.pode button.c:not(:disabled)'); if (c) await c.click().catch(() => {}); }
    }
    if (todos) return i;
    await abas[0].pg.waitForTimeout(40);
  }
  throw new Error('a partida não terminou');
}

test('contra o computador: partida inteira, e o computador nunca atira duas vezes no mesmo lugar', async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true });
  const aba = await novaAba(ctx);
  await aba.pg.click('#btPC'); await aba.pg.click('[data-nivel="facil"]');
  await aba.pg.click('#btSortear'); await aba.pg.click('#btPronto');
  await jogarAteFim([aba]);
  const d = await aba.pg.evaluate(() => window.BNApp.dados());
  assert.equal(d.fase, 'fim');
  const vistos = new Set();
  for (const e of d.log) { const k = e.slice(0, 4).join(); assert.ok(!vistos.has(k), 'tiro repetido ' + k); vistos.add(k); }
  assert.match(await aba.pg.textContent('#fimTitulo'), /venceu|won/);
  assert.deepEqual(aba.erros, []);
  await ctx.close();
});

test('passar o aparelho: a tela de "não espie" aparece entre as vezes e esconde o mar', async () => {
  const ctx = await browser.newContext({ viewport: { width: 800, height: 1280 }, hasTouch: true, locale: 'pt-BR' });
  const { pg, erros } = await novaAba(ctx);
  await pg.click('#btPassa'); await pg.click('[data-nivel="facil"]');
  assert.ok(await visivel(pg, '#cortina')); assert.match(await pg.textContent('#cortinaTitulo'), /Jogador 1/);
  await pg.click('#btCortina'); await pg.click('#btSortear'); await pg.click('#btPronto');
  assert.match(await pg.textContent('#cortinaTitulo'), /Jogador 2/);
  await pg.click('#btCortina'); await pg.click('#btSortear'); await pg.click('#btPronto');
  await pg.click('#btCortina');
  assert.match(await pg.textContent('#banner'), /Jogador 1, sua vez/);
  await pg.click('#tabAlvo button.c:not(:disabled)');
  await pg.waitForSelector('#cortina:not([hidden])');
  assert.match(await pg.textContent('#cortinaTitulo'), /Jogador 2/);
  const cobre = await pg.evaluate(() => { const r = document.getElementById('cortina').getBoundingClientRect(); return r.width >= innerWidth && r.height >= innerHeight; });
  assert.ok(cobre, 'a cortina precisa cobrir a tela inteira');
  await pg.click('#btCortina');
  assert.match(await pg.textContent('#banner'), /Jogador 2, sua vez/);
  assert.match(await pg.textContent('#tituloMeu'), /Jogador 2/);
  assert.deepEqual(erros, []);
  await ctx.close();
});

async function criarSala(aba, nome, nivel) {
  await aba.pg.click('#btAmigos'); await aba.pg.fill('#nome', nome); await aba.pg.click('#btCriar'); await aba.pg.click(`[data-nivel="${nivel}"]`);
  await aba.pg.waitForSelector('#sala.ativa');
  await aba.pg.waitForFunction(() => /^[A-Z]{4}$/.test(document.getElementById('salaCodigo').textContent));
  return aba.pg.textContent('#salaCodigo');
}
async function entrarSala(aba, nome, codigo) {
  await aba.pg.click('#btAmigos'); await aba.pg.fill('#nome', nome); await aba.pg.fill('#codigo', codigo.toLowerCase()); await aba.pg.click('#btEntrar');
  await aba.pg.waitForSelector('#sala.ativa', { timeout: 10000 }).catch(async e => { console.log('DEBUG', await aba.pg.evaluate(() => [document.querySelector('.tela.ativa').id, location.href, document.getElementById('amigosMsg').textContent, document.getElementById('codigo').value, document.getElementById('janela').hidden, document.getElementById('janelaTitulo').textContent])); throw e; });
}

// supabase-js de mentira (o de verdade não alcança a internet daqui): os canais conversam por BroadcastChannel,
// com o mesmo jeito do Realtime (channel → on('broadcast') → subscribe(status) → send({type, event, payload})).
// Assim o caminho de verdade do rede.js (sem ?teste) é testado, inclusive o canal caindo no meio.
const SUPABASE_FALSO = () => {
  window.__canais = [];
  window.supabase = { createClient: function (url, chave, op) {
    window.__sb = { url: url, chave: chave, op: op };
    return {
      channel: function (nome, cfg) {
        var bc = new BroadcastChannel('falso-' + nome), ouvintes = [], aviso = null;
        var c = { nome: nome, cfg: cfg, fechado: false,
          on: function (tipo, filtro, fn) { if (tipo === 'broadcast' && filtro.event === 'm') ouvintes.push(fn); return c; },
          subscribe: function (fn) { aviso = fn; setTimeout(function () { fn('SUBSCRIBED'); }, 30); return c; },
          send: function (m) { if (!c.fechado && m.type === 'broadcast') bc.postMessage({ event: m.event, payload: m.payload }); return Promise.resolve('ok'); },
          cair: function () { c.fechado = true; bc.close(); aviso('CLOSED'); } };
        bc.onmessage = function (ev) { if (!c.fechado) ouvintes.forEach(function (fn) { fn({ payload: ev.data.payload }); }); };
        window.__canais.push(c);
        return c;
      },
      removeChannel: function (c) { if (!c.fechado) { c.fechado = true; } }
    };
  } };
};

test('caminho de verdade do Supabase (cliente de mentira): partida inteira e o canal caindo no meio', async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 820 }, hasTouch: true, locale: 'pt-BR' });
  await ctx.addInitScript(SUPABASE_FALSO);
  const a = await novaAba(ctx, base), b = await novaAba(ctx, base);
  const codigo = await criarSala(a, 'Ana', 'facil');
  await entrarSala(b, 'Beto', codigo);
  const sb = await a.pg.evaluate(() => ({ url: window.__sb.url, chave: window.__sb.chave, canal: window.__canais[0].nome, self: window.__canais[0].cfg.config.broadcast.self }));
  assert.match(sb.url, /^https:\/\/[a-z0-9]+\.supabase\.co$/); assert.match(sb.chave, /^sb_publishable_/);
  assert.equal(sb.canal, 'batalha-naval-' + codigo); assert.equal(sb.self, false);
  await a.pg.waitForFunction(() => document.querySelectorAll('#salaLista li').length === 2);
  await arrumarEPronto(a); await arrumarEPronto(b);
  await a.pg.waitForFunction(() => !document.getElementById('btComecar').disabled);
  await a.pg.click('#btComecar');
  await b.pg.waitForSelector('#jogo.ativa');
  for (let i = 0; i < 10; i++) await jogarAteFim([a, b], 1).catch(() => {});
  // o canal do Beto cai (tela travada): o jogo abre outro sozinho e a partida segue
  await b.pg.evaluate(() => window.__canais[window.__canais.length - 1].cair());
  await b.pg.waitForFunction(() => window.__canais.length >= 2 && !window.__canais[window.__canais.length - 1].fechado);
  await jogarAteFim([a, b]);
  const da = await a.pg.evaluate(() => window.BNApp.dados()), db = await b.pg.evaluate(() => window.BNApp.dados());
  assert.equal(da.fase, 'fim'); assert.equal(da.venc, db.venc); assert.deepEqual(da.log, db.log);
  assert.deepEqual(a.erros, []); assert.deepEqual(b.erros, []);
  await ctx.close();
});
async function arrumarEPronto(aba) {
  await aba.pg.waitForSelector('#btArrumar:not([hidden])'); await aba.pg.click('#btArrumar');
  await aba.pg.click('#btSortear'); await aba.pg.click('#btPronto'); await aba.pg.waitForSelector('#sala.ativa');
}

test('com amigos em 2 aparelhos (abas): código, frota, vez, recarregar no meio e fim igual para os dois', async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 820 }, hasTouch: true, locale: 'pt-BR' });
  const a = await novaAba(ctx), b = await novaAba(ctx);
  const codigo = await criarSala(a, 'Ana', 'facil');
  assert.match(await a.pg.textContent('#salaLink'), new RegExp('\\?sala=' + codigo + '$'));
  await entrarSala(b, 'Beto', codigo);
  await a.pg.waitForFunction(() => document.querySelectorAll('#salaLista li').length === 2);
  await b.pg.waitForFunction(() => document.querySelectorAll('#salaLista li').length === 2);
  assert.match(await b.pg.textContent('#salaLista'), /Ana.*Beto/s);
  assert.equal(await a.pg.$eval('#btComecar', x => x.disabled), true, 'começar antes de todos prontos');
  assert.ok(await b.pg.$eval('#btComecar', x => x.hidden), 'só o anfitrião começa');
  await arrumarEPronto(a); await arrumarEPronto(b);
  await a.pg.waitForFunction(() => !document.getElementById('btComecar').disabled);
  await a.pg.click('#btComecar');
  await a.pg.waitForSelector('#jogo.ativa'); await b.pg.waitForSelector('#jogo.ativa');
  // um banner verde (sua vez) e o outro esperando, sempre
  const bA = await a.pg.$eval('#banner', x => x.className), bB = await b.pg.$eval('#banner', x => x.className);
  assert.ok(/minha/.test(bA) !== /minha/.test(bB), 'exatamente um dos dois na vez: ' + bA + ' / ' + bB);
  // a frota é segredo: a aba de um não tem a frota do outro
  const fa = await a.pg.evaluate(() => window.BNApp.dados().frota), fb = await b.pg.evaluate(() => window.BNApp.dados().frota);
  assert.notDeepEqual(fa, fb);
  // alguns tiros, depois o Beto recarrega a página
  for (let i = 0; i < 12; i++) await jogarAteFim([a, b], 1).catch(() => {});
  const antes = (await a.pg.evaluate(() => window.BNApp.dados().log.length));
  assert.ok(antes >= 2, 'quase nenhum tiro antes de recarregar: ' + antes);
  await b.pg.reload(); await b.pg.waitForSelector('#jogo.ativa', { timeout: 10000 });
  await b.pg.waitForFunction(n => window.BNApp.dados() && window.BNApp.dados().log.length >= n, antes);
  await jogarAteFim([a, b]);
  const da = await a.pg.evaluate(() => window.BNApp.dados()), db = await b.pg.evaluate(() => window.BNApp.dados());
  assert.equal(da.venc, db.venc); assert.deepEqual(da.log, db.log);
  assert.equal(await a.pg.textContent('#fimTitulo') === await b.pg.textContent('#fimTitulo'), false, 'um ganhou e o outro não');
  // no fim, cada um vê a frota que sobrou do outro
  await a.pg.waitForFunction(() => Object.keys(window.BNApp.dados().revel).length === 2);
  // jogar de novo na mesma sala (só o anfitrião tem o botão)
  assert.ok(await visivel(a.pg, '#btDeNovo')); assert.ok(!(await visivel(b.pg, '#btDeNovo')));
  await a.pg.click('#btDeNovo');
  await a.pg.waitForSelector('#sala.ativa'); await b.pg.waitForSelector('#sala.ativa');
  assert.deepEqual(a.erros, []); assert.deepEqual(b.erros, []);
  await ctx.close();
});

test('com amigos em 3 aparelhos (abas): todos contra todos, escolhendo o alvo, até sobrar um', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'pt-BR' });
  const abas = [await novaAba(ctx), await novaAba(ctx), await novaAba(ctx)];
  const codigo = await criarSala(abas[0], 'Ana', 'facil');
  await entrarSala(abas[1], 'Beto', codigo); await entrarSala(abas[2], 'Caio', codigo);
  await abas[0].pg.waitForFunction(() => document.querySelectorAll('#salaLista li').length === 3);
  for (const x of abas) await arrumarEPronto(x);
  await abas[0].pg.waitForFunction(() => !document.getElementById('btComecar').disabled);
  await abas[0].pg.click('#btComecar');
  for (const x of abas) await x.pg.waitForSelector('#jogo.ativa');
  assert.equal(await abas[0].pg.$$eval('#alvos button', l => l.length), 2, 'com 3 jogadores aparecem 2 alvos para escolher');
  // quem está na vez troca de alvo de vez em quando
  let troca = 0;
  for (let i = 0; i < 1500; i++) {
    let fim = true;
    for (const { pg } of abas) {
      if (!(await visivel(pg, '#fimCaixa'))) fim = false;
      if (await pg.$eval('#banner', b => b.classList.contains('minha')).catch(() => false)) {
        if (++troca % 3 === 0) { const t = await pg.$$('#alvos button:not(:disabled)'); if (t.length) await t[troca % t.length].click().catch(() => {}); }
        const c = await pg.$('#tabAlvo.pode button.c:not(:disabled)'); if (c) await c.click().catch(() => {});
      }
    }
    if (fim) break;
    await abas[0].pg.waitForTimeout(30);
  }
  const ds = await Promise.all(abas.map(x => x.pg.evaluate(() => window.BNApp.dados())));
  for (const d of ds) { assert.equal(d.fase, 'fim'); assert.equal(d.venc, ds[0].venc); assert.deepEqual(d.log, ds[0].log); }
  assert.equal(ds[0].j.filter(p => p.f).length, 2, 'dois afundados, um vencedor');
  const alvosUsados = new Set(ds[0].log.map(e => e[0] + '>' + e[1]));
  assert.ok(alvosUsados.size >= 4, 'os tiros foram para alvos diferentes: ' + [...alvosUsados]);
  for (const x of abas) assert.deepEqual(x.erros, []);
  await ctx.close();
});

test('entrar com código que não existe avisa; sair da sala volta para o início e limpa a partida guardada', async () => {
  const ctx = await browser.newContext({ locale: 'pt-BR' });
  const { pg, erros } = await novaAba(ctx);
  await pg.click('#btAmigos'); await pg.fill('#codigo', 'AB'); await pg.click('#btEntrar');
  assert.match(await pg.textContent('#amigosMsg'), /4 letras/);
  const codigo = await (async () => { await pg.click('.voltar >> nth=1').catch(() => {}); await pg.goto(base + '?teste'); return criarSala({ pg }, 'Ana', 'medio'); })();
  assert.ok(await pg.evaluate(() => !!localStorage.getItem('batalha-naval.rede')));
  assert.match(pg.url(), new RegExp('sala=' + codigo));
  await pg.click('#btSairSala'); await pg.click('#janelaBotoes button >> nth=0');
  await pg.waitForSelector('#inicio.ativa');
  assert.ok(await pg.evaluate(() => !localStorage.getItem('batalha-naval.rede')));
  assert.ok(!/sala=/.test(pg.url()));
  // link do convite (?sala=CODIGO): abre direto em Entrar, com o código preenchido; só falta o nome
  await pg.goto(base + '?sala=QWER&teste'); await pg.waitForSelector('#amigos.ativa');
  assert.equal(await pg.inputValue('#codigo'), 'QWER');
  assert.deepEqual(erros, []);
  await ctx.close();
});
