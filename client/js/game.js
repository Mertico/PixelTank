// Центрирование холста на игрока
function Camera() {
  if(scale != 1) ctxgame.scale(scale, scale);
  let roundedX = ((0.5 + (-vision.center.x+game.width/2/scale)*10) | 0)/10;
  let roundedY = ((0.5 + (-vision.center.y+game.height/2/scale)*10) | 0)/10;
  ctxgame.translate(roundedX, roundedY);
}

// Проверка видимости объекта игроком на холсте
function IsVisible(x,y,w=0,h=0) {
  let IsVisible=false;
  if (vision.start.x<x+w)
  if (vision.start.y<y+h)
  if (vision.end.x>x)
  if (vision.end.y>y)
    IsVisible=true;
  return IsVisible;
}

// Возврат среднего значения массива
function ArrayAverage(array) {
  return (array.reduce(function(previousValue, currentValue) {
  return previousValue + currentValue;
})/array.length);
}

// Отрисовка танков на игровом поле
function DrawTanks() {
  ctxgame.save();
  Camera(); // Центриование на игрока
  for(var ui = 0, ul = server.users.length; ui < ul; ui++) {
    if (IsVisible(server.users[ui].x-40, server.users[ui].y-40,80,80)) {// Видит ли танки
    var roundedX = ((0.5 + server.users[ui].x*10) | 0)/10;
    var roundedY = ((0.5 + server.users[ui].y*10) | 0)/10;
      switch (server.users[ui].tank) {
        case 'light':
        // Отрисовка шасси легкого танка
        ctxgame.save();
        ctxgame.translate(roundedX, roundedY);
        ctxgame.rotate(server.users[ui].chassis.angle);

        // SVG.light.chassis.draw(ctxgame);

        ctxgame.drawImage(images.lchassis, -40,-40, 80,80);
        ctxgame.restore();

        // Отрисовка башни легкого танка
        ctxgame.save();
        ctxgame.translate(roundedX, roundedY);
        ctxgame.rotate(server.users[ui].turret.angle);

        // SVG.light.turret.draw(ctxgame);

        ctxgame.drawImage(images.lturret, -21.5, -40, 80,80);
        ctxgame.restore();
          break;
        case 'medium':
        // Отрисовка шасси среднего танка
        ctxgame.save();
        ctxgame.translate(roundedX, roundedY);
        ctxgame.rotate(server.users[ui].chassis.angle);

        // SVG.medium.chassis.draw(ctxgame);

        ctxgame.drawImage(images.mchassis, -40,-40, 80,80);
        ctxgame.restore();

        // Отрисовка башни среднего танка
        ctxgame.save();
        ctxgame.translate(roundedX, roundedY+2.5);
        ctxgame.rotate(server.users[ui].turret.angle);

        // SVG.medium.turret.draw(ctxgame);

        ctxgame.drawImage(images.mturret, -33.5, -40, 80,80);
        ctxgame.restore();
          break;
        case 'heavy':
        // Отрисовка шасси тяжелого танка
        ctxgame.save();
        ctxgame.translate(roundedX, roundedY);
        ctxgame.rotate(server.users[ui].chassis.angle);

        // SVG.heavy.chassis.draw(ctxgame);

        ctxgame.drawImage(images.hchassis, -40,-40, 80,80);
        ctxgame.restore();

        // Отрисовка башни тяжелого танка
        ctxgame.save();
        ctxgame.translate(roundedX, Math.round(server.users[ui].y*10)/10);
        ctxgame.rotate(server.users[ui].turret.angle);

        // SVG.heavy.turret.draw(ctxgame);

        ctxgame.drawImage(images.hturret, -27, -40, 80,80);
        ctxgame.restore();
          break;
      }
      ctxgame.save();
      // Отображение ника игрока
      ctxgame.textAlign = "center";
      ctxgame.textBaseline = "bottom";
      ctxgame.fillStyle = "#f66";
      ctxgame.font = 'bold 24px monospace';
      ctxgame.fillText(server.users[ui].name,roundedX, roundedY-56);


      // Отображение хп
      ctxgame.beginPath();
      ctxgame.lineWidth=4;
      ctxgame.strokeStyle = "#4fc18d";
      ctxgame.moveTo(roundedX-50,roundedY-54);
      ctxgame.lineTo(roundedX-50+(100*(server.users[ui].hp/tank[server.users[ui].tank].hp)),roundedY-54);
      ctxgame.stroke();

      ctxgame.beginPath();
      ctxgame.strokeStyle = "#000000";
      ctxgame.moveTo(roundedX-50+(100*(server.users[ui].hp/tank[server.users[ui].tank].hp)),roundedY-54);
      ctxgame.lineTo(roundedX+50,roundedY-54);
      ctxgame.stroke();

      ctxgame.restore();

    }
  }
  ctxgame.restore();
}

function DrawBullets() {
  ctxgame.save();
  Camera();
  for(var bi = 0, bl = server.bullets.length; bi < bl; bi++) {
    if (IsVisible(server.bullets[bi].x, server.bullets[bi].y)) {
      ctxgame.save();
      ctxgame.translate(server.bullets[bi].x, server.bullets[bi].y);
      ctxgame.rotate(server.bullets[bi].angle);
      ctxgame.drawImage(images.bullet, -12.5,-12.5,25,25);
      ctxgame.restore();
    }
  }
  ctxgame.restore();
}
