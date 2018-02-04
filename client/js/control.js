'use strict';

window.onmousemove = function(event) {
  control.mouse.x = event.pageX;
  control.mouse.y = event.pageY;
  control.mouse.angle = Math.atan2(event.pageY-game.height/2,event.pageX-game.width/2);// / Math.PI * 180;
}.throttle(50);

window.onmousedown = () => {
  control.mouse.down = true;
};
window.onmouseup = () => {
  control.mouse.down = false;
};
window.onwheel = event => { // если выключить синхр пропадет?
  if(event.wheelDelta > 0) {
    scale += 0.1;
  } else {
    scale -= 0.1;
  }
  if (scale < 0.5)
    scale = 0.5;
  if (scale > 1.4)
    scale = 1.4;
};
window.onresize = () => {
  game.width  = window.innerWidth-4;
  game.height = window.innerHeight-4;

  ui.width  = window.innerWidth-4;
  ui.height = window.innerHeight-4;

  bg.width  = window.innerWidth-4;
  bg.height = window.innerHeight-4;
};
window.onkeydown = event => {
  if(event.keyCode == 87) control.key.w=true;
  if(event.keyCode == 83) control.key.s=true;
  if(event.keyCode == 65) control.key.a=true;
  if(event.keyCode == 68) control.key.d=true;

  if(event.keyCode == 81) control.key.q=true;
};
window.onkeyup = event => {
  if(event.keyCode == 87) control.key.w=false;
  if(event.keyCode == 83) control.key.s=false;
  if(event.keyCode == 65) control.key.a=false;
  if(event.keyCode == 68) control.key.d=false;

  if(event.keyCode == 81) control.key.q=false;
};

button.onclick = () => {
  PlayerName = document.forms["select"].elements["select-name"].value.trim();
  PlayerTank = document.forms["select"].elements["select-tank"].value.trim();
  if(PlayerTank == "light" || PlayerTank == "medium" || PlayerTank == "heavy") {
    // console.log(PlayerName,PlayerTank);
    document.forms["select"].classList.remove('select-active');
    Connect();
    UpdateLoop();
    GameLoop();
    BGLoop();
    UILoop();
  }
};

var server;
worker.onmessage = event => {
  switch (event.data.type) {
    case 'refresh':
      server=event.data.data.server;
      //addTanks();
      break;
    case 'init':
      tank=event.data.data.tank;
      BULLET_SPEED=event.data.data.bs;
      break;
  }
};

setInterval(() => {
  worker.postMessage({
    type: 'control',
    data: {
     control
    }
  });
},1000/30);

function Connect() {
  worker.postMessage({
    type: 'connect',
    data: {
     name: PlayerName,
     tank: PlayerTank
    }
  });
}
