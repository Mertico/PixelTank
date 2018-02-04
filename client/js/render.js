'use strict';

var last = performance.now();
var dt;
function UpdateLoop() {
  let now = performance.now();
      dt = (now - last) / 1000;
      last=now;
  Approximation();
  requestAnimationFrame(UpdateLoop);
}

var game = document.getElementById("game-layer"),
      ctxgame  = game.getContext('2d');
      game.width  = window.innerWidth-4;
      game.height = window.innerHeight-4;

function GameLoop() {
  ctxgame.clearRect(0, 0, game.width, game.height);
  DrawBullets();
  DrawTanks();
  requestAnimationFrame(GameLoop);
}

var ui = document.getElementById("ui-layer"),
  ctxui  = ui.getContext('2d');
  ui.width  = window.innerWidth-4;
  ui.height = window.innerHeight-4;

function UILoop() {
  ctxui.clearRect(0, 0, ui.width, ui.height);
  DrawLog();
  Radar();
  DrawStat();
  requestAnimationFrame(UILoop);
}

var bg = document.getElementById("background-layer"),
  ctxbg  = bg.getContext('2d');
  bg.width  = window.innerWidth-4;
  bg.height = window.innerHeight-4;

function BGLoop() {
  ctxbg.clearRect(0, 0, bg.width, bg.height);
  Background();
  requestAnimationFrame(BGLoop);
}
