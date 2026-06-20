const GOALIE_DECISIONS = ['read', 'read', 'freeze', 'randcorner'];
const MAX_REACTION_DELAY_MS = 400;
const KICK_RADIUS = 50;
const POWER_CYCLE_MS = 600;

let ball;
let scored = false;
let saved = false;
let outcome = null;
let outcomeTime = 0;
let charging = false;
let chargeStartTime = 0;

function preload() {
  footyPreload();
}

function setup() {
  document.title = 'Kick Penalty';
  createCanvas(400, 600);
  noSmooth();
  resetBall();
}

function resetBall() {
  ball = { x: 0, y: 0.11, z: 0, vx: 0, vy: 0, vz: 0, radius: 0.11 };
  scored = false;
  saved = false;
  outcome = null;
  footyReset();
}

function draw() {
  background(50, 150, 60);

  drawStadium(scored);
  drawPitch();
  drawGoal();

  updateGoalie();
  updateBall();

  drawGoalie();
  drawBall(ball);

  drawOutcome(outcome);
  drawPowerBar();
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

  ball.vx = -(dx / d) * map(d, 0, 50, 0, 16, true);
  ball.vy = (dy / d) * map(d, 0, 50, 0, 18, true);
  ball.vz = (20 * power) + 5;

  const t = goal.z / ball.vz;
  const predX = ball.vx * t;
  let predY = ball.y + ball.vy * t - 0.5 * gravity * t * t;
  if (predY < ball.radius) predY = ball.radius;

  goalieReact(predX, predY, GOALIE_DECISIONS, MAX_REACTION_DELAY_MS);
}

function updateBall() {
  const dt = deltaTime / 1000;

  ball.vy -= gravity * dt;

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.z += ball.vz * dt;

  if (ball.y < ball.radius) {
    ball.y = ball.radius;

    if (abs(ball.vy) > 0.5) {
      ball.vy *= -0.55;
    } else {
      ball.vy = 0;
    }
  }

  if (ball.z >= goal.z && ball.z <= goal.z + 1 && !scored && !saved) {
    const inFrame =
      ball.x > -goal.width / 2 &&
      ball.x < goal.width / 2 &&
      ball.y <= goal.height;

    if (inFrame && goalieSaveCheck(ball.x, ball.y, ball.radius)) {
      ball.vx *= 0.5;
      ball.vz *= -0.4;
      ball.vy *= 0.8;
      saved = true;
      outcome = 'Saved!';
      outcomeTime = millis();
    } else if (inFrame) {
      scored = true;
      netRipple.active = true;
      netRipple.impactX = ball.x;
      netRipple.impactY = ball.y;
      netRipple.startTime = millis();
      outcome = 'Goal!';
      outcomeTime = millis();
    }
  }

  if (scored) {
    ball.z = min(ball.z, goal.z + 2);
    ball.x = constrain(ball.x, -goal.width / 2, goal.width / 2);
    ball.vx *= 0.9;
  }

  if (ball.z > goal.z + 3 && !outcome) {
    outcome = 'Missed!';
    outcomeTime = millis();
  }

  if (outcome && millis() - outcomeTime >= 2000) {
    resetBall();
  }

  if (!outcome && ball.z > 30) {
    resetBall();
  }
}

function drawPowerBar() {
  if (!charging) return;
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
