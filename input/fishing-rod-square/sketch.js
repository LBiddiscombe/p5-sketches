document.title = 'Fishing Rod Square';

let fish, angler, bank, anglerImg, lakeImg
let overTensionTime = 0;
let state = 'active';

function preload() {
  anglerImg = loadImage('./assets/angler.svg');
  lakeImg = loadImage('./assets/lake.jpeg');
}

function setup() {
  createCanvas(400, 400);

  bank = new Sprite(width / 2, height, width * 3, height / 3);
  bank.visible = false;

  angler = createAngler({ rodMultiplier: 2.0, tackleStrength: 100 });
  fish = createFish({ weight: 200, pattern: [1, 1, 0, 0] });
}

function drawWater() {
  image(lakeImg, 0, 0, width, height);

  noFill();
  for (let i = 0; i < 6; i++) {
    let yBase = 2 + i * 3;
    let a = map(i, 0, 5, 35, 5);
    stroke(160, 215, 240, a);
    strokeWeight(2.0 - i * 0.3);
    beginShape();
    for (let x = 0; x <= width; x += 6) {
      let y = yBase
        + sin(x * 0.025 + frameCount * 0.012 + i * 1.5) * 2.0
        + sin(x * 0.06 - frameCount * 0.006 + i * 2.5) * 0.8;
      vertex(x, y);
    }
    endShape();
  }

  noStroke();
  for (let i = 0; i < 10; i++) {
    let x = noise(i * 3.1 + frameCount * 0.003) * width;
    let y = noise(i * 3.1 + 50 + frameCount * 0.005) * 30;
    let s = noise(i * 3.7 + frameCount * 0.008) * 12 + 3;
    fill(200, 235, 255, 10);
    ellipse(x, y, s, s * 0.2);
  }
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
  drawWater();

  camera.on();

  stroke(0)
  strokeWeight(0.1)
  if (state === 'active') {
    line(fish.x, fish.y, angler.rodEnd.x, angler.rodEnd.y)
  }

  if (state === 'active') {
    let gaugeY = constrain(fish.y - 20, 8, height - 20);
    let offscreen = fish.y < 28 && fish.isPulling;
    if (offscreen) {
      noFill();
      stroke(255, 200, 50);
      strokeWeight(2);
      rect(fish.x - 17, gaugeY - 2, 34, 12);
    }
    fill(255);
    noStroke();
    rect(fish.x - 15, gaugeY, 30, 8);
    fill(lerpColor(color(64, 255, 0), color(255, 64, 0), angler.tension));
    rect(fish.x - 15, gaugeY, 30 * min(angler.tension, 1), 8);
  }

  camera.off();

  fill(255);
  noStroke();
  textSize(12);
  textAlign(LEFT, TOP);
  text(`tackle: ${angler.tackleStrength}kg`, 8, 8);
  textAlign(RIGHT, TOP);
  text(`fish: ${fish.weight}g`, width - 8, 8);
  if (fish.isPulling) {
    fill(255, 200, 50);
    circle(width - 8, 22, 6);
  } else {
    fill(100);
    circle(width - 8, 22, 6);
  }

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
    scale(0.625);
    rotate(angler.a * 2 * angler.pull);
    stroke(0);
    strokeWeight(16);
    line(-20, -20, 0, -60);
    line(20, -20, 0, -60);
    translate(0, -60);
    angler.drawSection(120, 6, angler.pull);
    pop();

    push();
    scale(0.625);
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
