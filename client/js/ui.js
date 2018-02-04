// Отрисоквка радара
function Radar() {
  // Отрисовка фона радара
  ctxui.save();
  ctxui.beginPath();
  ctxui.lineWidth = 2;
  ctxui.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctxui.arc(112, 112, 96, 0, Math.PI*2, false);
  ctxui.closePath();
  ctxui.stroke();
  ctxui.fill();

  //Данные об игроке
  let angle;
  let x,y;
  Data.server.users.forEach(function (value, index) {
    if (value.id == Data.server.id) {
      angle = value.turret.angle;
      x = value.x;
      y = value.y;
    }
  });

  // Отрисовка сектора направления орудия
  ctxui.beginPath();
  ctxui.lineWidth = 1;
  ctxui.fillStyle = "#4fc18d";
  ctxui.arc(112,112,96,angle-(Math.PI/6),angle+(Math.PI/6));
  ctxui.lineTo(112, 112);
  ctxui.closePath();
  ctxui.stroke();
  ctxui.fill();

  // Данные об окружающих игроках
  Data.server.users.forEach(function (value, index) {
    if (value.id != Data.server.id) {
      let r = Math.sqrt(Math.pow(Math.abs(value.y-y),2)+Math.pow(Math.abs(value.x-x),2));
      if(r <= 2000) {
        let degree = Math.atan2(value.y-y,value.x-x);
        ctxui.beginPath();
        ctxui.fillStyle = "#f66";
        ctxui.arc(112+96*(r/2000)*Math.cos(degree), 112+96*(r/2000)*Math.sin(degree), 2, 0, Math.PI*2, false);
        ctxui.closePath();
        ctxui.fill();
      }
    }
  });

  ctxui.restore();
}

// Отрисовка логов о смертях и убийствах
function DrawLog() {
  Data.server.death.forEach(function (value, index) {
    ctxui.save();
    let death_name="",killer_name="";
    Data.server.users.forEach(function (player) {
      if (player.id == value.killer)
        killer_name = player.name;
      if (player.id == value.death)
        death_name = player.name;
    });

    ctxui.textBaseline = "top";
    ctxui.fillStyle = "#f66";
    ctxui.font = 'bold 24px monospace';
    ctxui.textAlign = "start";
    ctxui.fillText(death_name, game.width-225, 12.5+36*index);
    ctxui.textAlign = "end";
    ctxui.fillText(killer_name, game.width-300, 12.5+36*index);
    ctxui.drawImage(images.death, game.width-280, 12.5+36*index, 26, 38);
    ctxui.restore();
  });
}



// Отрисовка логов о смертях и убийствах
function DrawStat() {
  if (Data.control.key.q) {
  ctxui.save();
  ctxui.beginPath();
  ctxui.lineWidth=3;
  ctxui.strokeStyle = "#000000";
  ctxui.moveTo(game.width*.8,game.height*.8);
  ctxui.lineTo(game.width*.8,game.height*.2);
  ctxui.lineTo(game.width*.2,game.height*.2);
  ctxui.lineTo(game.width*.2,game.height*.8);
  ctxui.lineTo(game.width*.8,game.height*.8);
  ctxui.fillStyle = "white";
  ctxui.fill();
  ctxui.stroke();


  ctxui.textBaseline = "top";
  ctxui.fillStyle = "#000000";
  ctxui.font = 'bold 24px monospace';
  ctxui.textAlign = "center";
  ctxui.fillText("TOP 10 PLAYER", game.width*.5, game.height*.21);

  ctxui.textBaseline = "top";
  ctxui.fillStyle = "#000000";
  ctxui.font = 'bold 20px monospace';
  ctxui.textAlign = "start";

  ctxui.fillText('#', game.width*.24, game.height*(.28));
  ctxui.fillText('Login', game.width*.28, game.height*(.28));
  ctxui.fillText('Kill', game.width*.64, game.height*(.28));
  ctxui.fillText('Death', game.width*.72, game.height*(.28));

  let unsort = Data.server.stats;
  unsort.sort(sDecrease).forEach(function (value, index) {
    if (index < 10) {
      let name;
      Data.server.users.forEach(function (val) {
        if(value.id == val.id) name = val.name;
      });
      ctxui.fillText(index+1, game.width*.24, game.height*(.32+0.043*index));
      ctxui.fillText(name, game.width*.28, game.height*(.32+0.043*index));
      ctxui.fillText(value.kill, game.width*.64, game.height*(.32+0.043*index));
      ctxui.fillText(value.death, game.width*.72, game.height*(.32+0.043*index));
    }
  });

  ctxui.restore();
  }
}

function sDecrease(i, ii) { // По убыванию убийств
 if (i.kill > ii.kill)
 return -1;
 else if (i.kill < ii.kill)
 return 1;
 else
 return 0;
}
