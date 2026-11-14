/* Quem é? — os nomes das caras do Duelo de Caras (pedido do dono, 14/Nov/2026: nomes sorteados, bem sortidos e
   equilibrados entre menino e menina). Só primeiro nome, nada de sobrenome nem de gente famosa.
   Tem nome comum, antigo (de vovô e vovó), moderno, curto e comprido. O logica.js sorteia daqui, sem repetir no
   tabuleiro. Nome novo = mais um item na lista certa (o teste confere que não repete e que não está nas duas). */
(function (raiz) {
  'use strict';
  var MASCULINOS = [
    'Adalberto', 'Afonso', 'Alceu', 'Antônio', 'Armando', 'Arthur', 'Augusto', 'Benedito', 'Bento', 'Bernardo',
    'Breno', 'Bruno', 'Caio', 'Calebe', 'Carlos', 'Cauã', 'Cícero', 'Cláudio', 'Daniel', 'Danilo',
    'Davi', 'Diego', 'Dionísio', 'Edgar', 'Edson', 'Eduardo', 'Elias', 'Emanuel', 'Enzo', 'Erasmo',
    'Fábio', 'Felipe', 'Fernando', 'Francisco', 'Gabriel', 'Gael', 'Geraldo', 'Gilberto', 'Guilherme', 'Gustavo',
    'Heitor', 'Henrique', 'Hugo', 'Igor', 'Isaac', 'Ivan', 'Jaime', 'Joaquim', 'Jorge', 'José',
    'Juca', 'Júlio', 'Kauê', 'Leandro', 'Leonardo', 'Lorenzo', 'Lucas', 'Luiz', 'Marcelo', 'Mário',
    'Mateus', 'Miguel', 'Murilo', 'Nicolas', 'Noah', 'Oscar', 'Otávio', 'Pedro', 'Raul', 'Renato',
    'Ricardo', 'Rodrigo', 'Rui', 'Samuel', 'Sebastião', 'Sérgio', 'Teodoro', 'Theo', 'Tomás', 'Valdir',
    'Vicente', 'Vítor', 'Waldemar', 'Wagner', 'Yuri', 'Zeca'
  ];
  var FEMININOS = [
    'Adélia', 'Alice', 'Amanda', 'Ana', 'Antônia', 'Aurora', 'Beatriz', 'Benedita', 'Bianca', 'Bruna',
    'Camila', 'Carla', 'Carolina', 'Catarina', 'Cecília', 'Clara', 'Cláudia', 'Cleide', 'Dalva', 'Daniela',
    'Débora', 'Dirce', 'Dolores', 'Edite', 'Elisa', 'Eloá', 'Emília', 'Ester', 'Eva', 'Fernanda',
    'Flávia', 'Gabriela', 'Giovana', 'Glória', 'Helena', 'Heloísa', 'Iara', 'Ingrid', 'Irene', 'Isabela',
    'Isadora', 'Jade', 'Joana', 'Júlia', 'Jussara', 'Larissa', 'Laura', 'Lia', 'Lívia', 'Lorena',
    'Luana', 'Luíza', 'Madalena', 'Maitê', 'Manuela', 'Marina', 'Marta', 'Melissa', 'Mirela', 'Nair',
    'Natália', 'Nina', 'Odete', 'Olívia', 'Paula', 'Pietra', 'Rafaela', 'Rita', 'Rosa', 'Sabrina',
    'Sara', 'Sofia', 'Sônia', 'Tereza', 'Valentina', 'Vera', 'Vitória', 'Yasmin', 'Zélia', 'Zuleica'
  ];
  var N = { MASCULINOS: MASCULINOS, FEMININOS: FEMININOS };
  raiz.QENomes = N;
  if (typeof module === 'object' && module.exports) module.exports = N;
})(typeof window !== 'undefined' ? window : globalThis);
