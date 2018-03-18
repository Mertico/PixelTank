'use strict';
const cluster = require('cluster');
var socketio = require('socket.io-client');
//const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Запуск воркеров по кол-ву потоков минус поток мастера
  for (var i = 0; i < 4; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker #${worker.id} pid:${worker.process.pid} died`);
    if( signal ) {
      console.log("worker was killed by signal: "+signal);
    } else if( code !== 0 ) {
      console.log("worker exited with error code: "+code);
    } else {
      console.log("worker success!");
    }
    cluster.fork();
  });
} else {
  let port = Math.floor(Math.random() * (3605 - 3600)) + 3600
  var socket = socketio('http://localhost:'+port,{transports: ['websocket']});

  socket.on('connect', function () {
    socket.emit('join', {name: "[Bot "+cluster.worker.id+"]", tank: (Math.random() > .66) ? 'heavy' : (Math.random() > .5) ? 'light' : 'medium'});
    //socket.on('join', function (m) {
      console.log('Bot №'+cluster.worker.id+' connect');
    //});
  });
  socket.on('disconnect', function () {
    console.log('Bot №'+cluster.worker.id+' disconnect');
  });


  socket.on('refresh', function (m) {
    var [users,bullets] = InSend(m[0]);
    var bot = {
      x:0,
      y:0,
      turret: 0,
      chassis: 0
    };
    // передаем нажатие мыши и клавиатуры
    var mouse = {
      x : 0,
      y : 0,
      down : false,
      angle : 0
    };
    var key = {
      w : false, // ↑
      s : false, // ↓
      a : false, // ←
      d : false  // →
    };

    var target = {
      x: 0,
      y: 0,
      angle: -Math.PI / 2,
      r: 9999999999,
      track: false
    };

    for(var ui = 0, ul = users.length; ui < ul; ui++) {
      if (users[ui].id == socket.id) {
        bot.x=users[ui].x;
        bot.y=users[ui].y;
        bot.turret=users[ui].turret.angle;
        bot.chassis=users[ui].chassis.angle;
      }
    }
    for(var ui = 0, ul = users.length; ui < ul; ui++) {
      if (users[ui].id != socket.id) {

        let r = Math.sqrt(Math.pow(Math.abs(users[ui].y-bot.y),2)+Math.pow(Math.abs(users[ui].x-bot.x),2));
        if (target.r > r) {
          // Передвижение танка на величину скорости для стрельбы на опережнение
          //users[ui].x +=users[ui].speed*Math.cos(users[ui].chassis.angle);
          //users[ui].y +=users[ui].speed*Math.sin(users[ui].chassis.angle);
          target.x=users[ui].x;
          target.y=users[ui].y;
          target.angle=Math.atan2(users[ui].y-bot.y,users[ui].x-bot.x);
          target.angle+=(users[ui].speed*Math.sin(users[ui].chassis.angle-bot.turret)/900);
          target.r=r;
          target.track=true;
        }
      }
    }
    if (target.track) {
      key.w=true;
      if (bot.chassis.toFixed(1) != target.angle.toFixed(1)) {
        if (bot.chassis < 0)
          bot.chassis = bot.chassis + 2*Math.PI;

        let a = bot.chassis - target.angle;
        let s = Math.PI/18

        if (a > Math.PI)
          a = a - 2*Math.PI;
        else if (a < -Math.PI)
          a = a + 2*Math.PI;

        if (a >= -s && a <= s)
          key.w=true;
        else if (a > s)
          key.a=true;
        else if (a < -s)
          key.d=true;
      }
      if(target.r<300)
        key.w=false;
    }
    if (target.r<2000) {
      mouse.angle=target.angle;
    }
    if (target.r<1500) {
      if (bot.turret.toFixed(1) == target.angle.toFixed(1)) {
        // mouse.down=true;
      }
    }
    socket.emit('refresh', sendControl({mouse : mouse,key :key}));
  });

  function sendControl(control) {
    return [
      control.key.w && 1  || // move player
      control.key.s && -1 ||
      0,
      control.key.d && 1  || // rotate player
      control.key.a && -1 ||
      0,
      ((0.5 + control.mouse.angle*100000) | 0)/100000, // mouse angle
      control.mouse.down // fire
    ];
  }

  function InSend(data) {
    let users=[], bullets=[];
    for(var index = 0, length = data[0].length; index < length; index++) {
      users[index] = {
        x: data[0][index][0],
        y: data[0][index][1],
        speed: data[0][index][2],
        turret: {
          angle: data[0][index][3]
        },
        chassis: {
          angle: data[0][index][4]
        },
        hp: data[0][index][5],
        tank: data[0][index][6],
        name: data[0][index][7],
        id: data[0][index][8]
      };
    }
    for(var index = 0, length = data[1].length; index < length; index++) {
      bullets[index] = {
        x: data[1][index][0],
        y: data[1][index][1],
        angle: data[1][index][2]
      };
    }
    return [users, bullets];
  }
}
