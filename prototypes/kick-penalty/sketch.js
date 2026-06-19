let ball;
let scored = false;
let goalScoredTime = 0;
let saved = false;
let saveTime = 0;
let charging = false;
let chargeStartTime = 0;

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

const GOALIE_DECISIONS = ['read', 'freeze', 'randcorner'];
const MAX_REACTION_DELAY_MS = 400;
const KICK_RADIUS = 50;
const POWER_CYCLE_MS = 600;

let goalieStandImg, goalieDiveImg;

const goalie = {
  x: 0,
  y: 0,
  vy: 0,
  targetX: 0,
  targetY: 0,
  height: 1.8,
  width: 0.8,
  diving: false,
  diveStartTime: 0,
  decision: null,
};

function preload() {
  goalieStandImg = loadImage('goalie_stand.png');
  goalieDiveImg = loadImage('goalie_dive.png');
}

function setup() {
  document.title = 'Kick Penalty';
  createCanvas(400, 600);
  noSmooth();
  pixelDensity(1);
  goalie.z = goal.z;
  resetBall();
}

function resetBall() {
  ball = { x: 0, y: 0.11, z: 0, vx: 0, vy: 0, vz: 0, radius: 0.11 };
  scored = false;
  goalScoredTime = 0;
  saved = false;
  saveTime = 0;
  goalie.diving = false;
  goalie.x = 0;
  goalie.y = 0;
  goalie.vy = 0;
  goalie.decision = null;
}

function draw() {
  background(50, 150, 60);

  drawPitch();
  updateBall();
  updateGoalie();
  drawGoal();
  drawGoalie();
  drawBall();

  if (charging) {
    const elapsed = (millis() - chargeStartTime) % POWER_CYCLE_MS;
    const power = elapsed / POWER_CYCLE_MS;

    const ballScreen = project(ball.x, ball.y, ball.z);
    const barX = ballScreen.x + 30;
    const barY = ballScreen.y;
    const barW = 10;
    const barH = 40;

    push();
    noStroke();

    fill(0, 120);
    rect(barX, barY - barH, barW, barH);

    fill(255, 220, 0);
    const fillH = barH * power;
    rect(barX, barY - fillH, barW, fillH);

    noFill();
    stroke(255, 180);
    strokeWeight(1);
    rect(barX, barY - barH, barW, barH);
    pop();
  }
}

function mousePressed() {
  if (charging) return false;
  if (ball.z > 5) return false;

  const ballScreen = project(ball.x, ball.y, ball.z);
  const d = Math.hypot(mouseX - ballScreen.x, mouseY - ballScreen.y);
  if (d > KICK_RADIUS) return false;

  charging = true;
  chargeStartTime = millis();
  return false;
}

function mouseReleased() {
  if (!charging) return false;
  charging = false;

  const elapsed = millis() - chargeStartTime;
  if (elapsed < 100) return false;

  const power = (elapsed % POWER_CYCLE_MS) / POWER_CYCLE_MS;
  kickBall(power);
  return false;
}

function touchStarted() {
  return mousePressed();
}

function touchEnded() {
  return mouseReleased();
}

function kickBall(power) {
  const ballScreen = project(ball.x, ball.y, ball.z);
  const dx = mouseX - ballScreen.x;
  const dy = mouseY - ballScreen.y;
  const d = Math.hypot(dx, dy) || 1;

  ball.vx = -(dx / d) * map(d, 0, 50, 0, 10, true);
  ball.vy = (dy / d) * map(d, 0, 50, 0, 16, true);
  ball.vz = (25 * power) + 5;

  console.log("kick!", power, dx, dy, ball.vx, ball.vy, ball.vz);

  const t = goal.z / ball.vz;
  const predX = ball.vx * t;
  let predY = ball.y + ball.vy * t - 0.5 * gravity * t * t;
  if (predY < ball.radius) predY = ball.radius;

  const decision = random(GOALIE_DECISIONS);
  const delay = MAX_REACTION_DELAY_MS; //random(0, MAX_REACTION_DELAY_MS);
  goalie.decision = decision;
  goalie.diving = true;
  goalie.diveStartTime = millis() + delay;

  if (decision === 'read') {
    goalie.targetX = constrain(predX, -goal.width / 2, goal.width / 2);
    goalie.targetY = constrain(predY, 0, goal.height);
    goalie.vy = sqrt(2 * gravity * goalie.targetY);
  } else if (decision === 'randcorner') {
    const side = random() < 0.5 ? -1 : 1;
    goalie.targetX = side * goal.width / 2;
    goalie.targetY = random(0, goal.height);
    goalie.vy = sqrt(2 * gravity * goalie.targetY);
  } else { // freeze
    goalie.targetX = 0;
    goalie.targetY = 0;
    goalie.vy = 0;
  }
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
  if (ball.z >= goal.z && ball.z <= goal.z + 0.5 && !scored && !saved) {
    const inFrame =
      ball.x > -goal.width / 2 &&
      ball.x < goal.width / 2 &&
      ball.y <= goal.height;

    if (inFrame && goalieSaveCheck(ball.x, ball.y)) {
      ball.vx *= 0.5;
      ball.vz *= -0.4;
      ball.vy *= 0.8;
      saved = true;
      saveTime = millis();
    } else if (inFrame) {
      scored = true;
      goalScoredTime = millis();
    }
  }

  if (scored) {
    ball.z = min(ball.z, goal.z + 2);
    ball.x = constrain(ball.x, -goal.width / 2, goal.width / 2);
    ball.vx *= 0.9;

    if (millis() - goalScoredTime >= 2000) {
      resetBall();
    }
  }

  if (saved && millis() - saveTime >= 2000) {
    resetBall();
  }

  if (ball.z > 30) {
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

function updateGoalie() {
  if (!goalie.diving) return;

  const now = millis();
  if (now < goalie.diveStartTime) return;

  if (goalie.decision === 'freeze') return;

  const dt = deltaTime / 1000;
  const elapsed = now - goalie.diveStartTime;

  const t = min(elapsed / 650, 1);
  goalie.x = lerp(0, goalie.targetX, t);

  goalie.vy -= gravity * dt;
  goalie.y += goalie.vy * dt;

  if (goalie.y < 0.) {
    goalie.y = 0;
    goalie.vy = 0;
  }
}

function goalieCollisionBounds() {
  if (goalie.diving && abs(goalie.targetX) >= 1.0) {
    const dir = Math.sign(goalie.targetX) || 1;
    return {
      left: dir >= 0 ? goalie.x : goalie.x - goalie.height,
      right: dir >= 0 ? goalie.x + goalie.height : goalie.x,
      bottom: goalie.y,
      top: goalie.y + goalie.width,
    };
  }
  return {
    left: goalie.x - goalie.width / 2,
    right: goalie.x + goalie.width / 2,
    bottom: goalie.y,
    top: goalie.y + goalie.height,
  };
}

function goalieSaveCheck(bx, by) {
  const b = goalieCollisionBounds();
  const r = ball.radius;
  return bx > b.left - r && bx < b.right + r && by > b.bottom - r && by < b.top + r;
}

function drawGoalie() {
  const diving = goalie.diving && millis() >= goalie.diveStartTime;
  const img = diving ? goalieDiveImg : goalieStandImg;

  const feet = project(goalie.x, goalie.y, goalie.z);
  const top = project(goalie.x, goalie.y + goalie.height, goalie.z);

  const sprH = feet.y - top.y;
  const sprW = sprH * (goalie.width / goalie.height);

  const cropRatio = goalie.width / goalie.height;
  const sx = (img.width - img.width * cropRatio) / 2;
  const sw = img.width * cropRatio;

  push();
  if (diving) {
    const elapsed = millis() - goalie.diveStartTime;
    const rotT = elapsed >= 0 ? min(elapsed / 100, 1) : 0;
    translate(feet.x, feet.y);
    if (abs(goalie.targetX) >= 1.0) {
      translate(0, -lerp(0, sprW / 2, rotT));
      rotate(Math.sign(goalie.targetX) * rotT * PI / 2);
    }
  } else {
    translate(feet.x, feet.y);
  }
  imageMode(CORNER);
  image(img, -sprW / 2, -sprH, sprW, sprH, sx, 0, sw, img.height);
  pop();

  // // collision rect
  // const b = goalieCollisionBounds();
  // const tl = project(b.left, b.top, goalie.z);
  // const br = project(b.right, b.bottom, goalie.z);
  // noFill();
  // stroke(255, 0, 0, 150);
  // strokeWeight(1);
  // rect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
}