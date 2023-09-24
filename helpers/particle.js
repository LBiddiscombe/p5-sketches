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
    this.radius = 4;

  }
  // Newton's 2nd law: F = M * A 
  // or A = F / M
  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  collide(other) {
    let vRelPos = p5.Vector.sub(this.position, other.position);
    let dist = vRelPos.mag() - (this.radius + other.radius);
    if (dist < 0) {

      let movement = vRelPos.copy().setMag(abs(dist / 2));
      this.position.add(movement);
      other.position.sub(movement);

      let vRelVelocity = p5.Vector.sub(this.velocity, other.velocity);
      const contactNormal = vRelPos.copy().normalize();

      const impulseMag = -(2 * vRelVelocity.dot(contactNormal));
      const impulseForce = contactNormal.copy().mult(impulseMag);

      this.applyForce(impulseForce.copy());
      other.applyForce(impulseForce.copy().mult(-1));
    }
  }

  limitVelocities() {
    // Calculate the magnitude of the velocity
    let velocityMagnitude = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);

    // Set the maximum speed
    let maxSpeed = 3;

    // If the velocity magnitude is greater than the maximum speed, limit the velocity
    if (velocityMagnitude > maxSpeed) {
      this.velocity.mult(maxSpeed / velocityMagnitude);
    }
  }

  bounceEdges() {
    const { x, y } = this.position;
    const { radius } = this;

    if (x + radius > width || x - radius < 0) {
      this.velocity.x *= -1;
      this.position.x = constrain(this.position.x, radius, width - radius);
    }

    if (y + radius > height || y - radius < 0) {
      this.velocity.y *= -1;
      this.position.y = constrain(this.position.y, radius, height - radius);
    }
  }

  show() {
    fill(0);
    circle(this.position.x, this.position.y, this.radius * 2);
  }
}