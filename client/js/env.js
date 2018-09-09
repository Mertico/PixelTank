'use strict';

var Data = {
  playerName: null,// Логин игрока
  playerTank: null,// Выбраный танк игрока
  tank: null, // Параметры танков
  scale: 1, // Коэффицент масштабирования (0.5 - 1.4)
  fps: 60,
  server: {
    death:[],
    bullets:[],
    users:[],
    stats:[],
    id:0
  }, // connect
  BULLET_SPEED: null, // Скорость полета снаряда

  /*
  Область видимости выглядит так
  @ ====
  |  с  |
  ==== #
  */
  vision: {
    start: {  // @ - Верхний левый угол
      x: 0,
      y: 0
    },
    center: { // с - Центр
      x: 0,
      y: 0
    },
    end: { // # - правый нижний
      x: 0,
      y: 0
    }
  },

  // передаем нажатие мыши и клавиатуры
  control: {
    mouse: {
      x: 0, // положение мыши по x
      y: 0, // положение мыши по y
      down: false, // Нажата ли кнопка
      angle: 0 // На какой угол от центра находиться указатель
    },
    key: {
      w: false, // ↑
      s: false, // ↓
      a: false, // ←
      d: false, // →
      q: false  // Stats vision
    }
  }
}
