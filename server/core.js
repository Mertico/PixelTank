'use strict';

var Config = require('./config');
var Cooldown = require('./modules/cooldown');
var Death = require('./modules/death');
var Stats = require('./modules/stats');
var Physics = require('./modules/physics');
var Control = require('./modules/control');

var Bullet = require('./modules/bullet');
var User = require('./modules/user');
var Core = require('./core');


// Границы карты
Physics.addBorder( 0, 2530,Math.PI); // bottom
Physics.addBorder(-2560, 0,-Math.PI/2); // left
Physics.addBorder( 2530, 0,Math.PI/2); // right
Physics.addBorder( 0,-2560,0); // top


var LastRefTime = process.hrtime();
setInterval(function Refresh() {

  // Расчет разницы во времени между кадрами (В секундах)
  let NowRefTime = process.hrtime();
  let delta = ((NowRefTime[0]-LastRefTime[0]) + (NowRefTime[1]-LastRefTime[1])/1000000000);
  LastRefTime=NowRefTime;

  // Полет снарядов
  Bullet.move(delta);

  // Полчуние информации об игроках и снарядов
  var bullets = Bullet.getList();
  var users = User.getList();

  // Просчет столкновения со снарядом
  for(var bi = 0; bi < bullets.length; bi++) {
    for(var ui = 0, ul = users.length; ui < ul; ui++) {
    if (users[ui].id != bullets[bi].user)
    if(Math.pow(Math.abs(bullets[bi].x-users[ui].x),2)+Math.pow(Math.abs(bullets[bi].y-users[ui].y),2) <= 56*56) {
      if(CollisionBullet(users[ui].x,users[ui].y,users[ui].chassis.angle,bullets[bi].x,bullets[bi].y)) {
        //console.log(bullets[bi].user + ' повредил ' + users[ui].id + ' на ' + bullets[bi].damage + ' ('+ users[ui].hp + '/150)');
        if (users[ui].hp-bullets[bi].damage >= 0 && users[ui].hp > 0) {
          users[ui].hp-=bullets[bi].damage;
        } else {
          //console.log(bullets[bi].user + ' уничтожил ' + users[ui].id);
          // Отправка данных о смерти
          Stats.update(bullets[bi].user, users[ui].id);
          Death.add(bullets[bi].user,users[ui].id);
          let plname = users[ui].name;
          let usersid = users[ui].id;
          User.remove(ui);

          // Возрождение, но нужно выделить в отдельный месседж
          // в виде replay, а саму смерть оптравлять в виде death
          ////////////////
          User.add(usersid,plname);
          ///////////////////
        }
        Bullet.remove(bi);
        break;
      }
    }
    }
  }
  User.move(delta);

  Physics.worldStep(1/delta);
  // Считывание данных с физ. мира
  User.physics();
  User.fire();
  //counter++;
}, 1000/Config.FPS);

/*
counter++;
var counter=0;
setInterval(function() {
  console.log(counter);
  counter=0;
}, 1000);
/**/

function CollisionBullet(x,y,a,bx,by) {
  /*
  x,y - координаты танка
  a - поворот танка
  bx,by - координаты снаряда
  x1,y1 --- x2,y2
    |         |
    |   x,y   |
    |         |
  x3,y3 --- x4,y4
  */
  var R = Math.sqrt(Math.pow(bx-x,2)+Math.pow(by-y,2));
  bx = Math.cos(a) * R + x;
  by = Math.sin(a) * R + y;

  var x1=x-40;
  var x4=x+40;

  var y1=y-40;
  var y4=y+40;

  if(bx > x1 && by > y1
  && bx < x4 && by < y4)
    return true;
    return false;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
