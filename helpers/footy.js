// Shared football environment for kick-based sketches

const gravity = 30;
const NET_COLS = 30;
const NET_ROWS = 10;

const camera = {
  focalLength: 550,
  height: 2, // metres above ground
  horizonY: 100,
  z: -3,
};

const goal = {
  z: 11,
  width: 7.32,
  height: 2.44,
};

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
  z: 11,
};

let goalieStandImg, goalieDiveImg, ballImg;

let netRipple = { active: false, impactX: 0, impactY: 0, startTime: 0 };

function footyPreload() {
  goalieStandImg = loadImage('goalie_stand.png');
  goalieDiveImg = loadImage('goalie_dive.png');
  ballImg = loadImage('ball.png');
}

function footyReset() {
  goalie.diving = false;
  goalie.x = 0;
  goalie.y = 0;
  goalie.vy = 0;
  goalie.decision = null;
  netRipple.active = false;
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
  const goalLineLeft = project(-20, 0, goal.z);
  const goalLineRight = project(20, 0, goal.z);
  stroke(255, 100);
  strokeWeight(2);
  line(goalLineLeft.x, goalLineLeft.y, goalLineRight.x, goalLineRight.y);

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

  const penaltySpot = project(0, 0, goal.z - 11);
  fill(255, 100);
  noStroke();
  ellipse(penaltySpot.x, penaltySpot.y, 20, 10);
}

function drawStadium(scored) {
  noStroke();

  const skyColors = [
    [110, 170, 225],
    [135, 190, 235],
    [155, 205, 245],
    [170, 218, 252],
    [180, 228, 255],
  ];
  const bandH = ceil((camera.horizonY + 10) / skyColors.length / 4) * 4;
  for (let i = 0; i < skyColors.length; i++) {
    const c = skyColors[i];
    fill(c[0], c[1], c[2]);
    rect(0, i * bandH, width, bandH + 1);
  }

  const rows = 7;
  for (let row = rows - 1; row >= 0; row--) {
    const zPos = goal.z + 3 + row * 1.5;

    const count = max(1, 10 - row);
    for (let s = 0; s < count; s++) {
      const sx = map(s, 0, count - 1, -9.5, 9.5) + (row % 2) * 0.4;
      const midZ = zPos - 0.3;
      const bodyH = 1.5;

      const feet = project(sx, row / rows, midZ);
      const top = project(sx, row / rows + bodyH, midZ);
      const h = feet.y - top.y;
      if (h < 3) continue;

      const aspect = goalieStandImg.width / goalieStandImg.height;
      const w = h * aspect;

      const hue = (row * 47 + s * 31 + 7) % 360;
      const r = constrain(128 + 127 * sin(hue * 0.01745), 0, 255);
      const g = constrain(128 + 127 * sin(hue * 0.01745 + 2.094), 0, 255);
      const b = constrain(128 + 127 * sin(hue * 0.01745 + 4.189), 0, 255);

      push();
      tint(r, g, b);

      const celebrating = scored && (row + s) % 2 === 0;
      const img = celebrating ? goalieDiveImg : goalieStandImg;

      let yy = feet.y;
      if (celebrating) {
        yy += sin(millis() * 0.03 + row * 2.7 + s * 3.9) * h * 0.12;
      }

      image(img, feet.x - w / 2, yy - h, w, h);
      pop();
    }
  }

  const boardBase = project(0, 0, goal.z + 1.5);
  const boardH = 28;
  const boardTop = boardBase.y - boardH - 2;

  fill(100, 100, 100);
  rect(0, boardTop - 2, width, 2);

  const brands = ['COLA', 'JET', 'BANK', 'FOX', 'TEL', 'WATCH', 'GO', 'OIL'];
  const bw = width / brands.length;

  const palettes = [
    [200, 30, 30], [30, 80, 200], [200, 180, 20],
    [30, 160, 40], [160, 50, 140], [30, 150, 180],
    [200, 120, 20], [80, 80, 80],
  ];

  for (let i = 0; i < brands.length; i++) {
    const x = ceil(i * bw);
    const c = palettes[i];

    fill(c[0], c[1], c[2]);
    rect(x, boardTop, bw, boardH + 2);

    fill(225, 225, 225);
    rect(x + 2, boardTop + 2, bw - 4, boardH - 4);

    push();
    fill(0, 0, 0, 50);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(7);
    text(brands[i], x + bw / 2 + 1, boardTop + boardH / 2 + 1);

    fill(c[0], c[1], c[2]);
    text(brands[i], x + bw / 2, boardTop + boardH / 2);
    pop();
  }

  noFill();
  stroke(200, 200, 200);
  strokeWeight(2);
  rect(0, boardTop, width, boardH + 2);
  noStroke();
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

  const netDepth = 2;
  const cols = NET_COLS;
  const rows = NET_ROWS;
  const sideDivs = 4;

  const rippling = netRipple.active;
  const rippleTime = rippling ? (millis() - netRipple.startTime) / 1000 : 0;
  const rippleAmp = rippling ? max(0, 10 * (1 - rippleTime / 2.5)) : 0;

  let impactP = null;
  if (rippling) {
    impactP = project(netRipple.impactX, netRipple.impactY, goal.z + netDepth);
  }

  function proj(wx, wy, wz) {
    return project(wx, wy, wz);
  }

  const grid = [];
  for (let r = 0; r <= rows; r++) {
    grid[r] = [];
    for (let c = 0; c <= cols; c++) {
      const wx = map(c, 0, cols, -goal.width / 2, goal.width / 2);
      const wy = map(r, 0, rows, 0, goal.height);
      let p = proj(wx, wy, goal.z + netDepth);

      if (rippling && rippleAmp > 0.5 && impactP) {
        const dx = p.x - impactP.x;
        const dy = p.y - impactP.y;
        const d = sqrt(dx * dx + dy * dy);
        if (d > 1) {
          const wave = sin(d * 0.05 - rippleTime * 10) * rippleAmp * exp(-d * 0.06);
          p.x += (dx / d) * wave;
          p.y += (dy / d) * wave;
        }
      }

      grid[r][c] = p;
    }
  }

  stroke(255, 120);
  strokeWeight(1);

  for (let c = 0; c <= cols; c++) {
    for (let r = 0; r < rows; r++) {
      line(grid[r][c].x, grid[r][c].y, grid[r + 1][c].x, grid[r + 1][c].y);
    }
  }

  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c < cols; c++) {
      line(grid[r][c].x, grid[r][c].y, grid[r][c + 1].x, grid[r][c + 1].y);
    }
  }

  function drawSidePanel(getPoint, pRows) {
    const panelGrid = [];
    for (let i = 0; i <= pRows; i++) {
      panelGrid[i] = [];
      for (let d = 0; d <= sideDivs; d++) {
        panelGrid[i][d] = getPoint(i, d);
      }
    }

    for (let i = 0; i <= pRows; i++) {
      for (let d = 0; d < sideDivs; d++) {
        line(panelGrid[i][d].x, panelGrid[i][d].y,
             panelGrid[i][d + 1].x, panelGrid[i][d + 1].y);
      }
    }

    for (let d = 0; d <= sideDivs; d++) {
      for (let i = 0; i < pRows; i++) {
        line(panelGrid[i][d].x, panelGrid[i][d].y,
             panelGrid[i + 1][d].x, panelGrid[i + 1][d].y);
      }
    }
  }

  drawSidePanel((r, d) => {
    const y = map(r, 0, rows, 0, goal.height);
    if (d < sideDivs) {
      return proj(-goal.width / 2, y, lerp(goal.z, goal.z + netDepth, d / sideDivs));
    }
    return grid[r][0];
  }, rows);

  drawSidePanel((r, d) => {
    const y = map(r, 0, rows, 0, goal.height);
    if (d < sideDivs) {
      return proj(goal.width / 2, y, lerp(goal.z, goal.z + netDepth, d / sideDivs));
    }
    return grid[r][cols];
  }, rows);

  drawSidePanel((c, d) => {
    const x = map(c, 0, cols, -goal.width / 2, goal.width / 2);
    if (d < sideDivs) {
      return proj(x, goal.height, lerp(goal.z, goal.z + netDepth, d / sideDivs));
    }
    return grid[rows][c];
  }, cols);

  const bl = grid[0][0];
  const br = grid[0][cols];
  const tl = grid[rows][0];
  const tr = grid[rows][cols];

  stroke(255, 180);
  strokeWeight(1.5);

  line(leftTop.x, leftTop.y, tl.x, tl.y);
  line(rightTop.x, rightTop.y, tr.x, tr.y);
  line(tl.x, tl.y, tr.x, tr.y);
  line(leftBottom.x, leftBottom.y, bl.x, bl.y);
  line(rightBottom.x, rightBottom.y, br.x, br.y);
  line(bl.x, bl.y, tl.x, leftTop.y);
  line(bl.x, bl.y, br.x, br.y);
  line(br.x, br.y, tr.x, rightTop.y);
}

function drawBall(ball) {
  const shadow = project(ball.x, 0, ball.z);

  noStroke();
  fill(0, 50);

  ellipse(
    shadow.x,
    shadow.y,
    ball.radius * 2 * shadow.scale,
    ball.radius * shadow.scale * 0.8
  );

  const p = project(ball.x, ball.y, ball.z);
  const dia = ball.radius * 2 * p.scale;
  image(ballImg, p.x - dia / 2, p.y - dia / 2, dia, dia);
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

function goalieSaveCheck(bx, by, ballRadius) {
  const b = goalieCollisionBounds();
  return bx > b.left - ballRadius && bx < b.right + ballRadius && by > b.bottom - ballRadius && by < b.top + ballRadius;
}

function goalieReact(predX, predY, decisions, maxDelayMs) {
  const decision = random(decisions);
  const delay = random(0, maxDelayMs);
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
  } else {
    goalie.targetX = 0;
    goalie.targetY = 0;
    goalie.vy = 0;
  }
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
  translate(feet.x, feet.y);
  if (diving) {
    const elapsed = millis() - goalie.diveStartTime;
    const rotT = elapsed >= 0 ? min(elapsed / 100, 1) : 0;
    if (abs(goalie.targetX) >= 1.0) {
      translate(0, -lerp(0, sprW / 2, rotT));
      rotate(Math.sign(goalie.targetX) * rotT * PI / 2);
    }
  }
  imageMode(CORNER);
  image(img, -sprW / 2, -sprH, sprW, sprH, sx, 0, sw, img.height);
  pop();
}

function drawOutcome(outcome) {
  if (!outcome) return;
  push();
  textSize(72);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill(255);
  stroke(0);
  strokeWeight(6);
  text(outcome, width / 2, height / 2);
  pop();
}
