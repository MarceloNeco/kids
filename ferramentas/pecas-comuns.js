// Impressão digital das peças comuns da raiz que os jogos guardam no aparelho (../idioma.js, ../navegacao.js, …).
// Fica em PECAS, no sw-comum.js: mudou uma peça comum, rode este arquivo na raiz do repositório
//     node ferramentas/pecas-comuns.js
// e todos os jogos baixam a versão nova inteira (o navegador vê que o sw-comum.js mudou). Vigia: teste/sw-jogos.test.js.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const raiz = path.join(__dirname, '..');

// ARQUIVOS de cada jogo (lê o sw.js como o navegador, sem rodar o service worker de verdade)
function arquivosDe(jogo) {
  const sb = { self: { addEventListener() {}, registration: { scope: 'https://x/kids/' + jogo + '/' }, navigator: {} },
    caches: {}, fetch() {}, URL, location: { origin: 'https://x' }, Promise, Request: function () {}, Response: function () {},
    importScripts() {}, BolinhoSW() { return 'teste'; } };
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(raiz, jogo, 'sw.js'), 'utf8'), sb);
  return sb.ARQUIVOS;
}
function jogos() {
  return fs.readdirSync(raiz).filter((g) => fs.existsSync(path.join(raiz, g, 'sw.js')) && fs.existsSync(path.join(raiz, g, 'app.js'))).sort();
}
// as peças de fora da pasta do jogo (../algo), uma vez cada
function pecas() {
  const s = new Set();
  for (const g of jogos()) for (const a of arquivosDe(g)) if (a.startsWith('../')) s.add(path.posix.normalize(g + '/' + a));
  return [...s].sort();
}
function impressao() {
  const h = crypto.createHash('sha1');
  for (const p of pecas()) { h.update(p + '\n'); h.update(fs.readFileSync(path.join(raiz, p))); }
  return h.digest('hex').slice(0, 10);
}
module.exports = { impressao, pecas, jogos, arquivosDe };
if (require.main === module) {
  const f = path.join(raiz, 'sw-comum.js'), txt = fs.readFileSync(f, 'utf8'), nova = impressao();
  fs.writeFileSync(f, txt.replace(/^var PECAS = '[^']*';/m, "var PECAS = '" + nova + "';"));
  console.log('PECAS = ' + nova + ' (' + pecas().length + ' peças comuns)');
}
