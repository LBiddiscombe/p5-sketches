function createFish(weight = 1) {
  const fish = new Sprite(width * 0.5, height * 0.25, 20);
  fish.weight = weight;
  fish.stamina = 1;
  fish.pull = 0;
  fish.xoff = 1000;
  fish.yoff = 0;

  fish.update = () => {
    fish.x += (noise(fish.xoff) - 0.5) * 2;
    fish.pull = noise(fish.yoff);
    fish.y += (fish.pull - 0.5) * 2;
    fish.stamina -= fish.pull / 1000;
    fish.stamina = max(fish.stamina, 0.1);
    fish.xoff += 0.01;
    fish.yoff += 0.1;
  };

  fish.draw = () => {
    noFill();
    let r = (frameCount / 10) % 10;
    stroke(map(r, 0, 10, 100, 200));
    circle(0, 0, r);
    stroke(map(10 - r, 0, 10, 100, 200));
    circle(0, 0, 10 - r);
    stroke(0);
  };

  return fish;
}
