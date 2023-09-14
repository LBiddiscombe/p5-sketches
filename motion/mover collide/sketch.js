document.title = 'Basic Collide';

let balls = [];

function setup() {
  createCanvas(800, 800);
  for (let i = 0; i < 100; i++) {
    const ball = new Mover(random(700) + 50, random(700) + 50, floor(random(2)) + 2);
    ball.applyForce(createVector(random(-ball.mass * 3, ball.mass * 3), random(-ball.mass * 3, ball.mass * 3)));
    balls.push(ball);
  }

}

function draw() {
  background(240);
  text('FPS:' + floor(frameRate()), 20, 20);

  let tot = 0;
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    for (let j = i + 1; j < balls.length; j++) {
      tot += 1;
      balls[i].collide(balls[j]);
    }
    ball.update();
    ball.bounceEdges();
    ball.show();
  }

  text('Collion Checks per frame:' + tot, 100, 20);

}
