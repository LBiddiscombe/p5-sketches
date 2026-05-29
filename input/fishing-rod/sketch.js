let fish, rod, rope;

function setup() {
  createCanvas(400, 600);
  rod = createRod();
  fish = createFish(2);
  rope = createRope(5);
}

function update() {
  const netForce = (rod.pull * rope.weight) - (fish.pull * fish.weight * fish.stamina)
  let dy = constrain(netForce * deltaTime * 0.01, -2, 5)
  fish.y += dy
  if (fish.y < 0) fish.y = 0;

}

function draw() {
  background(200);
  camera.on();
  camera.zoom = 1


  // HUD goes here
  camera.off();
  stroke(0)
  text((fish.weight * fish.stamina) / rope.weight, 20, 20)
  line(2, height, 2, map(rod.pull, 0, 1, height, 0))
  line(width - 2, height / 2, width - 2, map(fish.pull, 0, 1, height, 0, true))
  line(0, 2, map(fish.stamina, 0, 1, 0, width), 2)
  line(0, height - 2, map(rope.tension, 0, 1, 0, width), height - 2)
}
