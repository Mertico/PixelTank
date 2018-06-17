'use strict';

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const socketio = require('socket.io');
const redis = require('ioredis');
const redisAdapter = require('socket.io-redis');

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  const io = new socketio();
  const pub = redis.createClient(6379, '127.0.0.1');
  const sub = redis.createClient(6379, '127.0.0.1');
  io.adapter(redisAdapter({ pubClient: pub, subClient: sub }));

  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }


// io.set('transports', ['websocket']);
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
    var t = Date.now();
    io.emit('refresh', [SendArray(User.getList(),Bullet.getList()), t]);
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
// console.log(sub);

// sub.subscribe('socket.io#', function (err, count) {
//   console.log(count);
// });
// sub.subscribe('socket.io-request#/#', function (err, count) {
//   console.log(count);
// });
sub.subscribe('refresh', 'join', 'disconnect', function (err, count) {
  console.log(count);
});
sub.on("message", function (channel, message) {
  // console.log(message);
  message = JSON.parse(message);
  switch(channel) {
    case 'refresh':
      Control.update(message.id, message.m);
      break;
    case 'join':
      console.log("sub channel " + channel);
      console.log(message);
      io.to(message.id)
      .emit('init', {tank: Config.tank, stats: Stats.get, bs: Config.BULLET_SPEED});
      // socket.emit('init', {tank: Config.tank, stats: Stats.get, bs: Config.BULLET_SPEED});
      // Добавление данных нового пользователя
      User.add(message.id,message.name,message.tank);
      Stats.add(message.id);
      Control.add(message.id);
      break;
    case 'disconnect':
      console.log("sub channel " + channel + ": " + message);
      io.of('/').adapter.clients((error, clients) => {
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
      break;
    default:
      // console.log("ERROR!!!!");
      break;
  }
});
// console.log(io.adapter())
// io.of('/').adapter.clients((err, clients) => {
//   console.log(clients); // an array containing all connected socket ids
// });

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


} else {
  console.log('Worker '+cluster.worker.id, process.pid, 'started');

  // const clusterRedis = new redis.Cluster([
  //   {
  //     port: 6379,
  //     host: '127.0.0.1'
  //   }
  // ]);
  // io.adapter(redisAdapter({ pubClient: clusterRedis, subClient: clusterRedis }));
  const io = new socketio(3600+cluster.worker.id-1);
  const pub = redis.createClient(6379, '127.0.0.1');
  const sub = redis.createClient(6379, '127.0.0.1');
  io.adapter(redisAdapter({ pubClient: pub, subClient: sub }));
  // console.log(io);

  io.on('connection', function (socket) {
    // Обработка полученых от пользователя данных
    socket.on('refresh', (m) => pub.publish('refresh', JSON.stringify({id: socket.id, m: m})));
    // Вход нового игрока и создание данных о нем
    socket.on('join', function (m) {
      // Вывод в лог информации о новом игроке
      console.log('Join new client: ' + socket.id);
      pub.publish('join', JSON.stringify({id: socket.id, m: m}))
    });

    // Обработка дисконекта
    socket.on('disconnect', function (m) {
      console.log('Disconnect client: ' + socket.id);
      pub.publish('disconnect', JSON.stringify({id: socket.id, m: m}))
    });
  });

  io.on('error', function(){
    console.log('Worker '+cluster.worker.id, process.pid, 'Error socket')
  })
}