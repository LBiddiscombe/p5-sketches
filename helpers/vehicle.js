/* 
  A mover class with some additional behaviours based on the nature of code book by Dan Shiffman
*/

class Vehicle {
  _damping = 100;

  constructor(x, y, mass = 1) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = mass;
    this.radius = mass * 4;
    this.maxspeed = 5;
    this.maxforce = 0.2;
  }
  // Newton's 2nd law: F = M * A 
  // or A = F / M
  applyForce(force) {
    let f = createVector();
    f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    desired.setMag(this.maxspeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce);
    this.applyForce(steer);
  }

  flee(target) {
    let desired = p5.Vector.sub(target, this.position);
    desired.setMag(-this.maxspeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce);
    this.applyForce(steer);
  }

  arrive(target) {
    let desired = p5.Vector.sub(target, this.position);
    let d = desired.mag();

    if (d < this._damping) {
      var m = map(d, 0, this._damping, 0, this.maxspeed);
      desired.setMag(m);
    } else {
      desired.setMag(this.maxspeed);
    }

    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce);  // Limit to maximum steering force
    this.applyForce(steer);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
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
