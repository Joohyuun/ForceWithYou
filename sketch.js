let blackStone;
let whiteStone;

function setup() {
  createCanvas(400, 200);

  blackStone = new Particle(width / 3, height / 2, 50, color(20));
  whiteStone = new Particle(width * 2 / 3, height / 2, 50, color(245));
}

function draw() {
  background(220);

  // 조작 안내
  noStroke();
  fill(130);
  textSize(11);
  textAlign(LEFT, TOP);
  text("돌 위에 마우스를 올리면 예상 경로가 보여요", 8, 6);

  blackStone.update();
  whiteStone.update();

  resolveCollision(blackStone, whiteStone);

  blackStone.checkEdge();
  whiteStone.checkEdge();

  // 돌 위에 마우스를 올리면 예상 경로를 먼저 보여줌
  drawAimGuide();

  blackStone.show();
  whiteStone.show();
}

// 마우스가 올라가 있는 돌을 찾음 (없으면 null)
function getHoveredStone() {
  let mPos = createVector(mouseX, mouseY);
  let stones = [blackStone, whiteStone];
  let hovered = null;
  let closest = Infinity;

  for (let stone of stones) {
    let d = p5.Vector.dist(stone.pos, mPos);
    if (d < stone.w / 2 && d < closest) {
      hovered = stone;
      closest = d;
    }
  }

  return hovered;
}

// 예측 시뮬레이션용: 실제 update()와 같은 순서로 한 프레임 진행
function stepSim(stone) {
  stone.vel.mult(0.99);
  stone.pos.add(stone.vel);
  return bounceSim(stone);
}

function bounceSim(stone) {
  let r = stone.w / 2;
  let bounced = false;

  if (stone.pos.y + r > height) {
    stone.pos.y = height - r;
    stone.vel.y = stone.vel.y * -1;
    bounced = true;
  } else if (stone.pos.y - r < 0) {
    stone.pos.y = r;
    stone.vel.y = stone.vel.y * -1;
    bounced = true;
  }

  if (stone.pos.x + r > width) {
    stone.pos.x = width - r;
    stone.vel.x = stone.vel.x * -1;
    bounced = true;
  } else if (stone.pos.x - r < 0) {
    stone.pos.x = r;
    stone.vel.x = stone.vel.x * -1;
    bounced = true;
  }

  return bounced;
}

// 실제로 튕겼을 때 두 돌이 움직일 경로를 미리 계산
function predictShot(shot, other, force, steps) {
  let a = {
    pos: shot.pos.copy(),
    vel: p5.Vector.add(shot.vel, force),
    w: shot.w,
    mass: shot.mass
  };

  let b = {
    pos: other.pos.copy(),
    vel: other.vel.copy(),
    w: other.w,
    mass: other.mass
  };

  let pathA = [a.pos.copy()];
  let pathB = [b.pos.copy()];
  let bounces = [];

  for (let i = 0; i < steps; i++) {
    let bounced = stepSim(a);
    stepSim(b);

    resolveCollision(a, b);

    bounced = bounceSim(a) || bounced;
    bounceSim(b);

    pathA.push(a.pos.copy());
    pathB.push(b.pos.copy());

    if (bounced) bounces.push(a.pos.copy());
    if (a.vel.magSq() < 0.04 && b.vel.magSq() < 0.04) break;
  }

  return { pathA: pathA, pathB: pathB, bounces: bounces };
}

function drawAimGuide() {
  let stone = getHoveredStone();
  if (!stone) return;

  let other = (stone === blackStone) ? whiteStone : blackStone;
  let mPos = createVector(mouseX, mouseY);
  let force = p5.Vector.sub(stone.pos, mPos);
  if (force.mag() < 1) return;

  let startVel = p5.Vector.add(stone.vel, force);
  let result = predictShot(stone, other, force, 220);

  push();

  // 상대 돌의 예상 경로 (연한 회색)
  noFill();
  stroke(150, 150, 150, 120);
  strokeWeight(1.5);
  drawingContext.setLineDash([4, 6]);
  beginShape();
  for (let p of result.pathB) {
    vertex(p.x, p.y);
  }
  endShape();

  // 내 돌의 예상 경로 (주황 점선)
  stroke(255, 120, 0, 190);
  strokeWeight(2);
  drawingContext.setLineDash([6, 6]);
  beginShape();
  for (let p of result.pathA) {
    vertex(p.x, p.y);
  }
  endShape();
  drawingContext.setLineDash([]);

  // 벽에 부딪히는 지점 표시
  noStroke();
  fill(255, 120, 0, 220);
  for (let p of result.bounces) {
    circle(p.x, p.y, 7);
  }

  // 돌에서 튕겨 나갈 방향 화살표
  let dir = startVel.copy().normalize();
  let len = constrain(startVel.mag() * 3, 20, 70);
  let tip = p5.Vector.add(stone.pos, p5.Vector.mult(dir, len));
  let back = p5.Vector.sub(tip, p5.Vector.mult(dir, 12));
  let perp = createVector(-dir.y, dir.x).mult(6);

  stroke(255, 120, 0);
  strokeWeight(3);
  line(stone.pos.x, stone.pos.y, tip.x, tip.y);

  noStroke();
  fill(255, 120, 0);
  triangle(tip.x, tip.y, back.x + perp.x, back.y + perp.y, back.x - perp.x, back.y - perp.y);

  pop();
}

// 두 돌이 부딪히면 서로 반대 방향으로 튕겨 나감
function resolveCollision(a, b) {
  let diff = p5.Vector.sub(b.pos, a.pos);
  let dist = diff.mag();
  let minDist = (a.w + b.w) / 2;

  if (dist >= minDist) return;

  // 두 돌이 정확히 겹쳐 있으면 임의의 방향으로 밀어냄
  if (dist === 0) {
    diff.set(1, 0);
    dist = 0.001;
  }

  let normal = diff.copy().normalize();

  // 겹친 만큼 양쪽으로 밀어서 떼어 놓음
  let overlap = minDist - dist;
  a.pos.add(p5.Vector.mult(normal, -overlap / 2));
  b.pos.add(p5.Vector.mult(normal, overlap / 2));

  // 충돌 방향의 상대 속도
  let relVel = p5.Vector.sub(b.vel, a.vel);
  let speed = relVel.dot(normal);

  // 이미 멀어지고 있으면 처리하지 않음
  if (speed > 0) return;

  let restitution = 0.9; // 반발력
  let impulse = -(1 + restitution) * speed / (1 / a.mass + 1 / b.mass);

  a.vel.add(p5.Vector.mult(normal, -impulse / a.mass));
  b.vel.add(p5.Vector.mult(normal, impulse / b.mass));
}

// 클릭한 돌을 마우스 반대 방향으로 튕겨 보냄 (알까기)
function mousePressed() {
  flick(blackStone);
  flick(whiteStone);
}

function flick(stone) {
  let mPos = createVector(mouseX, mouseY);
  let kaggi = p5.Vector.sub(stone.pos, mPos);

  if (kaggi.mag() < stone.w / 2) {
    stone.addForce(kaggi);
  }
}
