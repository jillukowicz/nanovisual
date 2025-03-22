// Constants
const ROWS = 4;
const COLS = 4;
const PADDING = 20;
const CELL_COUNT = ROWS * COLS;
const CELL_RATIO = 15;
const CANVAS_COLOR = 'black';

//VARIABLES
let mic;
let amplitude;
let sound;
let mode = 0;
let debug = true;
let cellSize;
let startingX;
let startingY;
let ampLevelsInTime = new Array(10);

let nanovisual = new p5((sketch) => {

  sketch.setup = () => { 
    sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
    sketch.background(CANVAS_COLOR);
    sketch.noStroke();
    if (debug) {
      mode = 2;
    }

    mic = new p5.AudioIn();
    mic.start();
    amplitude = new p5.Amplitude();
    amplitude.setInput(sound);
    // amplitude.smooth(10);
    sound.play();
    amplitude.setInput(mic);
  }

  sketch.preload = () => {
    sound = sketch.loadSound('sound.wav');
  }

  sketch.draw = () => {
    cellSize = sketch.round(sketch.windowWidth / CELL_RATIO);
    startingX = (sketch.windowWidth - cellSize * COLS) / 2;
    startingY = (sketch.windowHeight - cellSize * ROWS) / 2;
    renderCells();
  }

  sketch.windowResized = () => {
    sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
  }

  sketch.mousePressed = () => {
    mode += 1;
    sketch.redraw();
  }

  let renderCells = () => {
    sketch.background(CANVAS_COLOR);
    if (mode <= 1) {
      welcomeScreen(mode);
      return;
    } else {
      grid();
    }
  }

  let grid = () => {
    sketch.textAlign(sketch.LEFT);
    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        drawCell(i, j);
        visualizeAudio(i, j, amplitude);
      }
    }
  }

  const cellLocation = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  }

  let drawCell = (i, j) => {
    let location = locateCell(i, j);
    sketch.fill('white');
    sketch.rect(location.x, location.y, cellSize, cellSize);
  }

  let amplitudeThreshold = (amplitude, location) => {
    let ampLevel = logMap(amplitude.getLevel(), 0, 1.0, cellSize, 0);
    let ampColor = logMap(ampLevel, 0, cellSize, 220, 40);
    sketch.fill(ampColor);
    sketch.rect(location.x, location.y + ampLevel, cellSize, cellSize - ampLevel);
  }

  let amplitudeOverTime = (amplitude, location) => {
    
    let levelWidth = cellSize / (ampLevelsInTime.length);
    ampLevelsInTime.push(amplitude.getLevel()); 
    ampLevelsInTime.splice(0, 1);
    
    for (var i = 0; i < ampLevelsInTime.length; i++) {  
      
      let x = location.x+(i*levelWidth);
      let ampLevel = logMap(ampLevelsInTime[i], 0, 1.0, cellSize, 0);
      drawText(ampLevel, 100, 100 + (i*20));
      let ampColor = logMap(ampLevel, 0, cellSize, 220, 40); 

      sketch.fill(ampColor); 
      sketch.rect(x, location.y +ampLevel, levelWidth, cellSize-ampLevel);
    }
  }

  let amplitudeRectangle = (amplitude, location) => {
    
    sketch.rectMode(sketch.CENTER);
    let ampLevel = logMap(amplitude.getLevel(), 0, 1.0, cellSize, 0);
    let ampColor = logMap(ampLevel, 0, cellSize, 220, 40); 
    let x = location.x + (cellSize/2);
    let y = location.y + (cellSize/2);
    sketch.stroke(ampColor);
    sketch.strokeWeight(cellSize/20);
    sketch.noFill();
    sketch.rect(x,y, cellSize - ampLevel, cellSize - ampLevel);
    sketch.rectMode(sketch.CORNER);
    sketch.noStroke();
  }

  let visualizeAudio = (i, j, amplitude) => {
    let location = locateCell(i, j);
    if (i == 0 && j == 0) {
      amplitudeThreshold(amplitude, location);
    }
    if (i == 1 && j == 0) {
      amplitudeOverTime(amplitude, location);
    }
    if (i == 2 && j == 0) {
      amplitudeRectangle(amplitude, location);
    }
  }

  let locateCell = (i, j) => { 
    return new cellLocation(
      startingX + i * cellSize + i * PADDING,
      startingY + j * cellSize + j * PADDING 
    );
  }

  let welcomeScreen = (mode) => {
    sketch.textAlign(sketch.CENTER);
    sketch.fill('white');
    drawText('nanovisual', sketch.windowWidth / 2, sketch.windowHeight / 2);
    if (mode == 1) {
      drawText('@ jakub illukowicz', sketch.windowWidth / 2, sketch.windowHeight / 2 + 20);
    }
    return;
  }

  let drawText = (content, x, y) => {
    sketch.fill('white');
    // sketch.textFont('Pixelify Sans');
    let size = sketch.windowWidth / 150;
    sketch.textSize(size);
    sketch.text(content, x, y);
  }

  let debugInfo = (amplitude) => {
    drawText(amplitude.getLevel(), 5, (50 + row * size + 20));
  }


  //logMap(val, inMin, inMax, outMin, outMax)
  let logMap = (...args) => {
    for (var i = 0; i < args.length; i++) { 
      if (args[i] === 0) {
        args[i] = 0.0000000000000001;
      }
    }

    let minv = Math.log(args[3]);
    let maxv = Math.log(args[4]);

    let numerator = maxv - minv;
    let denom = args[2] - args[1];

    if (denom === 0) {
      denom = 0.000000000001;
    }

    let scale = numerator / denom;

    return Math.exp(minv + scale * (args[0] - args[1]));
  }

});