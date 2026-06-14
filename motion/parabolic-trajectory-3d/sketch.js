document.title = 'Parabolic Trajectory 3D';

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

let azimuth = 0;
let launchAngle;
let ballT = 0;
let playing = false;
let playSpeed = 0.25;
let screenOffsetX = 0;
let screenOffsetY = 0;
let originY = 0;
let launchSpeed = SPEED;

function setup() {
  createCanvas(windowWidth, windowHeight);
  launchAngle = radians(30);
}

function simulate(angle) {
  const pts = [];
  let x = 0, y = originY;
  let vx = launchSpeed * cos(angle);
  let vy = -launchSpeed * sin(angle);
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
  return { sx: cx + x3d * persp + screenOffsetX, sy: cy + y3d * persp + screenOffsetY, persp };
}

function draw() {
  background(15, 12, 20);

  const marginX = 100;
  const cx = marginX;
  const cy = height / 2;
  const focalLength = max(width, height) * 0.8;

  // Simulate full trajectory with bounces
  const pts = simulate(launchAngle);
  if (pts.length < 2) return;

  // Scale based on the guide arc (first bounce segment only)
  const guideEnd = pts.findIndex(p => p.bounce !== 0);
  const guideLen = guideEnd > 0 ? guideEnd : pts.length;
  const maxGuideX = pts.slice(0, guideLen).reduce((m, p) => max(m, p.x), 0);
  if (maxGuideX < 0.001) return;

  const simScale = (width - marginX * 2) / maxGuideX;

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
    ballT += DT / simDuration * playSpeed;
    if (ballT >= 1) {
      ballT = 0;
      playing = false;
      screenOffsetX = 0;
      screenOffsetY = 0;
      originY = 0;
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

  // Ground
  noStroke();
  fill(15, 95, 20);
  rect(0, cy + BALL_RADIUS, width, height / 2);

  // Ball
  noStroke();
  fill(255);
  const exaggScale = constrain(ballProj.persp, 0.15, 2.5) ** 3;
  const groundOffset = BALL_RADIUS * (1 - exaggScale);
  circle(ballProj.sx, ballProj.sy + groundOffset, BALL_RADIUS * 2 * exaggScale);

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
  text(`launch   ${degrees(launchAngle).toFixed(0)}\u00b0  speed ${launchSpeed.toFixed(1)}`, 20, 38);
  text('click ball to kick', 20, height - 28);
}

function mousePressed() {
  // Click anywhere to start the slow demo
  if (!playing) {
    launchAngle = random(radians(15), radians(45));
    launchSpeed = random(7, 14);
    azimuth = 0;
    originY = 0;
    screenOffsetX = 0;
    screenOffsetY = 0;
    playSpeed = 0.25;
    ballT = 0;
    playing = true;
    return;
  }

  // Mid-flight: click on the ball to re-kick
  const marginX = 100;
  const cx = marginX;
  const cy = height / 2;
  const focalLength = max(width, height) * 0.8;
  const pts = simulate(launchAngle);
  if (pts.length < 2) return;

  const guideEnd = pts.findIndex(p => p.bounce !== 0);
  const guideLen = guideEnd > 0 ? guideEnd : pts.length;
  const maxGuideX = pts.slice(0, guideLen).reduce((m, p) => max(m, p.x), 0);
  if (maxGuideX < 0.001) return;
  const simScale = (width - marginX * 2) / maxGuideX;

  const ballIdx = ballT * (pts.length - 1);
  const bi = floor(ballIdx);
  const bf = ballIdx - bi;
  const bj = min(bi + 1, pts.length - 1);
  const bx = lerp(pts[bi].x, pts[bj].x, bf);
  const by = lerp(pts[bi].y, pts[bj].y, bf);
  const ballProj = projectPoint(bx, by, simScale, cx, cy, azimuth, focalLength);

  const exaggScale = constrain(ballProj.persp, 0.15, 2.5) ** 2;
  const ballRadius = BALL_RADIUS * 2 * exaggScale;
  const ballSy = ballProj.sy + BALL_RADIUS * (1 - exaggScale);

  const d = dist(mouseX, mouseY, ballProj.sx, ballSy);
  if (d > ballRadius) return;

  const relX = constrain((mouseX - ballProj.sx) / ballRadius, -1, 1);
  const relY = constrain((mouseY - ballSy) / ballRadius, -1, 1);

  azimuth = radians(90 + 60 * relX);

  if (relY <= 0) {
    launchAngle = radians(45 + 25 * relY);
  } else {
    launchAngle = radians(45 + 30 * relY);
  }

  originY = by;
  launchSpeed = SPEED;
  screenOffsetX = ballProj.sx - cx;
  playSpeed = 1.0;
  ballT = 0;
  playing = true;
}

function keyPressed() {
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  screenOffsetX = 0;
  screenOffsetY = 0;
  originY = 0;
}

