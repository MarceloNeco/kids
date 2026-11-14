/* Gera biblioteca-musicas.js (raiz): todas as músicas gravadas dos jogos e da rádio, com nome, autor e licença,
   para a 🎵 Biblioteca de músicas da estante (pedido do dono, 14/Nov/2026).
   - Quais músicas: as listas que cada jogo toca (teste/listas-musica.js, as mesmas do vigia da regra da música).
   - Nome, autor e licença: dos CREDITOS.md (da estante e de cada jogo). Sem crédito achado: nome tirado do arquivo.
   Rodar da raiz do repositório depois de mudar a música de algum jogo:  node ferramentas/biblioteca-musicas.js
   O vigia teste/biblioteca-musicas.test.js avisa quando a biblioteca ficou desatualizada. */
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const LISTAS = require('../teste/listas-musica.js');

const AUTORES = /(Kevin MacLeod|Weirwood|Kalsan|ALBatross|Rafael Krux|Bryan Teoh|Alexander Nakarada|HoliznaCC0|Holizna|Anthem of Rain|Komiku|Lobo Loco|Loyalty Freak Music|John Bartmann|Jason Shaw|Brian Boyko|Scott Holmes|Monplaisir|Ketsa|Tri-Tachyon)/i;
function creditos() {
  const lista = [];
  for (const d of fs.readdirSync(raiz)) {
    const m = path.join(raiz, d, 'musicas');
    if (fs.existsSync(m) && fs.statSync(m).isDirectory()) for (const f of fs.readdirSync(m)) if (/\.md$/.test(f)) lista.push(path.join(d, 'musicas', f));
  }
  lista.push('CREDITOS.md');
  for (const d of fs.readdirSync(raiz)) if (fs.existsSync(path.join(raiz, d, 'CREDITOS.md'))) lista.push(path.join(d, 'CREDITOS.md'));
  const linhas = {};   // arquivo.mp3 → [{ linha, titulo }] na ordem: licenças das pastas de música primeiro
  for (const f of lista) {
    let titulo = '';
    for (const linha of fs.readFileSync(path.join(raiz, f), 'utf8').split('\n')) {
      if (/^#{2,4} /.test(linha)) { titulo = linha.replace(/^#+ /, ''); continue; }
      for (const m of linha.matchAll(/([a-z0-9][a-z0-9_-]*\.mp3)/gi)) (linhas[m[1]] = linhas[m[1]] || []).push({ linha, titulo });
    }
  }
  const mapa = {};
  for (const [arq, ls] of Object.entries(linhas)) {
    let t = '', au = '', lic = '';
    for (const { linha, titulo } of ls) {
      const esc = arq.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!t) { const q = linha.match(/[“"]([^”"]{2,80})[”"]/); if (q && linha.split('|').filter((c) => c.includes(arq) || c.includes(q[1])).length <= 2) t = q[1]; }
      if (!t) { const pr = linha.match(new RegExp('([A-Z][^(:;`|*]{1,60}?)\\s*\\(`[^`]*' + esc + '`\\)')); if (pr) t = pr[1].replace(/^.*?(?:e|,)\s+(?=[A-Z])/, ''); }
      if (!t) {
        const cols = linha.split('|').map((c) => c.trim()).filter(Boolean);
        const c = cols.find((x) => !x.includes(arq) && !/`|https?:|CC0|CC BY|licen|domínio|FreePD|incompetech|^\d|MP3|kbps/i.test(x) && !AUTORES.test(x) && x.length < 60 && /[A-Za-z]/.test(x));
        if (c && cols.length >= 2) t = c.replace(/[*]/g, '');
      }
      if (!au) { const m = linha.match(AUTORES) || titulo.match(AUTORES); if (m) au = m[1]; }
      if (!lic) {
        const x = linha + ' ' + titulo;
        if (/CC0|domínio público|public domain/i.test(x)) lic = 'CC0';
        else if (/BY[- ]?SA 3\.0/i.test(x)) lic = 'CC BY-SA 3.0';
        else if (/BY[- ]?SA/i.test(x)) lic = 'CC BY-SA 4.0';
        else if (/Attribution|CC BY/i.test(x)) lic = 'CC BY 4.0';
      }
    }
    if (/^Holizna$/i.test(au)) au = 'HoliznaCC0';
    if (/^Kevin Macleod$/i.test(au)) au = 'Kevin MacLeod';
    t = t.replace(/\s*\((?:do mesmo|gravação|cortad|versão)[^)]*\)/i, '').replace(/Gymnopedie No 1 \(Erik Satie, gravação de Kevin MacLeod\)/, 'Gymnopédie No. 1 (Erik Satie)');
    mapa[arq] = { t: t.trim(), au, lic };
  }
  return mapa;
}
const humano = (arq) => arq.replace(/\.mp3$/, '').replace(/^abertura-/, '').split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

function gerar() {
  const C = creditos();
  const json = JSON.parse(fs.readFileSync(path.join(raiz, 'peluqueria/musicas/musicas.json'), 'utf8'));
  for (const m of json) C[m.arquivo] = { t: m.titulo, au: m.autor, lic: m.licenca };
  const jogos = Object.entries(LISTAS).map(([id, f]) => ({
    id,
    musicas: f().map((rel) => {
      const arq = path.basename(rel), c = C[arq] || {};
      return { a: '/kids/' + rel, t: c.t || humano(arq), au: c.au || '', lic: c.lic || '' };
    })
  }));
  return '/* Biblioteca de músicas do Bolinho de Chuva — GERADO por ferramentas/biblioteca-musicas.js (não editar à mão).\n' +
    '   Todas as músicas gravadas que os jogos e a rádio da estante tocam, com nome, autor e licença. */\n' +
    'window.BolinhoBiblioteca = ' + JSON.stringify({ jogos }, null, 1).replace(/\n\s*/g, ' ').replace(/\{ "id"/g, '\n  { "id"') + ';\n';
}
module.exports = gerar;
if (require.main === module) { fs.writeFileSync(path.join(raiz, 'biblioteca-musicas.js'), gerar()); console.log('biblioteca-musicas.js gerado'); }
