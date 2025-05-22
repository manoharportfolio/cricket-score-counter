let runs = 0;
let wickets = 0;
let balls = 0;

function updateDisplay() {
  const overs = Math.floor(balls / 6) + "." + (balls % 6);
  document.getElementById("scoreDisplay").innerText = `Score: ${runs}/${wickets}`;
  document.getElementById("overDisplay").innerText = `Overs: ${overs}`;
}

function addRun(value) {
  runs += value;
  balls++;
  updateDisplay();
}

function addWicket() {
  wickets++;
  balls++;
  updateDisplay();
}

function addBall() {
  balls++;
  updateDisplay();
}

function resetMatch() {
  runs = 0;
  wickets = 0;
  balls = 0;
  updateDisplay();
}

updateDisplay(); // initialize on load
