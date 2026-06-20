document.title = 'Kick Volley';

const SPAWN_X = -2;
const SPAWN_Y = () => Math.random() * 2;
const SPAWN_Z = () => Math.random() * 3.5 - 1.5;
const SPAWN_VX = () => Math.random() * 3 + 3;
const SPAWN_VY = () => Math.random() * 2 + 2;
const SPAWN_VZ = 0;
const KICK_VX_MAX = 10;
const KICK_VY_MAX = 14;
const KICK_VZ = 20;
const KICK_RADIUS = 50;
const RESET_X_THRESHOLD = 15;
const GHOST_SCREEN_X = 14;
const PRE_KICK_SPEED_MULT = 0.2;
const TRAIL_LENGTH = 40;

const GOALIE_DECISIONS = ['read'];
const MAX_REACTION_DELAY_MS = 800;

let ball;
let scored = false;
let saved = false;
let outcome = null;
let outcomeTime = 0;
let trail = [];

camera.z = -4;

function preload() {
  footyPreload();
}

function setup() {
  createCanvas(400, 600);
  noSmooth();
  resetBall();
}

function resetBall() {
  ball = {
    x: SPAWN_X,
    y: SPAWN_Y(),
    z: SPAWN_Z(),
    vx: SPAWN_VX(),
    vy: SPAWN_VY(),
    vz: SPAWN_VZ,
    radius: 0.11,
    kicked: false,
  };
  scored = false;
  saved = false;
  outcome = null;
  footyReset();
  trail = [];
}

function draw() {
  background(50, 150, 60);

  drawStadium(scored);
  drawPitch();
  drawGoal();

  updateGoalie();
  updateBall();

  drawGoalie();
  drawTrail();
  drawGhostBall();
  drawBall(ball);

  drawOutcome(outcome);
}

function mousePressed() {
  if (ball.kicked) return false;
  const ballScreen = project(ball.x, ball.y, ball.z);
  const d = Math.hypot(mouseX - ballScreen.x, mouseY - ballScreen.y);
  if (d > KICK_RADIUS) return false;

  volleyBall();
  return false;
}

function touchStarted() {
  return mousePressed();
}

function volleyBall() {
  ball.kicked = true;

  const ballScreen = project(ball.x, ball.y, ball.z);
  const dx = mouseX - ballScreen.x;
  const dy = mouseY - ballScreen.y;
  const d = Math.hypot(dx, dy) || 1;

  ball.vx = -(dx / d) * KICK_VX_MAX;
  ball.vy = (dy / d) * KICK_VY_MAX;
  ball.vz = KICK_VZ;

  const t = goal.z / ball.vz;
  const predX = ball.vx * t;
  let predY = ball.y + ball.vy * t - 0.5 * gravity * t * t;
  if (predY < ball.radius) predY = ball.radius;

  goalieReact(predX, predY, GOALIE_DECISIONS, MAX_REACTION_DELAY_MS);
}

function updateBall() {
  const dt = deltaTime / 1000;
  const speedMult = ball.kicked ? 1 : PRE_KICK_SPEED_MULT;

  ball.vy -= gravity * dt * speedMult;

  ball.x += ball.vx * dt * speedMult;
  ball.y += ball.vy * dt * speedMult;
  ball.z += ball.vz * dt * speedMult;

  if (!ball.kicked) {
    trail.push({ x: ball.x, y: ball.y, z: ball.z });
    if (trail.length > TRAIL_LENGTH) trail.shift();
  }

  if (ball.y < ball.radius) {
    ball.y = ball.radius;

    if (abs(ball.vy) > 0.5) {
      ball.vy *= -0.55;
    } else {
      ball.vy = 0;
    }
  }

  if (ball.kicked) {
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

    if (ball.z > 30) {
      resetBall();
    }
  } else {
    if (ball.x > RESET_X_THRESHOLD) {
      resetBall();
    }
  }

  if (outcome && millis() - outcomeTime >= 2000) {
    resetBall();
  }
}

function drawTrail() {
  if (ball.kicked) return;
  for (let i = 0; i < trail.length; i++) {
    const p = trail[i];
    const proj = project(p.x, p.y, p.z);
    const alpha = map(i, 0, trail.length - 1, 15, 70);
    const size = ball.radius * 2 * proj.scale * map(i, 0, trail.length - 1, 0.5, 1);
    noStroke();
    fill(255, alpha);
    ellipse(proj.x, proj.y, size, size);
  }
}

function drawGhostBall() {
  if (ball.kicked || outcome) return;

  const ghostWorldX = (GHOST_SCREEN_X - width / 2) / (camera.focalLength / (ball.z - camera.z));
  const ghost = project(ghostWorldX, ball.y, ball.z);
  const real = project(ball.x, ball.y, ball.z);

  if (real.x > ghost.x) return;

  const ghostShadow = project(ghostWorldX, 0, ball.z);
  noStroke();
  fill(0, 30);
  ellipse(ghostShadow.x, ghostShadow.y, ball.radius * 2 * ghostShadow.scale, ball.radius * ghostShadow.scale * 0.8);

  const dia = ball.radius * 2 * ghost.scale;
  noStroke();
  fill(255, 60);
  ellipse(ghost.x, ghost.y, dia, dia);

  noFill();
  stroke(255, 100);
  strokeWeight(1.5);
  ellipse(ghost.x, ghost.y, dia, dia);
}
