let fish, angler, bank, anglerImg, waterImg
let overTensionTime = 0;
let state = 'active'; // 'active', 'caught', 'escaped'

function preload() {
  anglerImg = loadImage('./assets/angler.svg');
  waterImg = loadImage('./assets/water.png');
}

function setup() {
  createCanvas(400, 600);
  bank = new Sprite(width / 2, height, width * 3, height / 3);
  bank.visible = false;

  angler = createAngler({ rodMultiplier: 2.0, tackleStrength: 100 });
  fish = createFish({ weight: 200, pattern: [1, 1, 0, 0] });
}

function update() {
  if (mouseIsPressed) {
    fish.y += map(angler.tension, 0, 1, 2, 0.1, true);
    if (mouseX <= width && mouseX >= 0 && mouseY <= height && mouseY >= 0) {
      fish.x = lerp(fish.x, mouseX, deltaTime / 5000);
    }
  }

  if (fish.collides(bank)) {
    state = 'caught';
  }

  if (angler.tension >= 1.0) {
    overTensionTime = overTensionTime + deltaTime;
  } else {
    overTensionTime = 0;
  }

  if (overTensionTime >= 500) {
    state = 'escaped';
  }
}

function draw() {
  image(waterImg, 0, 0, width, height);

  camera.on();

  // draw the line
  stroke(0)
  strokeWeight(0.1)
  if (state === 'active') {
    line(fish.x, fish.y, angler.rodEnd.x, angler.rodEnd.y)
  }

  // draw the tension meter
  if (state === 'active') {
    fill(255);
    rect(fish.x - 15, fish.y - 20, 30, 8);
    fill(lerpColor(color(64, 255, 0), color(255, 64, 0), angler.tension));
    rect(fish.x - 15, fish.y - 20, 30 * min(angler.tension, 1), 8);
  }


  // HUD goes here
  camera.off();
  if (state !== 'active') {
    textSize(32);
    fill(0);
    textAlign(CENTER, CENTER);
    if (state === 'caught') {
      text('You caught the fish!', width / 2, height / 2);
    } else if (state === 'escaped') {
      text('The fish escaped!', width / 2, height / 2);
    }
    noLoop();
  }
}

function createAngler(options = {}) {
  const angler = new Sprite(width / 2, height);
  angler.physics = "none";
  angler.layer = 2;
  angler.rodMultiplier = options.rodMultiplier ?? 1.0;
  angler.tackleStrength = options.tackleStrength ?? 100;
  angler.xoff = 0.0;

  angler.pull = 0;
  angler.pressure = 0;
  angler.tension = 0;
  angler.a = 0;
  angler.rodEnd = { x: 0, y: 0 };

  angler.update = () => {
    angler.xoff += 0.1;
    if (mouseX <= width && mouseX >= 0 && mouseY <= height && mouseY >= 0) {
      angler.a = map(mouseX, 0, width, -30, 30, true);

      if (mouseIsPressed) {
        angler.pull = lerp(angler.pull, 2, deltaTime / 400);
        angler.pressure = angler.pull * fish.pull * fish.stamina * fish.weight;
      } else {
        angler.pull = lerp(angler.pull, 1, deltaTime / 200);
        angler.pressure = fish.pull * fish.stamina * fish.weight;
      }
    }

    angler.tension = angler.pressure / (angler.tackleStrength * angler.rodMultiplier);
    angler.a += map(noise(angler.xoff), 0, 1, -1, 1);
  }

  angler.draw = () => {
    push();
    rotate(angler.a * 2 * angler.pull);
    stroke(0);
    strokeWeight(16);
    line(-20, -20, 0, -60);
    line(20, -20, 0, -60);
    translate(0, -60);
    angler.drawSection(120, 6, angler.pull);
    pop();

    push();
    rotate(angler.a / 2);
    image(anglerImg, 0, 0, 128, 256);
    pop();
  };

  angler.drawSection = (h, sw, power) => {
    h *= 0.7;
    sw *= 0.8;

    if (h > 10) {
      push();
      rotate((-angler.a / 2) * power);
      strokeWeight(sw);
      line(0, 0, 0, -h);
      translate(0, -h);
      angler.drawSection(h, sw, power);
      pop();
    } else {
      // recursion ends here → record global position
      let m = drawingContext.getTransform();
      let sx = (m.e - width + width * camera.zoom) / camera.zoom;
      let sy = (m.f - height + height * camera.zoom) / camera.zoom;
      angler.rodEnd = {
        x: sx / 2,
        y: sy / 2
      };
    }
  };

  return angler;
}

function createFish(options = {}) {
  const fish = new Sprite(width * 0.5, height * 0.1, 20);
  fish.layer = 1;
  fish.weight = options.weight ?? 16;
  fish.pattern = options.pattern ?? [1, 0, 0];
  fish.stamina = 1;
  fish.isPulling = fish.pattern[0] > 0;
  fish.pull = 0;

  fish.xoff = 1000;

  const splash = new Group();
  splash.layer = 1;
  splash.diameter = () => random(2, 5);
  splash.physics = "none";
  splash.x = () => fish.x;
  splash.y = () => fish.y;
  splash.heading = () => random(0, 360);
  splash.speed = () => random(1, 3);
  splash.life = random(3, 5);
  splash.color = "dodgerblue";
  splash.strokeWeight = 0;
  let dt = 0;
  let i = 0;

  fish.update = () => {

    //every second based on the fish.pattern array lerp the fish.pull value to the next value in the array
    dt += deltaTime;
    if (dt >= 1000) {
      i = (i + 1) % fish.pattern.length;
      dt = 0;
      fish.isPulling = fish.pattern[i] > 0;
    }
    fish.pull = lerp(fish.pull, fish.pattern[i], deltaTime / 400);

    fish.x += (noise(fish.xoff) - 0.5) * map(fish.weight, 1, 1000, 1, 20);
    fish.y -= fish.pull * 0.5;
    fish.stamina -= fish.pull * deltaTime * 0.00001;
    fish.stamina = max(fish.stamina, 0.1);
    fish.xoff += 0.01;
  };

  fish.draw = () => {
    if (state !== 'active') {
      fish.visible = false;
      splash.visible = false;
      return;
    }

    noFill();
    strokeWeight(1);

    stroke(150);
    circle(0, 0, 5);
    if (fish.isPulling) splash.amount += 10;

  };

  return fish;
}