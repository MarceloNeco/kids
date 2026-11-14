// Folha de conferência das caras (não faz parte do jogo): ?s=semente&n=nivel&corpo=1
var q = new URLSearchParams(location.search), corpo = q.get('corpo') === '1', t = QELogica.gerarTabuleiro(+(q.get('s') || 7), q.get('n') || 'dificil', { corpo: corpo });
t.caras.forEach(function (c) { var d = document.createElement('div'); d.innerHTML = QECaras.svg(c, { id: 'k' + c.id, corpo: corpo }) + c.nome; document.getElementById('g').appendChild(d); });
t.caras.slice(0, 4).forEach(function (c) { var d = document.createElement('div'); d.innerHTML = QECaras.svg(c, { id: 'g' + c.id, grande: true, corpo: corpo }); document.getElementById('b').appendChild(d); });
