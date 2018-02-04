//Модуль апроксимации
function Approximation() {
  // Полет снарядов
  for(var bi = 0, bl = Data.server.bullets.length; bi < bl; bi++) {
    if (IsVisible(Data.server.bullets[bi].x-12.5, Data.server.bullets[bi].y-12.,25,25)) {
      // Передвижение снаряда на величину скорости
      Data.server.bullets[bi].x +=(dt*Data.BULLET_SPEED)*Math.cos(Data.server.bullets[bi].angle);
      Data.server.bullets[bi].y +=(dt*Data.BULLET_SPEED)*Math.sin(Data.server.bullets[bi].angle);
      Data.server.bullets[bi].x = ((0.5 + Data.server.bullets[bi].x*10) | 0)/10;
      Data.server.bullets[bi].y = ((0.5 + Data.server.bullets[bi].y*10) | 0)/10;
    }
  }
  // Передвижение танка
  for(var ui = 0, ul = Data.server.users.length; ui < ul; ui++) {
    if (Data.server.users[ui].id == Data.server.id) {
      // Обновление данных о направление орудия
      //Data.server.users[ui].turret.angle = mouse.angle;
      Data.server.users[ui].turret.angle = RotateTurret(Data.server.users[ui].turret.angle,Data.control.mouse.angle,(dt*Data.tank[Data.server.users[ui].tank].turret.angle*Math.PI/180));
      // Вычисление изменений скорости
      if(Data.control.key.w) {
        Data.server.users[ui].speed += (dt*Data.tank[Data.server.users[ui].tank].acceleration*ac(Data.server.users[ui].speed,Data.tank[Data.server.users[ui].tank].max_speed));
        if (Data.server.users[ui].speed > Data.tank[Data.server.users[ui].tank].max_speed) Data.server.users[ui].speed = Data.tank[Data.server.users[ui].tank].max_speed;
      }
      if(Data.control.key.s) {
        Data.server.users[ui].speed -= (dt*Data.tank[Data.server.users[ui].tank].acceleration*0.6*ac(Data.server.users[ui].speed,Data.tank[Data.server.users[ui].tank].max_speed));
        if (Data.server.users[ui].speed < -Data.tank[Data.server.users[ui].tank].max_speed*0.3) Data.server.users[ui].speed = -Data.tank[Data.server.users[ui].tank].max_speed*0.3;
      }
      if((!Data.control.key.s || Data.server.users[ui].speed > 0) && !Data.control.key.w) {
        if (Data.server.users[ui].speed < 10 && Data.server.users[ui].speed > -10) {
          Data.server.users[ui].speed = 0;
        }
        if (Data.server.users[ui].speed <= -10) {
          Data.server.users[ui].speed += (dt*Data.tank[Data.server.users[ui].tank].acceleration*3*ac(Data.server.users[ui].speed,Data.server.users[ui].max_speed));
        }
        if (Data.server.users[ui].speed >= 10) {
          Data.server.users[ui].speed -= (dt*Data.tank[Data.server.users[ui].tank].acceleration*3*ac(Data.server.users[ui].speed,Data.server.users[ui].max_speed));
        }
      }

      // Поворот танка
      if(Data.control.key.a) Data.server.users[ui].chassis.angle -= (dt*Data.tank[Data.server.users[ui].tank].chassis.angle*Math.PI/180*ac(Data.server.users[ui].speed,Data.tank[Data.server.users[ui].tank].max_speed));
      if(Data.control.key.d) Data.server.users[ui].chassis.angle += (dt*Data.tank[Data.server.users[ui].tank].chassis.angle*Math.PI/180*ac(Data.server.users[ui].speed,Data.tank[Data.server.users[ui].tank].max_speed));

      Data.vision.start.x = Data.server.users[ui].x-game.width/2/Data.scale;
      Data.vision.start.y = Data.server.users[ui].y-game.width/2/Data.scale;
      Data.vision.center.x = Data.server.users[ui].x;
      Data.vision.center.y = Data.server.users[ui].y;
      Data.vision.end.x = Data.server.users[ui].x+game.width/2/Data.scale;
      Data.vision.end.y = Data.server.users[ui].y+game.height/2/Data.scale;
    }
    if (IsVisible(Data.server.users[ui].x-40, Data.server.users[ui].y-40,80,80)) {
      // Передвижение танка на величину скорости
      Data.server.users[ui].x +=(dt*Data.server.users[ui].speed)*Math.cos(Data.server.users[ui].chassis.angle);
      Data.server.users[ui].y +=(dt*Data.server.users[ui].speed)*Math.sin(Data.server.users[ui].chassis.angle);
      // Граница карты
      if(Data.server.users[ui].x > 2560) Data.server.users[ui].x = 2560;
      if(Data.server.users[ui].y > 2560) Data.server.users[ui].y = 2560;
      if(Data.server.users[ui].x < -2560) Data.server.users[ui].x = -2560;
      if(Data.server.users[ui].y < -2560) Data.server.users[ui].y = -2560;
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
