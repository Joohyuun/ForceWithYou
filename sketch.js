let blackStone;
let whiteStone;

function setup() {
  createCanvas(400, 200);

  blackStone = new Particle(width / 3, height / 2, 50, color(20));
  whiteStone = new Particle(width * 2 / 3, height / 2, 50, color(245));
}

function draw() {
  background(220);

  blackStone.update();
  whiteStone.update();

  resolveCollision(blackStone, whiteStone);

  blackStone.checkEdge();
  whiteStone.checkEdge();

  blackStone.show();
  whiteStone.show();
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
