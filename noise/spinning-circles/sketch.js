let circleInterval = 2;
let circleSizeMargin = 60;
let circleStrokeWeight = 4;

let colorPallets = [
  { title: "Dark ocean", colors: ["#00070D", "#011826", "#224459", "#6593A6", "#89D1D9"] },
  { title: "Forest fire", colors: ["#D90452", "#8C0343", "#D9B918", "#D97F30", "#D9593D"] },
  { title: "Summer morning", colors: ["#F3FEB0", "#FEA443", "#705E78", "#A5AAA3", "#812F33"] },
  { title: "Deep forest", colors: ["#334018", "#64732F", "#CAD959", "#B4BF5E", "#242614"] },
  { title: "Late summer night", colors: ["#465E8C", "#F2E205", "#F2B705", "#F29F05", "#F25C05"] },
  { title: "Golder hour", colors: ["#8C566F", "#F2C335", "#F28705", "#F2784B", "#F25244"] },
  { title: "Winter sunset", colors: ["#4F4D8C", "#5F5DA6", "#8F8EBF", "#2E4159", "#262626"] },
  { title: "Mountains", colors: ["#0D070A", "#253B40", "#48594D", "#A69665", "#BF754B"] },
  { title: "Midnight", colors: ["#252C40", "#141A26", "#566073", "#AAB1BF", "#0D0D0D"] },
  { title: "Winter morning", colors: ["#2A3E59", "#54728C", "#F2D98D", "#A6786D", "#D9665B"] },
  { title: "Desert spring", colors: ["#60734D", "#91A672", "#C7D9A0", "#F2B705", "#BF9004"] }
];

let noiseOffSet = 0;
let noiseInterval = 0.5;
let colorPallet;
let circleMaxRadius = 0;
let canvasMiddleX = 0;
let canvasMiddleY = 0;
let circleColors = [];
let numberOfCircles = 0;

const seed = Date.now();
const openSimplex = openSimplexNoise(seed);

function setup() {

  createCanvas(800, 800);

  smooth();


  canvasMiddleX = width / 2;
  canvasMiddleY = height / 2;
  if (width > height) {
    circleMaxRadius = height - circleSizeMargin;
  } else {
    circleMaxRadius = width - circleSizeMargin;
  }

  // pick random color pallet
  colorPallet = colorPallets[floor(random(colorPallets.length))];

  // set circle colors
  numberOfCircles = floor(circleMaxRadius / circleInterval);
  for (let i = 0; i < numberOfCircles; i++) {

    let colorIndex = floor(map(i, 0, numberOfCircles, 0, colorPallet.colors.length));
    console.log(colorIndex);
    let circleColor = color(colorPallet.colors[colorIndex]);
    circleColors[i] = circleColor;

  }

}

function draw() {

  background(0);

  let circleRadius = circleInterval;

  let i = 0;

  for (let i = 0; i < numberOfCircles; i++) {

    let noiseValue = openSimplex.noise3D(noiseOffSet, 1, 1); //noise(noiseOffSet);

    let circleColor = circleColors[i];
    let alpha = map(noiseValue, 0, 1, 100, 200);
    circleColor.setAlpha(alpha);

    stroke(circleColor);
    noFill();
    strokeWeight(circleStrokeWeight);

    ellipse(canvasMiddleX, canvasMiddleY, circleRadius, circleRadius);

    circleRadius += circleInterval;
    noiseOffSet += noiseInterval;

  }

}