let particles = [];
let springs = [];
let rigidity = 0.2;

function setup() {
  createCanvas(400, 400);

  const numParticlesX = 2;
  const numParticlesY = 2;
  const xSpacing = 10;
  const ySpacing = 10;

  const particleGrid = [];

  // Create particle grid
  for (let x = 0; x < 2; x++) {
    const column = [];
    for (let y = 0; y < 2; y++) {
      column.push(new Particle(50 + x * xSpacing, 50 + y * ySpacing));
    }
    particleGrid.push(column);
  }

  // Create springs between particles
  for (let x = 0; x < numParticlesX - 1; x++) {
    for (let y = 0; y < numParticlesY - 1; y++) {
      springs.push(new Spring(particleGrid[x][y], particleGrid[x + 1][y], 50, rigidity));
      springs.push(new Spring(particleGrid[x][y], particleGrid[x][y + 1], 50, rigidity));
      springs.push(new Spring(particleGrid[x][y], particleGrid[x + 1][y + 1], 50 * sqrt(2), rigidity));
      springs.push(new Spring(particleGrid[x][y + 1], particleGrid[x + 1][y], 50 * sqrt(2), rigidity));
    }
  }

  // Create additional springs
  for (let y = 0; y < numParticlesY - 1; y++) {
    springs.push(new Spring(particleGrid[numParticlesX - 1][y], particleGrid[numParticlesX - 1][y + 1], 50, rigidity));
  }
  for (let x = 0; x < numParticlesX - 1; x++) {
    springs.push(new Spring(particleGrid[x][numParticlesY - 1], particleGrid[x + 1][numParticlesY - 1], 50, rigidity));
  }

  // Add particles to the global particle array
  for (let x = 0; x < numParticlesX; x++) {
    for (let y = 0; y < numParticlesY; y++) {
      particles.push(particleGrid[x][y]);
    }
  }
}
function draw() {
  // Set the background color to black
  background(0);

  // Update and display each spring
  for (let spring of springs) {
    spring.update();
    spring.display();
  }

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      particles[i].collide(particles[j]);
    }
    particle.bounceEdges();
    particle.update();
    particle.limitVelocities();
    particle.show();
  }


}

let isDragging = false;
let dragParticle = null;

function mousePressed() {
  for (let particle of particles) {
    let distance = dist(mouseX, mouseY, particle.position.x, particle.position.y);
    if (distance <= particle.radius) {
      isDragging = true;
      dragParticle = particle;
      break;
    }
  }
}
function mouseDragged() {
  if (isDragging && dragParticle) {
    dragParticle.position.x = mouseX;
    dragParticle.position.y = mouseY;
  }
}
function mouseReleased() {
  isDragging = false;
  dragParticle = null;
}

/*
function draw() {
  background(0);
  
  for (let spring of springs) {
    spring.update();
    spring.display();
  }
  
  for (let particle of particles) {
    particle.checkCollision();
    particle.checkEdges();
    particle.updateState();
    particle.limitVelocities();
    particle.display();
    particle.displayDirection();
  }
}
*/