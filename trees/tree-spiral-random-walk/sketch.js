document.title = 'Spiral Tree';

function setup() {
  createCanvas(400, 400);
  colorMode(HSL);
}

function draw() {
  background(255);

  let x = width * 0.5;
  let r1 = 100;
  let r2 = 50;
  let a = -PI / 2;
  const da = 0.3;
  const maxy = height * 0.75;
  const trunkWidth = 16;


  stroke(0, 60, 40);
  strokeWeight(trunkWidth);
  line(width / 2, maxy, width / 2, height);

  for (let y = maxy; y >= 0; y -= 0.1) {
    const branchChance = random(map(y, 0, height, 2, 0.2)) < 0.07;
    const w = map(y, 0, height, 0.1, 1.5);
    const dx = cos(a) * r1 * w;
    const dy = sin(a) * r2 * w;

    const tw = map(y, 0, height, 1, 16);
    strokeWeight(tw);
    point(x, y);

    if (branchChance) {
      const pos = createVector(x, y);
      const walk = createVector(dx, dy);
      walk.normalize();
      stroke(140, 60, random(30, 40));

      for (let i = 0; i < abs(dx); i++) {
        strokeWeight(tw / 4);
        point(pos.x, pos.y);
        pos.add(walk);
        walk.rotate(random(-0.1, 0.1));
      }

      a += da;
      x += random(-0.4, 0.4);
    }
    stroke(0, 60, 40);
    strokeWeight(map(y, 0, height, 1, trunkWidth));
    point(x, y);

  }

  noLoop();
}
