'use strict';

var Config = require('../config');
var bullet = []; // Снаряды

exports.add = function(id,x,y,angle,damage) {
  bullet.unshift({
    x: x+36*Math.cos(angle),
    y: y+36*Math.sin(angle),
    life: 1.5,
    angle: angle,
    damage: damage,
    user: id
  });
}
exports.move = function(delta) {
  for(var bi = 0; bi < bullet.length; bi++) {
    // Передвижение снаряда на величину скорости
    bullet[bi].x +=delta*Config.BULLET_SPEED*Math.cos(bullet[bi].angle);
    bullet[bi].y +=delta*Config.BULLET_SPEED*Math.sin(bullet[bi].angle);
    bullet[bi].life -=delta;
    if(bullet[bi].life < 0) bullet.splice(bi, 1);
  }
}

exports.remove = function(id) {
  bullet.splice(id, 1);
}

exports.getList = function() {
  return bullet;
}
