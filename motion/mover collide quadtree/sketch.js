document.title = 'Quad Tree Collide';

/*
  To use quadtree.js
  1. In draw, create a quadtree with the width and height of your canvas
  2. Add all particles to the quadtree
  3. For each particle, query the quadtree
  4. Check collisions from each particle returned in the query

*/

let balls = [];
let qtree;

function setup() {
  createCanvas(800, 800);

  for (let i = 0; i < 1000; i++) {
    const ball = new Mover(random(700) + 50, random(700) + 50, floor(random(2)) + 2);
    ball.applyForce(createVector(random(-ball.mass * 3, ball.mass * 3), random(-ball.mass * 3, ball.mass * 3)));
    balls.push(ball);
  }

}

function draw() {
  background(240);

  const boundary = new Rectangle(width / 2, height / 2, width, height);
  const capacity = 4;
  const qtree = new QuadTree(boundary, capacity);

  for (let i = 0; i < balls.length; i++) {
    let point = new Point(
      balls[i].position.x,
      balls[i].position.y,
      balls[i]
    );
    qtree.insert(point);
  }

  let tot = 0;
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    const range = new Circle(ball.position.x, ball.position.y, 20);
    const points = qtree.query(range);
    for (let point of points) {
      const other = point.userData;
      ball.collide(other);
      tot += 1;
    }
    ball.update();
    ball.bounceEdges();
    ball.show();
  }

  stroke(0);
  fill(255);
  text('FPS: ' + floor(frameRate()), 20, 20);
  text('Collision Checks per frame: ' + tot, 100, 20);

}
