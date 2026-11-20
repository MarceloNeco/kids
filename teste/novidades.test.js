// ✨ Novidades da semana (dono, 14/Nov/2026): jogo que entrou na estante há até 7 dias (campo "novo" do catalogo.js)
// aparece numa janela bonita (ícone, nome, frase, ▶ Jogar) toda vez que a estante abre ou recarrega (não ao voltar de
// um jogo), até "Não mostrar mais esta mensagem"; e o cartão dele ganha "✨ Novo". Jogo que já existia e ganhou novidade
// (campo "atualizado", dono, 20/Nov/2026) vem embaixo, em "jogos que ganharam novidades", com a frase do que mudou.
// Rodar da raiz do repositório: node --test teste/novidades.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const raiz = path.join(__dirname, '..');

test('catálogo: datas "novo" válidas e de no máximo hoje', () => {
  const w = { }; new Function('window', 'document', fs.readFileSync(path.join(raiz, 'catalogo.js'), 'utf8'))(w, { querySelectorAll: () => [] });
  for (const j of w.BolinhoCatalogo.jogos) if (j.novo) {
    assert.match(j.novo, /^\d{4}-\d{2}-\d{2}$/, j.id + ': novo no formato AAAA-MM-DD');
    assert.ok(Date.parse(j.novo) <= Date.now() + 864e5, j.id + ': data no futuro');
  }
  for (const j of w.BolinhoCatalogo.jogos) if (j.atualizado) {
    const a = j.atualizado;
    assert.match(a.data, /^\d{4}-\d{2}-\d{2}$/, j.id + ': atualizado.data no formato AAAA-MM-DD');
    assert.ok(Date.parse(a.data) <= Date.now() + 864e5, j.id + ': atualizado no futuro');
    for (const l of ['pt', 'en', 'es']) assert.ok(typeof a[l] === 'string' && a[l].length > 10 && a[l].length <= 180, j.id + ': frase da novidade em ' + l + ' (curta)');
  }
  const C = w.BolinhoCatalogo, dia = (s) => Date.parse(s + 'T12:00:00');
  assert.ok(C.ehNovo({ novo: '2026-11-14' }, dia('2026-11-14')) && C.ehNovo({ novo: '2026-11-14' }, dia('2026-11-20')));
  assert.ok(!C.ehNovo({ novo: '2026-11-14' }, dia('2026-11-21')) && !C.ehNovo({}, dia('2026-11-14')));
});

test('estante: janela de novidades com os jogos da semana sempre que a estante abre (não ao voltar de um jogo), até "Não mostrar mais"; selo ✨ Novo; some depois de 7 dias e na TV', async () => {
  const { chromium } = require('playwright');
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (!p.startsWith('/kids/')) { r.writeHead(404); return r.end(); }
    p = p.slice(6); if (!p || p.endsWith('/')) p += 'index.html';
    const f = path.join(raiz, p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/kids/';
  const b = await chromium.launch();
  // "hoje" fixo: o dia em que entraram AQUA, GLUB GLUB, A-GARRA e Quem é?
  const contexto = async (hoje, cod) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    await ctx.addInitScript(([t, c]) => { const D = Date; Date.now = () => t; localStorage.setItem('bolinho:idioma', c || 'pt'); }, [hoje, cod]);
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    return ctx;
  };
  try {
    const hoje = Date.parse('2026-11-15T10:00:00');
    let ctx = await contexto(hoje), pg = await ctx.newPage();
    await pg.goto(base); await pg.waitForSelector('.nov:not([hidden])', { timeout: 3000 });
    assert.match(await pg.textContent('#novTitulo'), /Novidades da semana/);
    const ids = await pg.$$eval('.nov .nov-novos li a', (as) => as.map((a) => a.getAttribute('data-jogo')));
    assert.deepStrictEqual(ids.sort(), ['a-garra', 'aqua', 'glub-glub', 'quem-e']);
    // atualizados até 15/11 (Mão na Massa em 14/11, Purpurina em 15/11), com a frase do que mudou; o H-rraaa, novo, não repete
    const atu = await pg.$$eval('.nov .nov-atu li a', (as) => as.map((a) => [a.getAttribute('data-jogo'), a.querySelector('.tx span').textContent]));
    // os atualizados esperados saem do próprio catálogo (as datas mudam a cada versão nova de jogo)
    const cat = {}; new Function('window', 'document', fs.readFileSync(path.join(raiz, 'catalogo.js'), 'utf8'))(cat, { querySelectorAll: () => [] });
    const novosIds = ['a-garra', 'aqua', 'glub-glub', 'quem-e'];
    const esperados = cat.BolinhoCatalogo.atualizados(hoje).filter((j) => !novosIds.includes(j.id));
    assert.deepStrictEqual(atu.map((a) => a[0]).sort(), esperados.map((j) => j.id).sort());
    for (const j of esperados) assert.strictEqual(atu.find((a) => a[0] === j.id)[1], j.atualizado.pt, j.id + ': a frase do que mudou');
    if (esperados.length > 1) assert.match(await pg.$$eval('.nov .sub', (s) => s.map((e) => e.textContent).join(' | ')), new RegExp(esperados.length + ' jogos ganharam novidades'));
    assert.ok(await pg.$$eval('.nov li a .ic img', (is) => is.every((i) => i.complete && i.naturalWidth > 0)), 'ícones carregados');
    assert.ok(await pg.evaluate(() => document.querySelector('.nov-c').scrollWidth <= document.querySelector('.nov-c').clientWidth + 1), 'nada rola para o lado');
    assert.strictEqual(await pg.$$eval('.card .novo-selo', (s) => s.length), 4, 'selo ✨ Novo nos 4 cartões');
    await pg.click('.nov .ok');
    assert.ok(await pg.$eval('.nov', (e) => e.hidden), 'Legal! fecha');
    await pg.reload(); await pg.waitForSelector('.nov:not([hidden])', { timeout: 3000 }).catch(() => assert.fail('recarregar a estante: a janela tem de aparecer de novo'));
    // voltando de um jogo (🚪 leva para a estante): não pula na frente de novo
    await pg.goto(base + 'campo-minado/?teste'); await pg.waitForTimeout(400);
    await pg.evaluate((u) => { location.href = u; }, base); await pg.waitForLoadState('load'); await pg.waitForTimeout(1500);
    assert.strictEqual(await pg.$('.nov:not([hidden])'), null, 'voltando de um jogo: não aparece');
    // "Não mostrar mais" faz parar de vez
    await pg.goto(base); await pg.waitForSelector('.nov:not([hidden])', { timeout: 3000 });
    assert.match(await pg.textContent('.nov .nunca'), /Não mostrar mais esta mensagem/);
    await pg.click('.nov .nunca');
    await pg.reload(); await pg.waitForTimeout(1500);
    assert.strictEqual(await pg.$('.nov'), null, 'Não mostrar mais: não aparece mais');
    await ctx.close();
    // aparelho com a marca da 1ª versão (o "Legal!" antigo gravava em "bolinho:novidades-vistas"): a janela aparece
    ctx = await contexto(hoje); await ctx.addInitScript(() => localStorage.setItem('bolinho:novidades-vistas', JSON.stringify(['aqua@2026-11-14', 'glub-glub@2026-11-14', 'a-garra@2026-11-14', 'quem-e@2026-11-14'])));
    pg = await ctx.newPage(); await pg.goto(base);
    await pg.waitForSelector('.nov:not([hidden])', { timeout: 3000 }).catch(() => assert.fail('marca antiga não pode esconder a janela'));
    await ctx.close();

    for (const [cod, titulo] of [['en', /New this week/], ['es', /Novedades de la semana/]]) {
      ctx = await contexto(hoje, cod); pg = await ctx.newPage();
      await pg.goto(base); await pg.waitForSelector('.nov:not([hidden])', { timeout: 3000 });
      assert.match(await pg.textContent('#novTitulo'), titulo, cod);
      await ctx.close();
    }
    // na TV: sem janela por cima (só o selo)
    ctx = await contexto(hoje); pg = await ctx.newPage();
    await pg.goto(base + '?tv=auto'); await pg.waitForTimeout(1500);
    assert.strictEqual(await pg.$('.nov'), null, 'TV: sem janela');
    await ctx.close();
    // 8 dias depois do jogo mais novo do catálogo: nada (a data acompanha os jogos que entram depois)
    const w = {}; new Function('window', 'document', fs.readFileSync(path.join(raiz, 'catalogo.js'), 'utf8'))(w, { querySelectorAll: () => [] });
    const datas = w.BolinhoCatalogo.jogos.flatMap((j) => [j.novo, j.atualizado && j.atualizado.data]).filter(Boolean);
    const maisNovo = Math.max(...datas.map((d) => Date.parse(d + 'T10:00:00')));
    ctx = await contexto(maisNovo + 8 * 864e5); pg = await ctx.newPage();
    await pg.goto(base); await pg.waitForTimeout(1500);
    assert.strictEqual(!!(await pg.$('.nov')), false, 'sem novidades depois de 7 dias');
    assert.strictEqual(await pg.$$eval('.card .novo-selo', (s) => s.length), 0, 'sem selo depois de 7 dias');
    await ctx.close();
  } finally { await b.close(); srv.close(); }
});
