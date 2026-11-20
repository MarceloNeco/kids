/* H-rraaa (pasta a-garra) — a máquina de Festas (dono, 19/Nov/2026: "um temático que muda de acordo com a época do ano").
   O calendário decide a festa do dia, e o ano inteiro tem uma:
     natal      1º/nov até 6/jan (Dia de Reis)
     carnaval   7/jan até a Quarta-feira de Cinzas
     pascoa     depois das Cinzas até uma semana depois da Páscoa (no mínimo até 30/abr)
     junina     depois disso até 15/ago (arraiá de junho, julho e agosto)
     criancas   16/ago até 12/out (Dia das Crianças)
     bruxas     13/out até 31/out (Dia das Bruxas)
   A Páscoa muda todo ano: a conta é a de sempre (Meeus/Jones/Butcher). Com ?festa=natal (etc.) na barra de endereço,
   a máquina usa aquela festa (para testar e para mostrar a festa que ainda vai chegar).
   Sem desenho: roda no navegador (window.Festas) e no Node (testes em teste/festas.test.js). Os prêmios em 3D de cada festa
   estão no premios3d.js; os nomes dos prêmios, no NOMES de lá. */
(function (raiz) {
  'use strict';
  var LISTA = {
    natal: { nome: ['Natal', 'Christmas', 'Navidad'], ico: '🎄🎅', ola: ['Feliz Natal!', 'Merry Christmas!', '¡Feliz Navidad!'],
      tipos: ['papai-noel', 'boneco-neve', 'rena', 'presente', 'arvore-natal', 'biscoito'], raro: 'papai-noel-dourado' },
    carnaval: { nome: ['Carnaval', 'Carnival', 'Carnaval'], ico: '🎭🎉', ola: ['É Carnaval!', "It's Carnival!", '¡Es Carnaval!'],
      tipos: ['mascara', 'pandeiro', 'palhaco', 'coroa', 'arara', 'chocalho'], raro: 'mascara-dourada' },
    pascoa: { nome: ['Páscoa', 'Easter', 'Pascua'], ico: '🐰🥚', ola: ['Feliz Páscoa!', 'Happy Easter!', '¡Feliz Pascua!'],
      tipos: ['coelho-pascoa', 'ovo-pascoa', 'ovo-chocolate', 'pintinho-casca', 'cenoura', 'cesta'], raro: 'ovo-pascoa-dourado' },
    junina: { nome: ['Festa Junina', 'June Festival', 'Fiesta de San Juan'], ico: '🌽🔥', ola: ['Olha o arraiá!', "It's party time!", '¡Llega la verbena!'],
      tipos: ['milho', 'chapeu-palha', 'fogueira', 'pipoca', 'sanfona', 'maca-do-amor'], raro: 'milho-dourado' },
    criancas: { nome: ['Dia das Crianças', "Children's Day", 'Día del Niño'], ico: '🪀🎈', ola: ['Viva o Dia das Crianças!', "Happy Children's Day!", '¡Feliz Día del Niño!'],
      tipos: ['piao', 'bola', 'ioio', 'carrinho', 'pirulito', 'robo'], raro: 'robo-dourado' },
    bruxas: { nome: ['Dia das Bruxas', 'Halloween', 'Halloween'], ico: '🎃👻', ola: ['Gostosuras ou travessuras!', 'Trick or treat!', '¡Truco o trato!'],
      tipos: ['abobora', 'fantasma', 'morcego', 'gato-preto', 'chapeu-bruxa', 'aranha'], raro: 'abobora-dourada' }
  };
  var ORDEM = ['natal', 'carnaval', 'pascoa', 'junina', 'criancas', 'bruxas'];

  function dia(a, m, d) { return Date.UTC(a, m, d) / 864e5; }   // número do dia (sem hora nem horário de verão)
  function pascoa(a) {   // domingo de Páscoa do ano a: { m (0 = janeiro), d }
    var A = a % 19, b = Math.floor(a / 100), c = a % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    var h = (19 * A + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, mm = Math.floor((A + 11 * h + 22 * l) / 451);
    var mes = Math.floor((h + l - 7 * mm + 114) / 31), dd = ((h + l - 7 * mm + 114) % 31) + 1;
    return { m: mes - 1, d: dd };
  }
  // a festa de uma data (Date, no fuso do aparelho)
  function festaDe(data) {
    var a = data.getFullYear(), m = data.getMonth(), d = data.getDate(), n = dia(a, m, d);
    if (m >= 10 || (m === 0 && d <= 6)) return 'natal';
    var p = pascoa(a), np = dia(a, p.m, p.d);
    if (n <= np - 46) return 'carnaval';
    if (n <= Math.max(np + 7, dia(a, 3, 30))) return 'pascoa';
    if (n <= dia(a, 7, 15)) return 'junina';
    if (n <= dia(a, 9, 12)) return 'criancas';
    return 'bruxas';
  }
  // a festa de agora: a da barra de endereço (?festa=), senão a do calendário
  function atual(busca, agora) {
    var f = ((busca || '').match(/[?&]festa=([a-z]+)/) || [])[1];
    return LISTA[f] ? f : festaDe(agora || new Date());
  }
  // todos os prêmios de todas as festas, na ordem do ano (a coleção mostra todos: o ano inteiro para completar)
  function todos() { var r = []; ORDEM.forEach(function (f) { r = r.concat(LISTA[f].tipos, [LISTA[f].raro]); }); return r; }

  var F = { LISTA: LISTA, ORDEM: ORDEM, festaDe: festaDe, atual: atual, todos: todos, pascoa: pascoa };
  if (typeof module !== 'undefined' && module.exports) module.exports = F; else raiz.Festas = F;
})(typeof self !== 'undefined' ? self : this);
