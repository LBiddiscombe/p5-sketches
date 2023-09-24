class Spring {
  constructor(particleA, particleB, restLength, stiffness) {
    this.particleA = particleA;
    this.particleB = particleB;
    this.restLength = restLength;
    this.stiffness = stiffness;
    this.damping = .05;
  }

  update() {
    const displacement = p5.Vector.sub(this.particleA.position, this.particleB.position);
    const distance = displacement.mag();
    const distention = distance - this.restLength;
    const restorativeForce = this.stiffness * distention;

    const force = p5.Vector.mult(p5.Vector.div(displacement, distance), restorativeForce);
    this.particleA.applyForce(p5.Vector.mult(force, -1));
    this.particleB.applyForce(force);

    const dampingForce = p5.Vector.mult(p5.Vector.sub(this.particleA.velocity, this.particleB.velocity), this.damping);
    this.particleA.applyForce(p5.Vector.mult(dampingForce, -1));
    this.particleB.applyForce(dampingForce);
  }

  display() {
    const x1 = this.particleA.position.x;
    const y1 = this.particleA.position.y;
    const x2 = this.particleB.position.x;
    const y2 = this.particleB.position.y;

    stroke(255);
    line(x1, y1, x2, y2);
  }
}