document.title = 'Basic Vehicle Flee';

let vehicle;
function setup() {
  createCanvas(400, 400);
  vehicle = new Vehicle(width / 2, height / 2);
}

function draw() {
  background(240);

  const target = createVector(mouseX, mouseY);
  fill(127);
  circle(target.x, target.y, 50);

  vehicle.flee(target);
  vehicle.update();
  vehicle.bounceEdges();
  vehicle.show();

}
