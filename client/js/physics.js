'use strict';


//var p2 = require('p2');

var world = new p2.World({
    gravity:[0, 0]
});
var PhysicsObject=[];

// Добавление танка в мир
function addTank(id,tank,x,y,angle) {
  let mass;
  switch (tank) {
    case 'light':
      mass=15.5;
      break;
    case 'medium':
      mass=36;
      break;
    case 'heavy':
      mass=188.9;
      break;
    default:
      mass=15.5;
  }
  let body = new p2.Body({ mass: mass, position: [x,y],angle: angle, damping: .99,angularDamping: .95  });
  PhysicsObject[id]=body.id;
  switch (tank) {
    case 'light':
      //light
      body.fromPolygon([[22,26],[22,19.6],[34,19.6], [34,-19.6],[22,-19.6],[22,-26],
                        [-30,-26],[-30,-19.6],[-34,-19.6], [-34,19.6],[-30,19.6],[-30,26] ]);
      break;
    case 'medium':
      //medium
      body.fromPolygon([[32.5,32.5],[32.5,20],[25,20], [25,-20],[32.5,-20],[32.5,-32.5],
                        [-32.5,-32.5],[-32.5,-20],[-25,-20], [-25,20],[-32.5,20],[-32.5,32.5] ]);
      break;
    case 'heavy':
      //heavy
      body.addShape(new p2.Box({ width: 54, height: 57.6 }));
      break;
    default:
      //light
      body.fromPolygon([[22,26],[22,19.6],[34,19.6], [34,-19.6],[22,-19.6],[22,-26],
                        [-30,-26],[-30,-19.6],[-34,-19.6], [-34,19.6],[-30,19.6],[-30,26] ]);
  }
  world.addBody(body);
}

function addTanks() {
  removeWorld();
  for(var ui = 0, ul = Data.server.users.length; ui < ul; ui++) {
    addTank(Data.server.users[ui].id,Data.server.users[ui].tank,Data.server.users[ui].x,Data.server.users[ui].y,Data.server.users[ui].chassis.angle);
  }
}

// Добавление границ в мир
function addBorder(x,y,angle) {
  let body = new p2.Body({position:[x,y],angle: angle});
  body.addShape(new p2.Plane());
  world.addBody(body);
}
// Изменение танка в мире по ид пользователя
function updateTankSpeed(id,speed=0) {
  let changeTankId = world.getBodyById(PhysicsObject[id]);
  changeTankId.velocity[0] = speed*Math.cos(changeTankId.angle);
  changeTankId.velocity[1] = speed*Math.sin(changeTankId.angle);
}
function updateTankAngle(id,angle=0) {
  world.getBodyById(PhysicsObject[id]).angularVelocity=angle;
}
// Получение информации о танке из мира по ид пользователя
function getTank(id) {
  return world.getBodyById(PhysicsObject[id]);
}
// Удаление мира
function removeWorld() {
  world.clear;
  PhysicsObject=[];
}

function worldStep(fps) {
  world.step(1/fps);
}
