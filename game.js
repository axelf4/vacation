"use strict";
var Position = function(x, y) {
	this.x = x;
	this.y = y;
};

var Shape = function() {
	this.color = "green";
	this.width = 10;
	this.height = 10;
};

var Lifetime = function(start) {
	this.remaining = this.start = start;
};

var Direction = function() {
	this.direction = 0;
}

var Velocity = function(value) {
	this.value = value;
}

var ParticleEmitter = function(size, color, lifetime, spawnrate) {
	this.size = size;
	this.color = color;
	this.lifetime = lifetime;
	this.spawnrate = spawnrate || 100;
	this.randomY = false;
};

var Enemy = function() {};

var Shrink = function(min, max) {
	this.min = min;
	this.max = max;
	this.timer = 0;
};

var Acceleration = function() {
	this.x = 0;
	this.y = 0;
};

var Velocity2 = function() {
	this.x = 0;
	this.y = 0;
};

var Laser = function() {
	this.x = Math.random() * 800;
	this.timer = 0;
};

var canvas, ctx;
var lastTime;
var keys = [];

var player;
var score = 0;
var level = 0;

var STATE_MAINMENU = 0
var STATE_INGAME = 1;
var state = STATE_MAINMENU;
var scoreNeededToAdvance = [20, 40, 60, 90, 500];
var mainMenuText = [
	["Escape or the eveil red blobs will rape you!!1", "Press space to start your nightmare :)"], // Level 1
	["YOU are level 2 now beatsch!11", "Press space to start your nightmare #2 :)"], // Level 2
	["Dipshit you will never beat deas levels!21", "Press space to die :)"], // Level 3
	["You think you have the guts to face me?!", "Just press space, ok??!2"], // Level 4
	["Fuck you.", "You have beaten the game."]];

var MOVEMENT_SPEED = 5, enemySpeed, enemySpawnrate;
var HELLMODE_IN;
var LASER_LETHAL = 100;

var textGradient;

var init = function() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	textGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
	textGradient.addColorStop("0", "magenta");
	textGradient.addColorStop("0.5", "blue");
	textGradient.addColorStop("1", "red");
	fowl.registerComponents(Position,
			Shape,
			Lifetime,
			Direction,
			Velocity,
			ParticleEmitter,
			Enemy,
			Shrink,
			Acceleration,
			Velocity2,
			Laser);
	update();
};

var newGame = function() {
	state = STATE_INGAME;
	enemySpeed = 2;
	enemySpawnrate = 90;
	HELLMODE_IN = 500;

	player = fowl.createEntity();
	fowl.addComponent(player, new Position(800 / 2, 600 / 2));
	fowl.addComponent(player, new Shape());
	fowl.addComponent(player, new ParticleEmitter(10, "green", 30));
	fowl.addComponent(player, new Shrink(10, 100));
	fowl.addComponent(player, new Velocity2());
};
var drawLasers = function(entity) {
	var laser = fowl.getComponent(entity, Laser);
	var width = 60 * Math.min(100, laser.timer) / 100;
	if (laser.timer < 100) ctx.strokeStyle = "lightgreen";
	else {
		var g2 = ctx.createLinearGradient(laser.x - width, 0, laser.x + width, 0);
		g2.addColorStop("0", "lightgreen");
		g2.addColorStop("0.5", "red");
		g2.addColorStop("1", "lightgreen");
		ctx.strokeStyle = g2;
	}
	if (laser.timer < LASER_LETHAL - 5 || laser.timer > LASER_LETHAL) {
		ctx.beginPath();
		ctx.moveTo(laser.x, 0);
		ctx.lineWidth = width;
		ctx.lineTo(laser.x, 600);
		ctx.stroke();
	}
};

var drawShapes = function(entity) {
	var position = fowl.getComponent(entity, Position),
		shape = fowl.getComponent(entity, Shape),
		lifetime = fowl.getComponent(entity, Lifetime);
	ctx.globalAlpha = lifetime ? lifetime.remaining / lifetime.start : 1;
	ctx.fillStyle = shape.color;
	ctx.fillRect(position.x, position.y, shape.width, shape.height);
};

var render = function() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1;
	if (state == STATE_MAINMENU) {
		ctx.fillStyle = textGradient;
		ctx.font = "30px Verdana";
		ctx.fillText(mainMenuText[level][0], 50, 200);
		ctx.font = "24px Serif";
		ctx.fillText(mainMenuText[level][1], 70, 270);
		ctx.fillText("Get a score of " + scoreNeededToAdvance[level] + " to advance to lv " + (level + 2), 70, 320);
	} else if (state == STATE_INGAME) {
		// Draw lasers
		fowl.each(drawLasers, Laser);
		// Draw shapes
		fowl.each(drawShapes, Position, Shape);
		if (HELLMODE_IN <= 0) {
			ctx.fillStyle = textGradient;
			ctx.font = "30px Verdana";
			ctx.fillText("HELLMODE ACTIVATE PREPARE YOUR ANUS", 50 + Math.random() * 20, 200 + Math.random() * 20);
			if (HELLMODE_IN <= -350) {
				ctx.fillText("YOu WIlL PeRIsH iN Laz0rs", 50 + Math.random() * 40, 300 + Math.random() * 40);
			}
		}
	}
};

var updatePlayer = function(dt) {
	var position = fowl.getComponent(player, Position);
	if (level < 3) {
		if ((keys[65] || keys[37]) && position.x > 0) position.x -= MOVEMENT_SPEED * dt;
		if ((keys[87] || keys[38]) && position.y > 0) position.y -= MOVEMENT_SPEED * dt;
		if ((keys[68] || keys[39]) && position.x < 800) position.x += MOVEMENT_SPEED * dt;
		if ((keys[83] || keys[40]) && position.y < 600) position.y += MOVEMENT_SPEED * dt;
	} else {
		var acceleration = new Acceleration();
		var velocity = fowl.getComponent(player, Velocity2);
		var k = 20;
		if (keys[65]) acceleration.x -= MOVEMENT_SPEED / k * dt;
		if (keys[87]) acceleration.y -= MOVEMENT_SPEED / k * dt;
		if (keys[68]) acceleration.x += MOVEMENT_SPEED / k * dt;
		if (keys[83]) acceleration.y += MOVEMENT_SPEED / k * dt;
		position.x += dt * (velocity.x + dt * acceleration.x / 2);
		position.y += dt * (velocity.y + dt * acceleration.y / 2);
		velocity.x += dt * acceleration.x;
		velocity.y += dt * acceleration.y;
		if (position.x < 0 || position.x > 800) acceleration.x = 0;
		if (position.y < 0 || position.y > 600) acceleration.y = 0;
		position.x = Math.min(800, Math.max(0, position.x));
		position.y = Math.min(600, Math.max(0, position.y));
	}

	if (level >= 2 && HELLMODE_IN <= -400) {
		var shrink = fowl.getComponent(player, Shrink);
		shrink.timer += dt / 3 * 3;
		var test = (shrink.timer % (shrink.max - shrink.min)) / (shrink.max - shrink.min);
		if (test > 0.5) test = 1 - test;
		var size = shrink.min + ((shrink.max - shrink.min) * Math.sin(test));
		var shape = fowl.getComponent(player, Shape);
		var oldSize = shape.width;
		shape.width = shape.height = size;
		position += (size - oldSize) / 2 * 2;
	}
};

var spawnEnemy = function(x, y, direction) {
	var enemy = fowl.createEntity();
	var shape = fowl.addComponent(enemy, new Shape());
	shape.color = "red";
	shape.width = shape.height = 30;
	fowl.addComponent(enemy, new Position(x, y));
	fowl.addComponent(enemy, new Direction()).direction = direction;
	fowl.addComponent(enemy, new Lifetime(500));
	fowl.addComponent(enemy, new Velocity(enemySpeed));
	fowl.addComponent(enemy, new ParticleEmitter(20, "red", 60, 40));
	fowl.addComponent(enemy, new Enemy());
}

var updateEnemies = function(dt) {
	if (Math.random() * 100 * dt < enemySpawnrate) return;
	var x, y, direction, pad = 50;

	direction = Math.random() * 360;
	if (direction < 135 && direction >= 45) {
		x = Math.random() * 800;
		y = 0 - pad;
	} else if (direction < 225 && direction >= 135) {
		x = 800 + pad;
		y = Math.random() * 600;
	} else if (direction < 315 && direction >=225) {
		x = Math.random() * 800;
		y = 600 + pad;
	} else {
		x = 0 - pad;
		y = Math.random() * 600;
	}
	spawnEnemy(x, y, direction);
};

var updateLasers = function(dt) {
	// Spawn lasers
	if (level >= 1 && Math.random() * 100 < 0.1 * dt) {
		var laser = fowl.createEntity();
		fowl.addComponent(laser, new Laser());
	}
	fowl.each(function(entity) {
		var laser = fowl.getComponent(entity, Laser);
		laser.timer += dt;
		if (laser.timer > LASER_LETHAL + 40) {
			fowl.removeEntity(entity);
			for (var i = 0; i < 30; i++) {
				spawnEnemy(laser.x, Math.random() * 600, Math.random() * 360);
			}
		}
	}, Laser);
};

var rectangleInside = function(x1, y1, width1, height1, x2, y2, width2, height2) {
	// if (pos1.x < pos2.x + shape2.width
	// && pos1.x + shape1.width > pos2.x
	// && pos1.y < pos2.y + shape2.height
	// && pos1.y + shape1.height > pos2.y) {
	return !(x1 > x2 + width2
			|| x1 + width1 < x2
			|| y1 > y2 + height2
			|| y1 + height1 < y2);
};

var playerCollision = function(dt) {
	var collision = false;
	var pos1 = fowl.getComponent(player, Position),
		shape1 = fowl.getComponent(player, Shape);
	fowl.each(function(entity) {
		var pos2 = fowl.getComponent(entity, Position),
		shape2 = fowl.getComponent(entity, Shape);

	if (rectangleInside(pos1.x, pos1.y, shape1.width, shape1.height, pos2.x, pos2.y, shape2.width, shape2.height)) {
		collision = true;
	}
	}, Enemy, Position, Shape);
	fowl.each(function(entity) {
		var laser = fowl.getComponent(entity, Laser);
		if (laser.timer > LASER_LETHAL) {
			var shape2 = new Shape();
			shape2.width = 100;
			shape2.height = 600;
			var pos2 = new Position(laser.x - shape2.width / 2, 0);
			var width = 100,
		height = 600,
		x = laser.x - width / 2,
		y = 0;

	if (rectangleInside(pos1.x, pos1.y, shape1.width, shape1.height, x, y, width, height)) {
		collision = true;
	}
		}
	}, Laser);
	if (collision) {
		console.log("you dead bro");
		reset();
		--level;
		if (level <= 0) {
			score = 0;
			level = 0;
		} else score = scoreNeededToAdvance[level - 1];
	}
}

	var updateScore = function() {
		document.getElementById("score").innerText = "Score: " + Math.floor(score);
	};

	var reset = function() {
		fowl.clear();
		state = STATE_MAINMENU;
	};

	var update = function(time) {
		var dt = time - lastTime;
		dt /= 20;
		lastTime = time;
		if (state === STATE_MAINMENU) {
			if (keys[32]) {
				newGame();
			}
		} else if (state === STATE_INGAME) {
			updateScore();
			updatePlayer(dt);
			updateEnemies(dt);
			updateLasers(dt);
			fowl.each(function(entity) {
				var position = fowl.getComponent(entity, Position),
				direction = fowl.getComponent(entity, Direction),
				velocity = fowl.getComponent(entity, Velocity);
			position.x += Math.cos(direction.direction) * (velocity ? velocity.value : 1) * dt;
			position.y -= Math.sin(direction.direction) * (velocity ? velocity.value : 1) * dt;
			}, Position, Direction);
			fowl.each(function(entity) {
				var lifetime = fowl.getComponent(entity, Lifetime);
				lifetime.remaining -= dt;
				if (lifetime.remaining <= 0) fowl.removeEntity(entity);
			}, Lifetime);
			fowl.each(function(entity) {
				var position = fowl.getComponent(entity, Position),
					emitter = fowl.getComponent(entity, ParticleEmitter);
				if (Math.random() * 100 * dt < 100 - emitter.spawnrate) return;
				var particle = fowl.createEntity();
				var lifetime = fowl.addComponent(particle, new Lifetime(emitter.lifetime));
				// var lifetime2 = fowl.getComponent(entity, "Lifetime");
				// if (lifetime2) lifetime.remaining = emitter.lifetime * lifetime2.remaining / lifetime2.start;
				var position = fowl.addComponent(particle, new Position(position.x, position.y));
				if (emitter.randomY) position.y = Math.random() * 600;
				var shapeParent = fowl.getComponent(entity, Shape);
				fowl.addComponent(particle, new Direction()).direction = Math.random() * 360;
				var shape = fowl.addComponent(particle, new Shape());
				shape.width = shape.height = emitter.size;
				shape.color = emitter.color;

				if (shapeParent) {
					position.x += shapeParent.width / 2 - shape.width / 2;
					position.y += shapeParent.height / 2 - shape.height / 2;
				}
			}, Position, ParticleEmitter);
			playerCollision();

			// Up the difficulty
			if (HELLMODE_IN > -500) --HELLMODE_IN;
			else {
				enemySpeed += 0.01 * dt;
				enemySpawnrate -= 0.1 * dt;
			}

			if (Math.random() > 0.99) score += dt;
			if (score >= scoreNeededToAdvance[level]) {
				reset();
				++level;
			}
		}
		render();
		window.requestAnimationFrame(update);
	};

	window.onload = function() {
		init();
	};

	document.onkeydown = function(e) {
		e = e || window.event;
		keys[e.keyCode] = true;
	};

	document.onkeyup = function(e) {
		e = e || window.event;
		keys[e.keyCode] = false;
	};
