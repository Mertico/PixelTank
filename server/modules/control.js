'use strict';

var control = [];
// Изменение управления игрока по ид пользователя
exports.update = function(id, data) {
  control[id]={
    move: data[0],
    rotate: data[1],
    angle: data[2],
    fire: data[3]
  };
}

// Добавление управления игрока по ид пользователя
exports.add = function(id) {
  control[id]={
    move: 0,
    rotate: 0,
    angle: 0,
    fire: false
  };
}

// Удаление управления игрока по ид пользователя
exports.remove = function(id) {
  delete control[id];
}

// Вывод управления
exports.get = function(id) {
  return control[id];
}
