// Lista de músicas de cada jogo (e da rádio da estante), lida do código de cada um.
// Usada pelo vigia da regra da música e pelo gerador da biblioteca de músicas (ferramentas/biblioteca-musicas.js).
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const ler = (f) => fs.readFileSync(path.join(raiz, f), 'utf8');
const LISTAS = {
  estante: () => [...ler('radio.js').matchAll(/a: '([a-z0-9-]+)'/g)].map(m => 'musicas/' + m[1] + '.mp3'),
  baguncolandia: () => { const s = ler('baguncolandia/som.js'); return [...s.slice(s.indexOf('var TRILHA'), s.indexOf('sorteou = false')).matchAll(/'([a-z0-9-]+)'/g)].map(m => 'baguncolandia/musicas/' + m[1] + '.mp3'); },
  peluqueria: () => JSON.parse(ler('peluqueria/musicas/musicas.json')).map(m => 'peluqueria/musicas/' + m.arquivo),
  vruuum: () => [...ler('vruuum/som.js').matchAll(/url: '(musicas\/[^']+\.mp3)'/g)].map(m => 'vruuum/' + m[1]),
  purpurina: () => [...ler('purpurina/som.js').matchAll(/url: '(musicas\/[^']+\.mp3)'/g)].map(m => 'purpurina/' + m[1]),
  rabiscolandia: () => [...ler('rabiscolandia/som.js').matchAll(/gr\('([a-z0-9-]+)'/g)].map(m => 'rabiscolandia/musicas/' + m[1] + '.mp3'),
  'campo-minado': () => [...ler('campo-minado/app.js').matchAll(/M \+ '([a-z0-9-]+\.mp3)'/g)].map(m => 'rabiscolandia/musicas/' + m[1]),
  'batalha-naval': () => { const s = ler('batalha-naval/app.js'); return [...s.slice(s.indexOf('var MUSICAS'), s.indexOf('].map(function (m)')).matchAll(/\['([a-z0-9-]+)'/g)].map(m => 'vruuum/musicas/' + m[1] + '.mp3'); },
  labirinto: () => [...ler('labirinto/app.js').matchAll(/a: '\.\.\/([^']+\.mp3)'/g)].map(m => m[1]),
  'a-garra': () => [...ler('a-garra/app.js').matchAll(/a: '\.\.\/([^']+\.mp3)'/g)].map(m => m[1]),
  'quem-e': () => [...ler('quem-e/app.js').matchAll(/a: '\.\.\/([^']+\.mp3)'/g)].map(m => m[1]),
  cozinha: () => [...ler('cozinha/app.js').matchAll(/a: ([MB]) \+ '([a-z0-9-]+\.mp3)'/g)].map(m => (m[1] === 'M' ? 'rabiscolandia' : 'baguncolandia') + '/musicas/' + m[2]),
  aqua: () => [...ler('aqua/app.js').matchAll(/a: M_ \+ '([a-z0-9-]+\.mp3)'/g)].map(m => 'purpurina/musicas/' + m[1]),
  enigmas: () => [...ler('enigmas/app.js').matchAll(/a: M \+ '([a-z0-9-]+\.mp3)'/g)].map(m => 'baguncolandia/musicas/' + m[1]),
  'glub-glub': () => [...ler('glub-glub/app.js').matchAll(/a: (?:(B|RB) \+ )?'([^']+\.mp3)'/g)].map(m => (m[1] === 'B' ? 'baguncolandia/musicas/' : m[1] === 'RB' ? 'rabiscolandia/musicas/' : '') + m[2].replace(/^\.\.\//, ''))
};
module.exports = LISTAS;
