let innings = 1;
let runs = 0, wickets = 0, balls = 0;
let oversLimit = 0;
let team1 = "", team2 = "";
let battingTeam = "", bowlingTeam = "";
let team1Players = [], team2Players = [];
let team1Score = 0;
let ballLog = [];

let strikerIndex = 0;
let nonStrikerIndex = 1;
let currentPlayers = [];

function updateDisplay() {
  const overs = Math.floor(balls / 6) + "." + (balls % 6);
  document.getElementById("scoreDisplay").innerText = `Score: ${runs}/${wickets}`;
  document.getElementById("overDisplay").innerText = `Overs: ${overs}`;
  document.getElementById("inningsInfo").innerText = `Innings ${innings}`;
  document.getElementById("ballTracker").innerText = ballLog.join(" ");
  document.getElementById("strikerName").innerText = currentPlayers[strikerIndex] || "Out";
  document.getElementById("nonStrikerName").innerText = currentPlayers[nonStrikerIndex] || "Out";
}

function addRun(value) {
  if (isMatchOver()) return;
  runs += value;
  balls++;
  ballLog.push(value);
  if (value % 2 !== 0) swapStrikers();
  checkInningsOver();
  updateDisplay();
}

function addWicket() {
  if (isMatchOver()) return;
  ballLog.push("W");
  wickets++;
  balls++;
  strikerIndex = wickets + 1;
  checkInningsOver();
  updateDisplay();
}

function addBall() {
  if (isMatchOver()) return;
  ballLog.push(".");
  balls++;
  checkInningsOver();
  updateDisplay();
}

function addExtra(type) {
  if (isMatchOver()) return;
  runs += 1;
  ballLog.push(type);
  updateDisplay();
}

function resetMatch() {
  location.reload();
}

function swapStrikers() {
  let temp = strikerIndex;
  strikerIndex = nonStrikerIndex;
  nonStrikerIndex = temp;
}

function startMatch() {
  team1 = document.getElementById("teamAName").value;
  team2 = document.getElementById("teamBName").value;
  team1Players = document.getElementById("playersTeamA").value.split(",").map(p => p.trim());
  team2Players = document.getElementById("playersTeamB").value.split(",").map(p => p.trim());
  oversLimit = parseInt(document.getElementById("oversInput").value);
  const schedule = document.getElementById("matchSchedule").value;
  const tossWinner = document.getElementById("tossWinner").value;
  const tossDecision = document.getElementById("tossDecision").value;

  if (!team1 || !team2 || team1Players.length < 2 || team2Players.length < 2 || isNaN(oversLimit)) {
    alert("Please fill all required fields with at least 2 players per team.");
    return;
  }

  if ((tossWinner === "A" && tossDecision === "bat") || (tossWinner === "B" && tossDecision === "bowl")) {
    battingTeam = team1;
    bowlingTeam = team2;
    currentPlayers = [...team1Players];
  } else {
    battingTeam = team2;
    bowlingTeam = team1;
    currentPlayers = [...team2Players];
  }

  document.getElementById("matchTitle").innerText = `${team1} vs ${team2}`;
  document.getElementById("scheduleInfo").innerText = schedule || "Now";
  document.getElementById("matchSetup").style.display = "none";
  document.getElementById("scoreboard").style.display = "block";

  updateDisplay();
}

function checkInningsOver() {
  if (balls >= oversLimit * 6 || wickets >= currentPlayers.length - 1) {
    if (innings === 1) {
      team1Score = runs;
      innings = 2;
      runs = 0;
      wickets = 0;
      balls = 0;
      ballLog = [];
      strikerIndex = 0;
      nonStrikerIndex = 1;

      if (battingTeam === team1) {
        battingTeam = team2;
        bowlingTeam = team1;
        currentPlayers = [...team2Players];
      } else {
        battingTeam = team1;
        bowlingTeam = team2;
        currentPlayers = [...team1Players];
      }

      alert("Innings Over! Now " + battingTeam + " will bat.");
    } else {
      endMatch();
    }
  }
}

function isMatchOver() {
  return innings === 2 && (balls >= oversLimit * 6 || wickets >= currentPlayers.length - 1);
}

function endMatch() {
  let result = "";
  const team2Score = runs;

  if (team2Score > team1Score) {
    result = `${battingTeam} won by ${10 - wickets} wickets`;
  } else if (team2Score < team1Score) {
    result = `${bowlingTeam} won by ${team1Score - team2Score} runs`;
  } else {
    result = "Match Drawn!";
  }

  document.getElementById("matchSummary").innerText = `
  Final Score:
  ${team1}: ${battingTeam === team1 ? team2Score : team1Score}
  ${team2}: ${battingTeam === team2 ? team2Score : team1Score}
  
  Result: ${result}
  `;
  alert(result);
}
