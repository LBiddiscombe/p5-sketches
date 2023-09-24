// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

let lsystem;
let turtle;

function setup() {
  createCanvas(400, 400);

  const configs = {
    fern: {
      generations: 7,
      len: 1,
      axiom: "X",
      rules: { X: "F[+X][-X]FX", F: "FF" },
      angle: radians(-25.7)
    },
    conifer: {
      generations: 2,
      len: 10,
      axiom: "F",
      rules: {
        F: "F[+F-F+F][-F+F-F]"
      },
      angle: radians(30)

    }
  };

  let config = configs.conifer;
  lsystem = new LSystem(config.axiom, config.rules);
  turtle = new Turtle(config.len, config.angle);

  for (let i = 0; i < config.generations; i++) {
    lsystem.generate();
  }
}

function draw() {
  background(255);
  translate(width / 2, height);
  turtle.render(lsystem.sentence);
  noLoop();
}