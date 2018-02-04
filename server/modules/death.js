'use strict';

var death = [];

// Добавление смерти
exports.add = function(id_kill, id_death) {
  death[death.length]=[id_kill, id_death];
}

// Вывод статистики
exports.get = function() {
  let tmp = death;
  death = [];
  return tmp;
}
