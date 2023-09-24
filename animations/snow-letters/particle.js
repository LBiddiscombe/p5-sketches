/* 
  A basic particle class based on the nature of code book by Dan Shiffman, 
  with some additions such as wrapping or bouncing edges.

  Usage: Copy this as a template, paste it and modify it in your own code.
*/

class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.radius = float(random(5));
    this.isStopped = false;

  }
  // Newton's 2nd law: F = M * A 
  // or A = F / M
  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    if (this.stopped) return;
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  overlaps(pt) {
    return this.position.dist(pt.position) < pt.radius;
  }

  wrapEdges() {
    const { x, y } = this.position;

    this.position.x = (x > width) ? 0 : (x < 0) ? width : x;
    this.position.y = (y > height) ? 0 : y;
  }

  limitVelocities() {
    // Calculate the magnitude of the velocity
    let velocityMagnitude = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);

    // Set the maximum speed
    let maxSpeed = 1;

    // If the velocity magnitude is greater than the maximum speed, limit the velocity
    if (velocityMagnitude > maxSpeed) {
      this.velocity.mult(maxSpeed / velocityMagnitude);
    }
  }

  stop() {
    this.stopped = true;
  }


  show() {
    noStroke();
    fill(250);
    circle(this.position.x, this.position.y, this.radius * 2);
  }
}