function createRope(weight = 2) {
  const rope = new Sprite(0, 0);
  rope.weight = weight;
  rope.pressure = 0;
  rope.tension = 0.5;

  rope.update = () => {
    rope.pressure = rod.pull * fish.pull * fish.stamina * fish.weight * 2;
    rope.tension = rope.pressure / rope.weight;
  }

  rope.draw = () => {
    strokeWeight(0.1)
    line(fish.x, fish.y, rod.end.x, rod.end.y)
  }

  return rope;
}