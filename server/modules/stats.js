'use strict';

var stats = [];
// Изменение статистики игрока по ид пользователя
exports.update = function(id_kill, id_death) {
  for(var i = 0, l = stats.length; i < l; i++) {
    if (stats[i].id == id_kill)
      stats[i].kill++;
    if (stats[i].id == id_death)
      stats[i].death++;
  }
}

// Добавление статистики игрока по ид пользователя
exports.add = function(id) {
  stats.unshift({
    id: id,
    kill: 0,
    death: 0
  });
}

// Удаление статистики игрока по ид пользователя
exports.remove = function(id) {
  for(var i = 0; i < stats.length; i++) {
    if (id == stats[i].id)
    stats.splice(i, 1);
  }
}

// Вывод статистики
exports.get = function() {
  return stats;
}
