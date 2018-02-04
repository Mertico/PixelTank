'use strict';

window.onmousemove = function(event) {
  Data.control.mouse.x = event.pageX;
  Data.control.mouse.y = event.pageY;
  Data.control.mouse.angle = Math.atan2(event.pageY-game.height/2,event.pageX-game.width/2);// / Math.PI * 180;
}.throttle(50);

window.onmousedown = () => {
  Data.control.mouse.down = true;
};
window.onmouseup = () => {
  Data.control.mouse.down = false;
};
window.onwheel = event => { // если выключить синхр пропадет?
  if(event.wheelDelta > 0) {
    Data.scale += 0.1;
  } else {
    Data.scale -= 0.1;
  }
  if (Data.scale < 0.5)
    Data.scale = 0.5;
  if (Data.scale > 1.4)
    Data.scale = 1.4;
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
  if(event.keyCode == 87) Data.control.key.w=true;
  if(event.keyCode == 83) Data.control.key.s=true;
  if(event.keyCode == 65) Data.control.key.a=true;
  if(event.keyCode == 68) Data.control.key.d=true;

  if(event.keyCode == 81) Data.control.key.q=true;
};
window.onkeyup = event => {
  if(event.keyCode == 87) Data.control.key.w=false;
  if(event.keyCode == 83) Data.control.key.s=false;
  if(event.keyCode == 65) Data.control.key.a=false;
  if(event.keyCode == 68) Data.control.key.d=false;

  if(event.keyCode == 81) Data.control.key.q=false;
};

button.onclick = () => {
  Data.playerName = document.forms["select"].elements["select-name"].value.trim();
  Data.playerTank = document.forms["select"].elements["select-tank"].value.trim();
  if(Data.playerTank == "light" || Data.playerTank == "medium" || Data.playerTank == "heavy") {
    // console.log(Data.playerName,Data.playerTank);
    document.forms["select"].classList.remove('select-active');
    Connect();
    UpdateLoop();
    GameLoop();
    BGLoop();
    UILoop();
  }
};


worker.onmessage = event => {
  switch (event.data.type) {
    case 'refresh':
      Data.server=event.data.data.server;
      //addTanks();
      break;
    case 'init':
      Data.tank=event.data.data.tank;
      Data.BULLET_SPEED=event.data.data.bs;
      break;
  }
};

setInterval(() => {
  worker.postMessage({
    type: 'control',
    data: {
      control: Data.control
    }
  });
},1000/30);

function Connect() {
  worker.postMessage({
    type: 'connect',
    data: {
     name: Data.playerName,
     tank: Data.playerTank
    }
  });
}
