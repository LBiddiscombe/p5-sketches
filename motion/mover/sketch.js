document.title = 'Basic Mover';

let mover;
function setup() {
  createCanvas(400, 400);
  mover = new Mover(width / 2, height / 2);
}

function draw() {
  background(240);

  const force = p5.Vector.random2D();
  force.setMag(0.1);
  mover.applyForce(force);

  mover.update();
  mover.bounceEdges();
  mover.show();

}
