if (typeof SVG === 'undefined') {
  var SVG = {};
}
if (typeof SVG.light === 'undefined') {
  SVG.light = {};
}
SVG.light.turret = {
  draw: function(ctx) {
    //НЕМНОГО СМЕЩЕНА нужно фиксить
    ctx.translate(-17.25, -32.5);
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
    ctx.transform(0,-0.566,0.566,0,-79.378,423.514);
    ctx.save();
    ctx.fillStyle="#FFF";
    ctx.strokeStyle="#000";
    ctx.lineWidth=7.2;
    ctx.font="   15px HelveticaNeue,Helvetica,Arial,sans-serif";
    ctx.translate(133.5,-21.5);
    ctx.save();
    ctx.fillStyle="#FFF";
    ctx.strokeStyle="#000";
    ctx.lineWidth=7.2;
    ctx.font="   15px HelveticaNeue,Helvetica,Arial,sans-serif";
    ctx.beginPath();
    ctx.arc(526.5,209.362,25,0,6.283185307179586,true);
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
    ctx.arc(534,199.362,5.5,0,6.283185307179586,true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    ctx.save();
    ctx.fillStyle="#FFF";
    ctx.strokeStyle="#000";
    ctx.lineWidth=7.2;
    ctx.font="   15px HelveticaNeue,Helvetica,Arial,sans-serif";
    ctx.beginPath();
    ctx.moveTo(654.19,212.862);
    ctx.lineTo(666,212.862);
    ctx.quadraticCurveTo(666,212.862,666,212.862);
    ctx.lineTo(666,313.36199999999997);
    ctx.quadraticCurveTo(666,313.36199999999997,666,313.36199999999997);
    ctx.lineTo(654.19,313.36199999999997);
    ctx.quadraticCurveTo(654.19,313.36199999999997,654.19,313.36199999999997);
    ctx.lineTo(654.19,212.862);
    ctx.quadraticCurveTo(654.19,212.862,654.19,212.862);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    ctx.restore();
  }
}
