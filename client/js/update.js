//Модуль апроксимации
function Approximation() {
  // Полет снарядов
  for(var bi = 0, bl = server.bullets.length; bi < bl; bi++) {
    if (IsVisible(server.bullets[bi].x-12.5, server.bullets[bi].y-12.,25,25)) {
      // Передвижение снаряда на величину скорости
      server.bullets[bi].x +=(dt*BULLET_SPEED)*Math.cos(server.bullets[bi].angle);
      server.bullets[bi].y +=(dt*BULLET_SPEED)*Math.sin(server.bullets[bi].angle);
      server.bullets[bi].x = ((0.5 + server.bullets[bi].x*10) | 0)/10;
      server.bullets[bi].y = ((0.5 + server.bullets[bi].y*10) | 0)/10;
    }
  }
  // Передвижение танка
  for(var ui = 0, ul = server.users.length; ui < ul; ui++) {
    if (server.users[ui].id == server.id) {
      // Обновление данных о направление орудия
      //server.users[ui].turret.angle = mouse.angle;
      server.users[ui].turret.angle = RotateTurret(server.users[ui].turret.angle,control.mouse.angle,(dt*tank[server.users[ui].tank].turret.angle*Math.PI/180));
      // Вычисление изменений скорости
      if(control.key.w) {
        server.users[ui].speed += (dt*tank[server.users[ui].tank].acceleration*ac(server.users[ui].speed,tank[server.users[ui].tank].max_speed));
        if (server.users[ui].speed > tank[server.users[ui].tank].max_speed) server.users[ui].speed = tank[server.users[ui].tank].max_speed;
      }
      if(control.key.s) {
        server.users[ui].speed -= (dt*tank[server.users[ui].tank].acceleration*0.6*ac(server.users[ui].speed,tank[server.users[ui].tank].max_speed));
        if (server.users[ui].speed < -tank[server.users[ui].tank].max_speed*0.3) server.users[ui].speed = -tank[server.users[ui].tank].max_speed*0.3;
      }
      if((!control.key.s || server.users[ui].speed > 0) && !control.key.w) {
        if (server.users[ui].speed < 10 && server.users[ui].speed > -10) {
          server.users[ui].speed = 0;
        }
        if (server.users[ui].speed <= -10) {
          server.users[ui].speed += (dt*tank[server.users[ui].tank].acceleration*3*ac(server.users[ui].speed,server.users[ui].max_speed));
        }
        if (server.users[ui].speed >= 10) {
          server.users[ui].speed -= (dt*tank[server.users[ui].tank].acceleration*3*ac(server.users[ui].speed,server.users[ui].max_speed));
        }
      }

      // Поворот танка
      if(control.key.a) server.users[ui].chassis.angle -= (dt*tank[server.users[ui].tank].chassis.angle*Math.PI/180*ac(server.users[ui].speed,tank[server.users[ui].tank].max_speed));
      if(control.key.d) server.users[ui].chassis.angle += (dt*tank[server.users[ui].tank].chassis.angle*Math.PI/180*ac(server.users[ui].speed,tank[server.users[ui].tank].max_speed));

      vision.start.x = server.users[ui].x-game.width/2/scale;
      vision.start.y = server.users[ui].y-game.width/2/scale;
      vision.center.x = server.users[ui].x;
      vision.center.y = server.users[ui].y;
      vision.end.x = server.users[ui].x+game.width/2/scale;
      vision.end.y = server.users[ui].y+game.height/2/scale;
    }
    if (IsVisible(server.users[ui].x-40, server.users[ui].y-40,80,80)) {
      // Передвижение танка на величину скорости
      server.users[ui].x +=(dt*server.users[ui].speed)*Math.cos(server.users[ui].chassis.angle);
      server.users[ui].y +=(dt*server.users[ui].speed)*Math.sin(server.users[ui].chassis.angle);
      // Граница карты
      if(server.users[ui].x > 2560) server.users[ui].x = 2560;
      if(server.users[ui].y > 2560) server.users[ui].y = 2560;
      if(server.users[ui].x < -2560) server.users[ui].x = -2560;
      if(server.users[ui].y < -2560) server.users[ui].y = -2560;
    }
  }
}

// Функция плавного поворота башни
function RotateTurret(ta,ma,s) {
  if (ta < 0)
    ta = ta + 2*Math.PI;

  let a = ta - ma;

  if (a > Math.PI)
    a = a - 2*Math.PI;
  else if (a < -Math.PI)
    a = a + 2*Math.PI;

  if (a >= -s && a <= s)
    ta = ma;
  else if (a > s)
    ta = ta - s;
  else if (a < -s)
    ta = ta + s;
return ta;
}

function ac(speed, max_speed=120) {
  //(2+x^0.1)/(2+x^0.3) (x from 0 to 100)
  // получаем коэффицент скорости разворота
  // от 1 до почти 0.616
  // перемножаем на скорость поворота танка
  return (1+Math.pow((Math.abs(speed)/max_speed)*10,0.1))/(1+Math.pow((Math.abs(speed)/max_speed)*10,0.3));
}
