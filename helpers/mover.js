/* 
  A basic mover class based on the nature of code book by Dan Shiffman, 
  with some typical additions such as wrapping or bouncing edges.

  Usage: Copy this as a template, paste it and modify it in your own code.
*/

class Mover {
  constructor(x, y, mass = 1) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = mass;
    this.radius = mass * 4;

  }
  // Newton's 2nd law: F = M * A 
  // or A = F / M
  applyForce(force) {
    let f = createVector();
    f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  wrapEdges() {
    const { x, y } = this.position;

    this.position.x = (x > width) ? 0 : (x < 0) ? width : x;
    this.position.y = (y > height) ? 0 : (y < 0) ? height : y;
  }

  bounceEdges() {
    const { x, y } = this.position;
    const { radius, velocity } = this;

    if (x + radius > width || x - radius < 0) {
      velocity.x *= -1;
      x += velocity.x;
    }

    if (y + radius > height || y - radius < 0) {
      velocity.y *= -1;
      y += velocity.y;
    }
  }

  show() {
    fill(0);
    circle(this.position.x, this.position.y, this.radius * 2);
  }
}
