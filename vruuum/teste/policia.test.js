// Viatura e moto de polícia (1.38.0, dono: "carro e moto de polícia com sirene vermelha e azul piscando").
// node --test vruuum/teste/policia.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const V = require('../veiculos.js');
const M3 = require('../modelos3d.js');

// "tela" de mentira: guarda as cores dos brilhos (luzinha) acesos em cada quadro
function luzesAcesas(id, fase, t) {
  const cores = [];
  const grad = { addColorStop: (o, c) => { if (o === 0) cores.push(c); } };
  const c = new Proxy({}, { get: (o, k) => k in o ? o[k] : (k === 'createRadialGradient' || k === 'createLinearGradient' ? () => grad : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  M3.vivo(c, id, 0, 0, 800, 1100, '#3a5bd9', fase, 0, 0, t == null ? {} : { t });
  return { azul: cores.includes('#1f7bff'), vermelho: cores.includes('#ff2a2a') };
}

test('estão na garagem: viatura com os carros, moto com as motos, nome nos três idiomas e sirene na buzina', () => {
  const car = V.achar('policia'), moto = V.achar('motopolicia');
  assert.equal(car.grupo, 'terra'); assert.equal(moto.grupo, 'moto');
  for (const v of [car, moto]) {
    assert.ok(v.nome.every(n => /Pol/i.test(n)), v.id);
    assert.equal(v.voz, 'sirene', v.id);
    assert.ok(v.quadros >= 8, v.id + ': quadros para a sirene piscar também nos rivais');
    assert.ok(M3.MODELOS[v.id], v.id);
  }
  assert.ok(moto.capacete);
});

for (const id of ['policia', 'motopolicia']) {
  test(id + ': a sirene pisca sempre, azul e vermelho se revezando (um aceso por vez, nunca os dois), nos quadros e no relógio', () => {
    let azul = 0, verm = 0;
    for (let k = 0; k < 8; k++) {
      const l = luzesAcesas(id, k / 8);
      assert.ok(l.azul !== l.vermelho, 'quadro ' + k + ': tem que ter exatamente um lado aceso');
      azul += l.azul; verm += l.vermelho;
    }
    assert.equal(azul, 4); assert.equal(verm, 4);
    const viu = new Set();
    for (let t = 0; t < 1.5; t += 0.05) { const l = luzesAcesas(id, 0.3, t); assert.ok(l.azul !== l.vermelho, 't=' + t); viu.add(l.azul ? 'a' : 'v'); }
    assert.deepEqual([...viu].sort(), ['a', 'v'], 'com o relógio da corrida também pisca');
  });
}

test('1.38.0: Van Verde de Passeio (com os carros) e Bolha Gigante (com as motos), sem motor de carro na bolha', () => {
  const van = V.achar('van'), b = V.achar('bolha');
  assert.equal(van.grupo, 'terra'); assert.equal(b.grupo, 'moto');
  assert.ok(b.semMotor && !V.voa('bolha'));
  assert.ok(b.quadros >= 8, 'quadros dos passos dentro da bola');
  for (const v of [van, b]) assert.ok(v.nome.every(n => n.length > 3), v.id);
  // a bola rola: as costuras mudam com o tempo
  const linhas = t => { const pts = []; const c = new Proxy({}, { get: (o, k) => k in o ? o[k] : (k === 'lineTo' ? (x, y) => pts.push(Math.round(x) + ',' + Math.round(y)) : k.startsWith('create') ? () => ({ addColorStop() {} }) : () => {}), set: (o, k, v) => { o[k] = v; return true; } }); M3.vivo(c, 'bolha', 0, 0, 900, 1000, '#ff4fa3', 0.2, 0, 0, { t }); return pts.join(' '); };
  assert.notEqual(linhas(0), linhas(0.3));
});

test('1.38.0: palhaço de bicicleta pedala sem parar (pernas e pedais mudam com o relógio, mesmo parado na fase)', () => {
  const v = V.achar('palhaco');
  assert.equal(v.grupo, 'moto'); assert.ok(v.semPiloto && v.semMotor); assert.equal(v.voz, 'fonfom');
  const quadro = t => { const pts = []; const c = new Proxy({}, { get: (o, k) => k in o ? o[k] : (k === 'lineTo' || k === 'moveTo' ? (x, y) => pts.push(Math.round(x) + ',' + Math.round(y)) : k.startsWith('create') ? () => ({ addColorStop() {} }) : () => {}), set: (o, k, v) => { o[k] = v; return true; } }); M3.vivo(c, 'palhaco', 0, 0, 600, 1100, '#ff4fa3', 0.5, 0, 0, { t }); return pts.join(' '); };
  assert.notEqual(quadro(0), quadro(0.2)); assert.notEqual(quadro(0.2), quadro(0.4));
});
