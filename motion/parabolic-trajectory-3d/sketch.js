document.title = 'Parabolic Trajectory 3D';

let azimuth = 3.14 / 2;
let launchAngle;
let ballT = 0;
let playing = false;

const NUM_POINTS = 100;

const PALETTE = {
  trail: [69, 183, 209],
  trailDim: [69, 183, 209, 30],
  center: [255, 255, 255],
  reference: [255, 255, 255, 18],
  ui: [255, 255, 255, 150],
};

const SPEED = 10;
const GRAVITY = 6;
const DRAG = 1.5;
const DT = 0.04;
const BALL_RADIUS = 50;
const RESTITUTION = 1;
const BOUNCE_FRICTION = 1;
const MAX_BOUNCES = 10;

function setup() {
  createCanvas(windowWidth, windowHeight);
  launchAngle = PI / 4;
}

function simulate(angle) {
  const pts = [];
  let x = 0, y = 0;
  let vx = SPEED * cos(angle);
  let vy = -SPEED * sin(angle);
  let bounces = 0;

  for (let i = 0; i < 2000; i++) {
    pts.push({ x, y, vx, vy, bounce: bounces });

    const dragX = -DRAG * vx;
    const dragY = -DRAG * vy;
    vx += dragX * DT;
    vy += (GRAVITY + dragY) * DT;
    x += vx * DT;
    y += vy * DT;

    if (y > 0 && i > 5) {
      y = 0;
      vy = -vy * RESTITUTION;
      vx *= BOUNCE_FRICTION;
      bounces++;
      if (bounces > MAX_BOUNCES || abs(vy) < 0.3) break;
    }
  }
  return pts;
}

function projectPoint(px, py, sc, cx, cy, az, fl) {
  const xLocal = px * sc;
  const yLocal = py * sc;
  const x3d = xLocal * cos(az);
  const y3d = yLocal;
  const z3d = xLocal * sin(az);
  const persp = constrain(fl / (fl + z3d), 0.1, 3);
  return { sx: cx + x3d * persp, sy: cy + y3d * persp, persp };
}

function draw() {
  background(15, 12, 20);

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = min(width, height) * 0.38;
  const focalLength = max(width, height) * 0.8;

  // Reference elements
  // noFill();
  // stroke(...PALETTE.reference);
  // strokeWeight(1);
  // circle(cx, cy, maxRadius * 2);
  // line(cx - maxRadius, cy, cx + maxRadius, cy);

  // Simulate full trajectory with bounces
  const pts = simulate(launchAngle);
  if (pts.length < 2) return;

  // Scale based on the guide arc (first bounce segment only)
  const guideEnd = pts.findIndex(p => p.bounce !== 0);
  const guideLen = guideEnd > 0 ? guideEnd : pts.length;
  const maxGuideX = pts.slice(0, guideLen).reduce((m, p) => max(m, p.x), 0);
  if (maxGuideX < 0.001) return;

  const simScale = maxRadius / maxGuideX;

  // Launch direction indicator
  const svx = SPEED * cos(launchAngle);
  const svy = -SPEED * sin(launchAngle);
  const dirMag = sqrt(svx * svx + svy * svy);
  stroke(...PALETTE.trail, 80);
  strokeWeight(1);
  // line(cx, cy,
  //   cx + (svx / dirMag) * 20 * simScale * cos(azimuth),
  //   cy + (svy / dirMag) * 20 * simScale);

  // Advance ball if playing
  if (playing) {
    const simDuration = pts.length * DT;
    ballT += DT / simDuration;
    if (ballT >= 1) {
      ballT = 0;
      playing = false;
    }
  }

  // Interpolate ball position along full trajectory
  const ballIdx = ballT * (pts.length - 1);
  const bi = floor(ballIdx);
  const bf = ballIdx - bi;
  const bj = min(bi + 1, pts.length - 1);
  const bx = lerp(pts[bi].x, pts[bj].x, bf);
  const by = lerp(pts[bi].y, pts[bj].y, bf);
  const ballProj = projectPoint(bx, by, simScale, cx, cy, azimuth, focalLength);

  // Is the ball currently on the guide arc?
  const ballOnGuide = playing && pts[bi].bounce === 0;

  // Trajectory guide dots (first arc only)
  for (let i = 0; i <= NUM_POINTS; i++) {
    const t = i / NUM_POINTS;
    const idx = floor(t * (guideLen - 1));
    const p = pts[idx];
    if (p.bounce !== 0) continue;

    const proj = projectPoint(p.x, p.y, simScale, cx, cy, azimuth, focalLength);
    const depthNorm = constrain(proj.persp, 0.2, 1);

    // Gap around ball when it's on the guide arc
    if (ballOnGuide) {
      const segPos = idx / guideLen;
      const distFromBall = abs(segPos - ballT * (pts.length - 1) / guideLen);
      if (distFromBall < 0.04) continue;
    }

    const alpha = floor(map(depthNorm, 0.2, 1, 50, 220));
    const size = map(depthNorm, 0.2, 1, 2.5, 5.5);
    noStroke();
    fill(PALETTE.trail[0], PALETTE.trail[1], PALETTE.trail[2], alpha);
    //circle(proj.sx, proj.sy, size);
  }

  // Ball
  noStroke();
  fill(255);
  const exaggScale = constrain(ballProj.persp, 0.15, 2.5) ** 6;
  circle(ballProj.sx, ballProj.sy, BALL_RADIUS * 2 * exaggScale);

  // Center point
  noStroke();
  fill(...PALETTE.center);
  //circle(cx, cy, 6);

  // UI
  noStroke();
  fill(...PALETTE.ui);
  textAlign(LEFT, TOP);
  textSize(13);
  textFont('monospace');
  text(`azimuth  ${degrees(azimuth).toFixed(0)}\u00b0`, 20, 20);
  text(`launch   ${degrees(launchAngle).toFixed(0)}\u00b0`, 20, 38);
  text('\u2190 \u2192 rotate  \u2191 \u2193 angle  SPACE kick', 20, height - 28);
}

function keyPressed() {
  const step = 0.04;
  if (keyCode === LEFT_ARROW) azimuth += step;
  if (keyCode === RIGHT_ARROW) azimuth -= step;
  if (keyCode === UP_ARROW) launchAngle = min(launchAngle + step, HALF_PI);
  if (keyCode === DOWN_ARROW) launchAngle = max(launchAngle - step, 0);
  if (key === ' ') {
    ballT = 0;
    playing = true;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

