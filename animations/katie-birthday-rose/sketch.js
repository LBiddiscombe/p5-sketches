document.title = 'Katie Birthday Rose';

let v = [];
let cols = 600, rows = 30;

let t_D = 180 * 15 / cols;
let r_D = 1 / rows;

const gifFrames = 150;
let pg;

const openingRange = [10, 2];
const vDensity = 8;
const pAlign = 3.6;
const curve1Range = [-6, 2];
const curve2Range = [1.4, 1.3];

let canvas;
let count = 0;

function setup() {
  canvas = createCanvas(700, 800, WEBGL);
  pg = createGraphics(700, 800);

  colorMode(HSB);
  angleMode(DEGREES);
  noStroke();

  //ßsaveGif('mySketch', gifFrames, {units: 'frames'});

}

function draw() {
  clear();
  orbitControl(4, 4);//3D mouse control

  const opening = map(frameCount, 0, gifFrames, openingRange[0], openingRange[1], true);
  const curve1 = map(frameCount, 0, gifFrames, curve1Range[0], curve1Range[1], true);
  const curve2 = map(frameCount, 0, gifFrames, curve2Range[0], curve2Range[1], true);

  // const opening = openingRange[1]
  // const curve1 = curve1Range[1]
  // const curve2 = curve2Range[1]

  drawMessage();

  rotateX(-35);

  for (let r = 0; r <= rows; r++) {
    v.push([]);
    for (let theta = 0; theta <= cols; theta++) {
      let phi = (180 / opening) * Math.exp(-theta * t_D / (vDensity * 180));
      let petalCut = 1 - (1 / 2) * pow((5 / 4) * pow(1 - ((pAlign * theta * t_D % 360) / 180), 2) - 1 / 4, 2);
      let hangDown = curve1 * pow(r * r_D, 2) * pow(curve2 * r * r_D - 1, 2) * sin(phi);

      let pX = 260 * petalCut * (r * r_D * sin(phi) + hangDown * cos(phi)) * sin(theta * t_D);
      let pY = -260 * petalCut * (r * r_D * cos(phi) - hangDown * sin(phi));
      let pZ = 260 * petalCut * (r * r_D * sin(phi) + hangDown * cos(phi)) * cos(theta * t_D);
      let pos = createVector(pX, pY + 90, pZ);
      v[r].push(pos);
    }
  }

  for (let r = 0; r < v.length; r++) {
    fill(340, 100, -20 + r * r_D * 120);
    for (let theta = 0; theta < v[r].length; theta++) {
      if (r < v.length - 1 && theta < v[r].length - 1) {
        beginShape();
        vertex(v[r][theta].x, v[r][theta].y, v[r][theta].z);
        vertex(v[r + 1][theta].x, v[r + 1][theta].y, v[r + 1][theta].z);
        vertex(v[r + 1][theta + 1].x, v[r + 1][theta + 1].y, v[r + 1][theta + 1].z);
        vertex(v[r][theta + 1].x, v[r][theta + 1].y, v[r][theta + 1].z);
        endShape(CLOSE);
      }
    }
  }

  v = [];

  // noLoop()
}

function drawMessage() {
  pg.background(50);
  pg.fill(255, map(frameCount, 0, gifFrames, 0, 255, true));
  pg.textFont('Gochi Hand');
  pg.textSize(map(frameCount, 0, gifFrames, 0, 96, true));
  pg.textAlign(CENTER);
  pg.text('Happy Birthday\nKatie', width / 2, height / 2 + (80 - height / 2) * easeOutCubic(map(frameCount, 0, gifFrames, 0, 1, true)));
  pg.text('Love Lee xxx', width / 2, height / 2 + (height - 10 - height / 2) * easeOutCubic(map(frameCount, 0, gifFrames, 0, 1, true)));
  // pg.textSize(16);
  // pg.fill(255)
  // pg.text('FPS: ' + floor(frameRate()), 30, 20);
  image(pg, -width / 2, -height / 2);
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}