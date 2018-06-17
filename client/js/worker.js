self.importScripts('vendor/socket.io-1.4.5.js');
//self.importScripts('vendor/p2.js');
var socket = io('http://localhost:3600/',{transports: ['websocket']});
//var socket = io('https://ws.mertico.ru/',{transports: ['websocket'], secure: true});

var server={
  death:[],
  bullets:[],
  users:[],
  stats:[],
  id:0
};
var timeStamp=0, startTime=0;

socket.on('connect', () => { server.id=server.id; });

onmessage = event => {
  var message = event.data;
  switch (message.type) {
    case 'connect':
      //socket.on('connect', function () {
        socket.emit('join', {name: message.data.name, tank: message.data.tank});
        //socket.emit('join', {name: 123, tank: 13});
      //});
      break;
    case 'control':
      //control=message.data.control;
      socket.emit('refresh', sendControl(message.data.control));
      break;
  }
};

socket.on('init', function (m) {
  server.stats=m.stats;
  console.log(m);
  
  postMessage({
   type: 'init',
   data: {
     tank: m.tank,
     bs: m.bs
   }
  });
});

socket.on('stats', function (m) {
  m.data.death.forEach(function(element, index) {
    server.death.unshift({killer: element[0], death: element[1], life : 3});
  });
  server.death.splice(5, 1);
  server.stats=m.data.stats;
});


socket.on('refresh', function (m) {
  // Проверка временой метки (насколько актуален пакет данных)
  if(m[1] >= timeStamp) {
    timeStamp = m[1];
    [server.users,server.bullets] = InSend(m[0]);
    postMessage({
     type: 'refresh',
     data: {
       server
     }
    });
  }
});

setInterval(() => {
  server.death.forEach(function (value, index) {
    value.life-=1;
    if(value.life<=0)
      server.death.splice(index, 1);
  });
},1000);

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
