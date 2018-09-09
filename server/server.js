'use strict';

var io = require('socket.io')(3600);
io.set('transports', ['websocket']);
io.noServer = false;
io.clientTracking = false;
io.perMessageDeflate = false;

var Config = require('./config');
var Death = require('./modules/death');
var Stats = require('./modules/stats');
var Physics = require('./modules/physics');
var Control = require('./modules/control');

var Bullet = require('./modules/bullet');
var User = require('./modules/user');
var Core = require('./core');

console.log('Starting server');
//node -nouse-idle-notification -expose-gc -max-old-space-size=4096 server.js
// DEBUG=socket.io* node server.js
// node --prof server
// node --prof-process isolate-0x*-v8.log > processed.txt

// Отправка данных игроков //sockets
setInterval(function SendStats() {
  io.emit('stats', {data: {stats: Stats.get(),death: Death.get()}});
}, 750);

// Отправка данных игроков //sockets
setInterval(function SendRefresh() {
  process.nextTick(function () {
    io.emit('refresh', SendArray(User.getList(),Bullet.getList()));
  });
}, 1000/Config.FPS_send);
/*
    //counter++;
var counter=0;
setInterval(function() {
  console.log(counter);
  counter=0;
}, 1000);
*/

io.on('connection', function (socket) {
  // Обработка полученых от пользователя данных
  socket.on('refresh', (m) => Control.update(socket.id, m));

  // Вход нового игрока и создание данных о нем
  socket.on('join', function (m) {
    // Вывод в лог информации о новом игроке
    console.log('Join new client: ' + socket.id);
    // Отправка данных соединения
    socket.emit('init', {tank: Config.tank, stats: Stats.get, bs: Config.BULLET_SPEED});
    // Добавление данных нового пользователя
    User.add(socket.id,m.name,m.tank);
    Stats.add(socket.id);
    Control.add(socket.id);
  });

  // Обработка дисконекта
  socket.on('disconnect', function (m) {
    //io.emit('user disconnected');
    // Удаление данных удаленного игрока
    io.clients(function(error, clients) {
      if (error) throw error;
      let users = User.getList();
      users.forEach(function (value, index) {
        let del=true;
        clients.forEach(function (val) {
          if (val == value.id) {
            del=false;
          }
        });
        if(del) {
          Stats.remove(value.id);
          User.remove(index);
          Control.remove(value.id);
        }
      });
    });
    // Вывод в лог информации о дисконекте
    console.log("Disconnect: " + m);
  });
});

// Оптимизация отправляемых данных
function SendArray(users, bullets) {
  var array=[[],[]];
  for(var ui = 0, ul = users.length; ui < ul; ui++) {
    array[0][ui]=[
      ((users[ui].x*100) | 0)/100,
      ((users[ui].y*100) | 0)/100,
      ((users[ui].speed*100) | 0)/100,
      ((users[ui].turret.angle*100000) | 0)/100000,
      ((users[ui].chassis.angle*100000) | 0)/100000,
      users[ui].hp,
      users[ui].tank,
      users[ui].name,
      users[ui].id
    ];
  }
  for(var bi = 0, bl = bullets.length; bi < bl; bi++) {
    array[1][bi]=[
      ((bullets[bi].x*100) | 0)/100,
      ((bullets[bi].y*100) | 0)/100,
      ((bullets[bi].angle*100000) | 0)/100000
    ];
  }
  return array;
}
