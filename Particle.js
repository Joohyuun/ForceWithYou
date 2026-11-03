class Particle {
  constructor(x, y, w, c) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);

    this.c = c;
    this.w = w;
    this.mass = w * w;
  }

  addForce(aForce) {
    this.acc.add(aForce);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.mult(0.99); // 마찰력: 알까기판 위에서 서서히 멈춤
    this.pos.add(this.vel);

    this.acc.set(0, 0);
    this.checkEdge();
  }

  // 네 벽 모두에 부딪히면 튕겨 나옴
  checkEdge() {
    let r = this.w / 2;

    if (this.pos.y + r > height) {
      this.pos.y = height - r;
      this.vel.y = this.vel.y * -1;
    }

    if (this.pos.y - r < 0) {
      this.pos.y = r;
      this.vel.y = this.vel.y * -1;
    }

    if (this.pos.x + r > width) {
      this.pos.x = width - r;
      this.vel.x = this.vel.x * -1;
    }

    if (this.pos.x - r < 0) {
      this.pos.x = r;
      this.vel.x = this.vel.x * -1;
    }
  }

  show() {
    stroke(0);
    strokeWeight(1);
    fill(this.c);
    circle(this.pos.x, this.pos.y, this.w);
  }
}
