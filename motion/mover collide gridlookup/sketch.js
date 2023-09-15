document.title = 'Grid Lookup Collide';

/*
  To use gridlookup.js
  1. Initialise a Grid instance with the width and height of your canvas and a cell size around that of the biggest particle
  2. Add all particles to the grid
  3. In draw get all the neighbors (all particles in the grid cells the particle spans)
  4. Collide only with the neighbors
  5. Remove and all particles after updates (can be part of same loop as below)
*/

let balls = [];
let grid;

function setup() {
  createCanvas(800, 800);
  grid = new Grid(width, height, 20);
  for (let i = 0; i < 100; i++) {
    const ball = new Mover(random(700) + 50, random(700) + 50, floor(random(2)) + 2);
    ball.applyForce(createVector(random(-ball.mass * 3, ball.mass * 3), random(-ball.mass * 3, ball.mass * 3)));
    balls.push(ball);
    grid.addParticle(ball);
  }

}

function draw() {
  background(240);

  text('Balls: ' + balls.length, 100, 20);

  let tot = 0;
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    const neighbors = grid.getNeighbors(ball);
    for (let other of neighbors) {
      tot += 1;
      ball.collide(other);
    }
    ball.update();
    ball.bounceEdges();
    ball.show();

    grid.removeParticle(ball);
    grid.addParticle(ball);
  }

  stroke(0);
  fill(255);
  text('FPS: ' + floor(frameRate()), 20, 20);
  text('Collision Checks per frame: ' + tot, 100, 20);

}
