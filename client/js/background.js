// Отрисовка игрового фона (точек)
function Background() {
  ctxbg.save();
  //Camera();
  if(Data.scale != 1) ctxbg.scale(Data.scale, Data.scale);
  let roundedX = (0.5 + -Data.vision.center.x+bg.width/2/Data.scale) | 0;
  let roundedY = (0.5 + -Data.vision.center.y+bg.height/2/Data.scale) | 0;
  ctxbg.translate(roundedX, roundedY);

  for (var x = -2560; x < 2560; x += 256) {
    for (var y = -2560; y < 2560; y += 256) {
      if (IsVisible(x, y,256,256)) {
        ctxbg.drawImage(images.background, x, y,256,256);
      }
    }
  }
  ctxbg.restore();
}
