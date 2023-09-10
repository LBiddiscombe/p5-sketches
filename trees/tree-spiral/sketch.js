document.title = 'Spiral Tree';

function setup() {
  createCanvas(400, 400);
  colorMode(HSL);
}

function draw() {
  background(255);

  const r1 = 100;
  const r2 = 50;
  const maxy = height * 0.75;
  const trunkWidth = 16;

  let x = width * 0.5;
  let a = -PI / 2;

  for (let y = height; y >= 0; y -= 0.1) {
    const branchChance = random(map(y, 0, height, 2, 0.2)) < 0.1;
    const w = map(y, 0, height, 0.1, 2);
    const dx = cos(a) * r1 * w;
    const dy = sin(a) * r2 * w;

    if (branchChance & y < height * 0.75) {
      strokeWeight(map(y, 0, height, 1, trunkWidth / 2));
      stroke(140, 60, random(30, 40));
      line(x, y, x + dx, y + dy);
    }

    stroke(0, 60, 40);
    strokeWeight(map(y, 0, height, 1, trunkWidth));
    point(x, y);
    a += random(0.01, 0.1);
    x += random(-0.4, 0.4);

  }

  noLoop();
}
