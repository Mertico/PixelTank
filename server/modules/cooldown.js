'use strict';

var cd = [];

setInterval(function () {
  for(var i = 0; i < cd.length; i++) {
    cd[i].time-=1/30;
    if(cd[i].time <= 0) cd.splice(i, 1);
  }
}, 1000/30);

// Добавление статистики игрока по ид пользователя
exports.add = function(id, time) {
  cd.unshift({
    id,
    time
  });
}

// Вывод перезарядки
exports.get = function(id) {
  for(var i = 0, l = cd.length; i < l; i++) {
    if(cd[i].id == id) {
      return false;
      break;
    }
  }
  return true;
}
