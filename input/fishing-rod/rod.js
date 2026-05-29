function createRod() {
  const rod = new Sprite(width / 2, height + 100);
  rod.physics = "none";
  rod.a = 0;
  rod.pull = 0;
  rod.xoff = 0.0;
  rod.end = { x: 0, y: 0 };

  rod.update = () => {
    rod.xoff += 0.1;
    rod.a = map(mouseX, 0, width, -30, 30);
    rod.pull = map(mouseY, height / 2, height, 0, 1, true);
    rod.a += map(noise(rod.xoff), 0, 1, -1, 1) * 3 * rod.pull;
  };

  rod.draw = () => {
    push();
    rotate(rod.a * 2 * rod.pull);
    strokeWeight(8);
    line(0, 0, 0, -120);
    translate(0, -120);
    rod.drawSection(120, 6, rod.pull);
    pop();
    //circle(rod.end.x - rod.x, rod.end.y - rod.y, 10);
  };

  rod.drawSection = (h, sw, power) => {
    h *= 0.7;
    sw *= 0.8;

    if (h > 10) {
      push();
      rotate((-rod.a / 2) * power);
      strokeWeight(sw);
      line(0, 0, 0, -h);
      translate(0, -h);
      rod.drawSection(h, sw, power);
      pop();
    } else {
      // recursion ends here → record global position
      let m = drawingContext.getTransform();
      let sx = (m.e - width + width * camera.zoom) / camera.zoom;
      let sy = (m.f - height + height * camera.zoom) / camera.zoom;
      rod.end = {
        x: sx / 2,
        y: sy / 2
      };
    }
  };

  return rod;
}
