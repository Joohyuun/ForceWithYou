let ball;

function setup() {
  createCanvas(400, 200);

  ball = new Particle();
}


function draw() {
  background(220);

  //let gravity = createVector(0, 0.3);
  //ball.addForce(gravity);

  //if(mouseIsPressed) {
   // let wind = createVector(0.2, 0);
   //  ball.addForce(wind);
  // }
 
 ball.update();
  ball.show();
}

function mouseClicked() {
  let mPos = createVector(mouseX, mouseY);
  //let kaggi = ball.pos - mPos;
  let kaggi = p5.Vector.sub(ball.pos, mPos);

  if(kaggi.mag() < ball.w/2) {
    ball.addForce(kaggi);
  }
}