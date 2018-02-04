'use strict';

var Config = require('../config');
var Physics = require('./physics');
var Control = require('./control');
var Bullet = require('./bullet');
var Cooldown = require('./cooldown');
var users = [];

exports.add = function(id,name,tank) {
  switch(tank) {
    case 'heavy':
      break;
    case 'medium':
      break;
    case 'light':
      break;
    default:
      tank=(Math.random() > .66) ? 'heavy' : (Math.random() > .5) ? 'light' : 'medium';
      break;
  }
  if (name == '') {
    name="NONAME";
  }
  let x = getRandomInt(-2000, 2000);
  let y = getRandomInt(-2000, 2000);
  users.unshift({
    x : x,
    y : y,
    speed : 0,
    turret : {
      angle: -Math.PI/2
    },
    chassis : {
      angle: -Math.PI/2
    },
    hp : Config.tank[tank].hp,
    tank : tank,
    name : name,// заготовка для ника
    id : id
  });
  Physics.addTank(id,tank,x,y,-Math.PI/2);
}

exports.move = function(delta) {
  for(var ui = 0; ui < users.length; ui++) {
    // Обновление данных о направление орудия
    users[ui].turret.angle = RotateTurret(users[ui].turret.angle,Control.get(users[ui].id).angle,(delta*Config.getTank(users[ui].tank).turret.angle*Math.PI/180));

    // Вычисление изменений скорости
    if(Control.get(users[ui].id).move == 1) {
      users[ui].speed += (delta*Config.getTank(users[ui].tank).acceleration*ac(users[ui].speed,Config.getTank(users[ui].tank).max_speed));
      if (users[ui].speed > Config.getTank(users[ui].tank).max_speed) users[ui].speed = Config.getTank(users[ui].tank).max_speed;
    }
    if(Control.get(users[ui].id).move == -1) {
      users[ui].speed -= (delta*Config.getTank(users[ui].tank).acceleration*0.6*ac(users[ui].speed,Config.getTank(users[ui].tank).max_speed));
      if (users[ui].speed < -Config.getTank(users[ui].tank).max_speed*0.3) users[ui].speed = -Config.getTank(users[ui].tank).max_speed*0.3;
    }
    if(Control.get(users[ui].id).move == 0) {
      if (users[ui].speed < 10 && users[ui].speed > -10) {
        users[ui].speed = 0;
      }
      if (users[ui].speed <= -10) {
        users[ui].speed += (delta*Config.getTank(users[ui].tank).acceleration*3*ac(users[ui].speed,users[ui].max_speed));
      }
      if (users[ui].speed >= 10) {
        users[ui].speed -= (delta*Config.getTank(users[ui].tank).acceleration*3*ac(users[ui].speed,users[ui].max_speed));
      }
    }

    // Поворот танка
    let angleTank = 0;
    if(Control.get(users[ui].id).rotate == -1) angleTank -=Config.getTank(users[ui].tank).chassis.angle*Math.PI/180*ac(users[ui].speed,Config.getTank(users[ui].tank).max_speed);
    if(Control.get(users[ui].id).rotate == 1) angleTank +=Config.getTank(users[ui].tank).chassis.angle*Math.PI/180*ac(users[ui].speed,Config.getTank(users[ui].tank).max_speed);

    Physics.updateTankAngle(users[ui].id, angleTank);

    // Передвижение танка на величину скорости
    Physics.updateTankSpeed(users[ui].id,users[ui].speed);
  }
}

exports.physics = function() {
  // Считывание данных с физ. мира
  for(var ui = 0, ul = users.length; ui < ul; ui++) {
    let tmp = Physics.getTank(users[ui].id);
    users[ui].x = tmp.position[0];
    users[ui].y = tmp.position[1];
    users[ui].chassis.angle = tmp.angle;
    users[ui].speed = tmp.velocity[0]*Math.cos(tmp.angle)+tmp.velocity[1]*Math.sin(tmp.angle);
  }
}


exports.fire = function() {
  // Стрельба
  for(var ui = 0, ul = users.length; ui < ul; ui++) {
    if(Control.get(users[ui].id).fire) {
      // Проверка возможности стрельбы
      if(Cooldown.get(users[ui].id)) {
        // Включение блокировки на стрельбу (перезарядка)
        Cooldown.add(users[ui].id, Config.getTank(users[ui].tank).reload);
        // Добавление снаряда
        Bullet.add(users[ui].id,users[ui].x,users[ui].y,users[ui].turret.angle,Config.getTank(users[ui].tank).damage);
      }
    }
  }
}

exports.remove = function(id) {
  Physics.removeTank(users[id].id);
  users.splice(id, 1);
}

exports.getList = function() {
  return users;
}

// Функция плавного поворота на угол angle со скоростью speed
function RotateTurret(ta,ma,s) {
  if (ta < 0)
    ta = ta + 2*Math.PI;

  let a = ta - ma;

  if (a > Math.PI)
    a = a - 2*Math.PI;
  else if (a < -Math.PI)
    a = a + 2*Math.PI;

  if (a >= -s && a <= s)
    ta = ma;
  else if (a > s)
    ta = ta - s;
  else if (a < -s)
    ta = ta + s;
return ta;
}

function ac(speed, max_speed=120) {
  //(2+x^0.1)/(2+x^0.3) (x from 0 to 100)
  // получаем коэффицент скорости разворота
  // перемножаем на скорость поворота танка
  return (1+Math.pow((Math.abs(speed)/max_speed)*10,0.1))/(1+Math.pow((Math.abs(speed)/max_speed)*10,0.3));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
