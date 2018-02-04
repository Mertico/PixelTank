'use strict';

var config = {
  FPS: 60, // Частота обновлений в секунду
  FPS_send: 21, // Частота отправки обновлений в секунду
  BULLET_SPEED: 900,
  tank: {
    light: {
      hp: 180, // текущее хп
      max_speed: 400, // Макс. скорость
      acceleration: 185, // Скорость разгона (px/sec)
      reload: 0.35, // Период между выстрелами (в секундах)
      damage: 55, // Урон наносимый снарядом
      chassis: {
        angle: 96 // Скорость поворота шасси (в градусах)
      },
      turret: {
        angle: 180 // Скорость башни шасси (в градусах)
      }
    },
    medium: {
      hp: 275,
      max_speed: 310,
      acceleration: 160,
      reload: 0.68,
      damage: 85,
      chassis: {
        angle: 68
      },
      turret: {
        angle: 150
      }
    },
    heavy: {
      hp: 640,
      max_speed: 235,
      acceleration: 110,
      reload: 1.12,
      damage: 125,
      chassis: {
        angle: 48
      },
      turret: {
        angle: 120
      }
    }
  }
};

module.exports = config;

module.exports.getTank = function(tank) {
  return config.tank[tank];
}
