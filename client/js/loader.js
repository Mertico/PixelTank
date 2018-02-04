(function( w ){
	var loadJS = function( src, cb ){
		"use strict";
		var ref = w.document.getElementsByTagName( "script" )[ 0 ];
		var script = w.document.createElement( "script" );
		script.src = src;
		script.async = true;
		ref.parentNode.insertBefore( script, ref );
		if (cb && typeof(cb) === "function") {
			script.onload = cb;
		}
		return script;
	};
	// commonjs
	if( typeof module !== "undefined" ){
		module.exports = loadJS;
	}
	else {
		w.loadJS = loadJS;
	}
}( typeof global !== "undefined" ? global : this ));


// Данные о изображениях
var images = {};
var loadedImages = 0;
var numImages = 0;

var sourceImages = {
//background: "images/background.svg",
background: "images/background.png",
lchassis: "images/tank/light/chassis.svg",
lturret: "images/tank/light/turret.svg",
mchassis: "images/tank/medium/chassis.svg",
mturret: "images/tank/medium/turret.svg",
hchassis: "images/tank/heavy/chassis.svg",
hturret: "images/tank/heavy/turret.svg",
bullet: "images/bullet.svg",
death: "images/death.png",
};

// Данные о JS 
var loadedJS = 0;
var numJS = 0;
var sourceJS = {
limit: "js/vendor/limit.js", // первый загружается??

// heavy_chassis: "images/tank/heavy/chassis.js",
// heavy_turret: "images/tank/heavy/turret.js",
//
// medium_chassis: "images/tank/medium/chassis.js",
// medium_turret: "images/tank/medium/turret.js",
//
// light_chassis: "images/tank/light/chassis.js",
// light_turret: "images/tank/light/turret.js",

update: "js/update.js",
game: "js/game.js",
ui: "js/ui.js",
background: "js/background.js",
render: "js/render.js",
control: "js/control.js",

//p2: "js/vendor/p2.js",
//physics: "js/physics.js",

env: "js/env.js"
};

// Подсчет загружаемых файлов
for(var src in sourceImages) {
	numImages++;
}
for(var src in sourceJS) {
	console.log(src);
	numJS++;
}

for(var src in sourceImages) {
  images[src] = new Image();
  images[src].src = sourceImages[src];
  images[src].onload = function () {
    loadedImages++;
		Loading();
  };
}
for(var src in sourceJS) {
  loadJS(sourceJS[src],function () {
    loadedJS++;
		Loading();
  });
}

function Loading() {
	if(loadedJS+loadedImages == numJS+numImages) {
		document.body.classList.add('active');
	}
	document.getElementById('progress--after').style.width
	=Math.round((loadedJS+loadedImages)/(numJS+numImages)*100) + '%';
	console.log(Math.round((loadedJS+loadedImages)/(numJS+numImages)*100) + "% resource loaded");
}
var worker = new Worker('js/worker.js');
