// Folha de conferência das caras (não faz parte do jogo): ?s=semente&n=nivel
var q = new URLSearchParams(location.search), t = QELogica.gerarTabuleiro(+(q.get('s') || 7), q.get('n') || 'dificil');
t.caras.forEach(function (c) { var d = document.createElement('div'); d.innerHTML = QECaras.svg(c, { id: 'k' + c.id }) + c.nome; document.getElementById('g').appendChild(d); });
t.caras.slice(0, 4).forEach(function (c) { var d = document.createElement('div'); d.innerHTML = QECaras.svg(c, { id: 'g' + c.id, grande: true }); document.getElementById('b').appendChild(d); });
