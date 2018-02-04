if (typeof SVG === 'undefined') {
  var SVG = {};
}
if (typeof SVG.heavy === 'undefined') {
  SVG.heavy = {};
}
SVG.heavy.turret = {
  draw: function(ctx) {
    //СМЕЩЕНА ПОЧИНИТЬ
    ctx.translate(-21.5, -32.5);
    ctx.save();
    ctx.strokeStyle="rgba(0,0,0,0)";
    ctx.miterLimit=4;
    ctx.font="normal normal normal normal 15px/21px 'Helvetica Neue', Helvetica, Arial, sans-serif";
    ctx.font="   15px 'HelveticaNeue',Helvetica,Arial,sans-serif";
    ctx.scale(0.8,0.8);
    ctx.save();
    ctx.fillStyle="#FFF";
    ctx.strokeStyle="#000";
    ctx.lineWidth=7.2;
    ctx.font="   15px HelveticaNeue,Helvetica,Arial,sans-serif";
    ctx.transform(0,-0.44,0.44,0,4.733,134.894);
    ctx.save();
    ctx.fillStyle="#FFF";
    ctx.strokeStyle="#000";
    ctx.lineWidth=7.2;
    ctx.font="   15px HelveticaNeue,Helvetica,Arial,sans-serif";
    ctx.beginPath();
    ctx.moveTo(169.5,191.291);
    ctx.lineTo(215.929,191.291);
    ctx.lineTo(215.929,212.72);
    ctx.lineTo(169.5,212.72);
    ctx.closePath();
    ctx.moveTo(183.659,100.576);
    ctx.lineTo(201.516,100.576);
    ctx.lineTo(201.516,195.933);
    ctx.lineTo(183.659,195.933);
    ctx.closePath();
    ctx.moveTo(192.765,22.003);
    ctx.lineTo(233.69599999999997,51.741);
    ctx.lineTo(218.06199999999995,99.858);
    ctx.lineTo(167.46899999999994,99.858);
    ctx.lineTo(151.83499999999992,51.74100000000001);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle="#FFF";
    ctx.strokeStyle="#000";
    ctx.lineWidth=7.2;
    ctx.font="   15px HelveticaNeue,Helvetica,Arial,sans-serif";
    ctx.beginPath();
    ctx.arc(192.788,65.755,11.607,0,6.283185307179586,true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    ctx.restore();
  }
}
