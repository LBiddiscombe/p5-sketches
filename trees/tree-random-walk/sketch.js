document.title = 'Random Walk Tree';

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  let x = width / 2;

  for (let y = height; y > 0; y--) {
    const branchChance = random(map(y, 0, height, 1, 0.2)) < 0.2;

    const tw = map(y, 0, height, 1, 16);
    strokeWeight(tw);
    point(x, y);
    if (branchChance && y < height * 0.85) {
      const dx = map(y, 0, height, 0, 100);
      const pos = createVector(x, y);
      const walk = random() < 0.5 ? createVector(1, 0) : createVector(-1, 0);

      for (let i = 0; i < dx; i++) {
        strokeWeight(tw / 4);
        point(pos.x, pos.y);
        pos.add(walk);
        walk.y += random(-0.1, 0.1);
      }
    }

    x += random(-0.4, 0.4);
  }

  noLoop();
}
