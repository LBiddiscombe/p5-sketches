document.title = 'Spiral Tree';

function setup() {
  createCanvas(400, 400);
  colorMode(HSL);
}

function draw() {
  background(255);

  let x = width * 0.5;
  let r1 = 100;
  let a = -PI / 2;
  const da = random(0.01, 0.1);
  const maxy = height * 0.75;
  const trunkWidth = 16;


  stroke(0, 60, 40);
  strokeWeight(trunkWidth);
  line(width / 2, maxy, width / 2, height);

  for (let y = maxy; y >= 0; y -= 0.1) {
    const branchChance = random(map(y, 0, height, 2, 0.2)) < 0.1;
    const droop = map(y, 0, height, 10, 70);
    const w = map(y, 0, height, 0.1, 2);
    const dx = cos(a) * r1 * w;

    if (branchChance) {
      strokeWeight(map(y, 0, height, 1, trunkWidth / 2));
      stroke(140, 60, random(30, 40));
      line(x, y, x + dx, y + droop);
    }

    stroke(0, 60, 40);
    strokeWeight(map(y, 0, height, 1, trunkWidth));
    point(x, y);
    a += da;
    x += random(-0.4, 0.4);

  }

  noLoop();
}
