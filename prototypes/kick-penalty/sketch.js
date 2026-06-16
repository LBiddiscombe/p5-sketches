let ball;
let scored = false;

const gravity = 30;

const camera = {
  focalLength: 400,
  height: 3.0, // metres above ground
  horizonY: 100,
  z: -3,
};

const goal = {
  z: 11,
  width: 7.32,
  height: 2.44,
};

function setup() {
  createCanvas(400, 600);
  resetBall();
}

function resetBall() {
  ball = { x: 0, y: 0.11, z: 0, vx: 0, vy: 0, vz: 0, radius: 0.11 };
}

function draw() {
  background(50, 150, 60);

  drawPitch();
  updateBall();
  drawGoal();
  drawBall();
}

function mousePressed() {
  kickBall();
}

function touchStarted() {
  kickBall();
  return false;
}

function kickBall() {
  // only kick when near start position
  if (ball.z > 5) return;

  const ballScreen = project(ball.x, ball.y, ball.z);
  const dx = mouseX - ballScreen.x;
  const dy = mouseY - ballScreen.y;
  const d = Math.hypot(dx, dy);

  ball.vx = -(dx / d) * map(d, 0, 50, 0, 10, true);
  ball.vy = (dy / d) * map(d, 0, 50, 0, 16, true);

  console.log("kick!", dx, dy, ball.vx, ball.vy);

  ball.vx = ball.vx; //random(-10, 10);
  ball.vy = ball.vy; //random(0, 16);
  ball.vz = 18; //random(18, 25);
}

function updateBall() {
  const dt = deltaTime / 1000;

  ball.vy -= gravity * dt;

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.z += ball.vz * dt;

  // bounce
  if (ball.y < ball.radius) {
    ball.y = ball.radius;

    if (abs(ball.vy) > 0.5) {
      ball.vy *= -0.55;
    } else {
      ball.vy = 0;
    }
  }

  // check for goal scored
  if (ball.z >= goal.z && ball.z <= goal.z + 0.5) {
    if (
      ball.x > -goal.width / 2 &&
      ball.x < goal.width / 2 &&
      ball.y <= goal.height
    ) {
      scored = true;
    }
  }

  if (scored) {
    ball.z = min(ball.z, goal.z + 2);
    ball.x = constrain(ball.x, -goal.width / 2, goal.width / 2);
    ball.vx *= 0.9;
  }

  if (ball.z > 100) {
    resetBall();
  }
}

function project(x, y, z) {
  const dz = max(z - camera.z, 0.1);

  const scale = camera.focalLength / dz;

  return {
    x: width / 2 + x * scale,
    y: camera.horizonY + (camera.height - y) * scale,
    scale,
  };
}

function drawPitch() {
  // goal line
  const goalLineLeft = project(-20, 0, goal.z);
  const goalLineRight = project(20, 0, goal.z);
  stroke(255, 100);
  strokeWeight(2);
  line(goalLineLeft.x, goalLineLeft.y, goalLineRight.x, goalLineRight.y);

  // 6y box
  const boxLeft = project(-5.5, 0, goal.z);
  const boxRight = project(5.5, 0, goal.z);
  const boxTop = project(-5.5, 0, goal.z - 5.5);
  const boxBottom = project(5.5, 0, goal.z - 5.5);
  stroke(255, 100);
  strokeWeight(2);
  noFill();
  line(boxLeft.x, boxLeft.y, boxTop.x, boxTop.y);
  line(boxRight.x, boxRight.y, boxBottom.x, boxBottom.y);
  line(boxTop.x, boxTop.y, boxBottom.x, boxBottom.y);

  // penalty spot
  const penaltySpot = project(0, 0, goal.z - 11);
  fill(255, 100);
  noStroke();
  ellipse(penaltySpot.x, penaltySpot.y, 20, 10);
}

function drawGoal() {
  const leftBottom = project(-goal.width / 2, 0, goal.z);
  const rightBottom = project(goal.width / 2, 0, goal.z);
  const leftTop = project(-goal.width / 2, goal.height, goal.z);
  const rightTop = project(goal.width / 2, goal.height, goal.z);

  stroke(255);
  strokeWeight(4);

  line(leftBottom.x, leftBottom.y, leftTop.x, leftTop.y);
  line(rightBottom.x, rightBottom.y, rightTop.x, rightTop.y);
  line(leftTop.x, leftTop.y, rightTop.x, rightTop.y);

  // simple net depth

  const netDepth = 2;
  const leftBack = project(-goal.width / 2, 0, goal.z + netDepth);
  const rightBack = project(goal.width / 2, 0, goal.z + netDepth);
  const leftBackTop = project(-goal.width / 2, goal.height, goal.z + netDepth);
  const rightBackTop = project(goal.width / 2, goal.height, goal.z + netDepth);

  stroke(255, 100);
  strokeWeight(1);

  line(leftTop.x, leftTop.y, leftBackTop.x, leftBackTop.y);
  line(rightTop.x, rightTop.y, rightBackTop.x, rightBackTop.y);
  line(leftBackTop.x, leftBackTop.y, rightBackTop.x, rightBackTop.y);
  line(leftBottom.x, leftBottom.y, leftBack.x, leftBack.y);
  line(rightBottom.x, rightBottom.y, rightBack.x, rightBack.y);
  line(leftBack.x, leftBack.y, leftBackTop.x, leftTop.y);
  line(leftBack.x, leftBack.y, rightBack.x, rightBack.y);
  line(rightBack.x, rightBack.y, rightBackTop.x, rightTop.y);
}

function drawBall() {
  // shadow

  const shadow = project(ball.x, 0, ball.z);

  noStroke();
  fill(0, 50);

  ellipse(
    shadow.x,
    shadow.y,
    ball.radius * 2 * shadow.scale,
    ball.radius * shadow.scale * 0.8
  );

  // ball

  const p = project(ball.x, ball.y, ball.z);

  fill(255);
  stroke(0);
  strokeWeight(1);

  ellipse(p.x, p.y, ball.radius * 2 * p.scale, ball.radius * 2 * p.scale);
}