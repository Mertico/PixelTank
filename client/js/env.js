'use strict';
/// Player select
// Данные получение со страницы входа
var PlayerName; // Логин игрока
var PlayerTank; // Выбраный танк игрока

// Scale
var scale=1; // Коэффицент масштабирования (0.5 - 1.4)

// GameLoop
var fps = 60;

// Connect
var server;
var BULLET_SPEED;

// Видимость
/*
Область видимости выглядит так
@ ====
|  с  |
 ==== #
*/
var vision = {
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
};

// Параметры танков
var tank;

/// Control

// передаем нажатие мыши и клавиатуры
var control={
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
};
console.log(SVG);
