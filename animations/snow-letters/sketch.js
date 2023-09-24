document.title = 'Snow Letters';

let font;
let points;
let flakes = [];
let gravity;
let grid;

function preload() {
  font = loadFont('./Comfortaa-VariableFont_wght.ttf');
}

function setup() {
  createCanvas(600, 600);

  gravity = createVector(0, 0.2);

  points = font.textToPoints('snowfall', 50, 350, 118, {
    sampleFactor: 0.25
  });

  grid = new Grid(width, height, 20);
  for (let i = 0; i < points.length; i++) {
    flakes.push(new Particle(random(width), random(-height, 0)));
    const pv = new Particle(points[i].x, points[i].y);
    grid.addParticle(pv);
  }

}

function draw() {
  background(51);

  // for (let pt of points) {
  //   stroke(127)
  //   strokeWeight(4)
  //   point(pt.x, pt.y);
  // }

  for (let flake of flakes) {
    if (!flake.stopped) {
      const neighbors = grid.getNeighbors(flake);

      for (let pt of neighbors) {
        if (flake.overlaps(pt)) {
          flake.stop();
          grid.removeParticle(pt);
          console.log(pt);
          flakes.push(new Particle(random(width), random(-height, 0)));
        };
      }
    }
    flake.applyForce(gravity);
    flake.applyForce(createVector(random(-0.2, 0.2), random(0, -0.3)));
    flake.update();
    flake.limitVelocities();
    flake.wrapEdges();
    flake.show();
  }

  // text('FPS: ' + floor(frameRate()), 20, 20);
  // text('Flake Count: ' + flakes.length, 100, 20);

}
