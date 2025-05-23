let innings = 1, runs = 0, wickets = 0, balls = 0;
let oversLimit = 0, target = 0;
let team1 = "", team2 = "";
let battingTeam = "", bowlingTeam = "";
let team1Players = [], team2Players = [], currentPlayers = [], currentBowlers = [];
let playerStats = [], bowlerStats = [], ballLog = [];
let strikerIndex = 0, nonStrikerIndex = 1, currentBowler = 0;

function updateSelectors() {
  const strikerSel = document.getElementById("strikerSelect");
  const nonStrikerSel = document.getElementById("nonStrikerSelect");
  const bowlerSel = document.getElementById("bowlerSelect");

  strikerSel.innerHTML = "";
  nonStrikerSel.innerHTML = "";
  bowlerSel.innerHTML = "";

  currentPlayers.forEach((player, i) => {
    strikerSel.innerHTML += `<option value="${i}">${player}</option>`;
    nonStrikerSel.innerHTML += `<option value="${i}">${player}</option>`;
  });

  currentBowlers.forEach((player, i) => {
    bowlerSel.innerHTML += `<option value="${i}">${player}</option>`;
  });

  strikerSel.value = strikerIndex;
  nonStrikerSel.value = nonStrikerIndex;
  bowlerSel.value = currentBowler;
}

function updateDisplay() {
  const overs = `${Math.floor(balls / 6)}.${balls % 6}`;
  document.getElementById("scoreDisplay").innerText = `Score: ${runs}/${wickets}`;
  document.getElementById("overDisplay").innerText = `Overs: ${overs}`;
  document.getElementById("inningsInfo").innerText = `Innings ${innings}`;
  document.getElementById("ballTracker").innerText = ballLog.join(" ");

  const batStats = playerStats.map(p => `${p.name} - ${p.runs} (${p.balls}) ${p.out ? "" : "*"}`).join("\n");
  document.getElementById("playerStats").innerText = batStats;

  const bowlStats = bowlerStats.map(p => `${p.name} - ${p.overs} ov, ${p.runs} runs, ${p.wickets} wickets`).join("\n");
  document.getElementById("bowlerStats").innerText = bowlStats;

  if (innings === 2) {
    document.getElementById("targetInfo").innerText = `Target: ${target} (${Math.floor((target - 1) / 6)}.${(target - 1) % 6} overs)`;
  }
}

function isMatchOver() {
  return innings === 2 && (balls >= oversLimit * 6 || wickets >= currentPlayers.length - 1 || runs >= target);
}

function addRun(value) {
  if (isMatchOver()) return;
  playerStats[strikerIndex].runs += value;
  playerStats[strikerIndex].balls++;
  bowlerStats[currentBowler].runs += value;
  runs += value;
  balls++;
  updateBowlerOvers();
  ballLog.push(value);
  if (value % 2 !== 0) [strikerIndex, nonStrikerIndex] = [nonStrikerIndex, strikerIndex];
  checkInningsOver();
  updateDisplay();
}

function addBall() {
  if (isMatchOver()) return;
  playerStats[strikerIndex].balls++;
  balls++;
  updateBowlerOvers();
  ballLog.push(".");
  checkInningsOver();
  updateDisplay();
}

function addWicket() {
  if (isMatchOver()) return;
  playerStats[strikerIndex].out = true;
  playerStats[strikerIndex].balls++;
  bowlerStats[currentBowler].wickets++;
  balls++;
  wickets++;
  updateBowlerOvers();
  ballLog.push("W");
  updateDisplay();
}

function addExtra(type) {
  if (isMatchOver()) return;
  runs++;
  bowlerStats[currentBowler].runs++;

  if (type === "NB" || type === "WD") {
    ballLog.push(type);
  } else {
    ballLog.push(type);
    balls++;
    updateBowlerOvers();
  }

  updateDisplay();
}

function updateBowlerOvers() {
  const bowler = bowlerStats[currentBowler];
  bowler.balls = (bowler.balls || 0) + 1;
  const completedOvers = Math.floor(bowler.balls / 6);
  const partial = bowler.balls % 6;
  bowler.overs = `${completedOvers}.${partial}`;
}

function setStriker(index) {
  strikerIndex = parseInt(index);
  updateDisplay();
}

function setNonStriker(index) {
  nonStrikerIndex = parseInt(index);
  updateDisplay();
}

function setBowler(index) {
  currentBowler = parseInt(index);
  updateDisplay();
}

function startMatch() {
  team1 = document.getElementById("teamAName").value;
  team2 = document.getElementById("teamBName").value;
  team1Players = document.getElementById("playersTeamA").value.split(",").map(x => x.trim());
  team2Players = document.getElementById("playersTeamB").value.split(",").map(x => x.trim());
  oversLimit = parseInt(document.getElementById("oversInput").value);
  const schedule = document.getElementById("matchSchedule").value;
  const tossWinner = document.getElementById("tossWinner").value;
  const tossDecision = document.getElementById("tossDecision").value;

  if ((tossWinner === "A" && tossDecision === "bat") || (tossWinner === "B" && tossDecision === "bowl")) {
    battingTeam = team1;
    bowlingTeam = team2;
    currentPlayers = [...team1Players];
    currentBowlers = [...team2Players];
  } else {
    battingTeam = team2;
    bowlingTeam = team1;
    currentPlayers = [...team2Players];
    currentBowlers = [...team1Players];
  }

  playerStats = currentPlayers.map(name => ({ name, runs: 0, balls: 0, out: false }));
  bowlerStats = currentBowlers.map(name => ({ name, overs: "0.0", runs: 0, wickets: 0, balls: 0 }));

  document.getElementById("matchTitle").innerText = `${team1} vs ${team2}`;
  document.getElementById("scheduleInfo").innerText = schedule;
  document.getElementById("matchSetup").style.display = "none";
  document.getElementById("scoreboard").style.display = "block";

  strikerIndex = 0;
  nonStrikerIndex = 1;
  currentBowler = 0;

  updateSelectors();
  updateDisplay();
}

function checkInningsOver() {
  if (balls >= oversLimit * 6 || wickets >= currentPlayers.length - 1 || (innings === 2 && runs >= target)) {
    if (innings === 1) {
      innings = 2;
      target = runs + 1;
      resetInnings();
      alert("Innings Over! Target is " + target);
    } else {
      endMatch();
    }
  }
}

function resetInnings() {
  runs = 0; wickets = 0; balls = 0; ballLog = [];
  if (battingTeam === team1) {
    battingTeam = team2;
    bowlingTeam = team1;
    currentPlayers = [...team2Players];
    currentBowlers = [...team1Players];
  } else {
    battingTeam = team1;
    bowlingTeam = team2;
    currentPlayers = [...team1Players];
    currentBowlers = [...team2Players];
  }

  playerStats = currentPlayers.map(name => ({ name, runs: 0, balls: 0, out: false }));
  bowlerStats = currentBowlers.map(name => ({ name, overs: "0.0", runs: 0, wickets: 0, balls: 0 }));
  strikerIndex = 0; nonStrikerIndex = 1; currentBowler = 0;
  updateSelectors();
}

function endMatch() {
  let result = "";
  if (runs >= target) result = `${battingTeam} won by ${10 - wickets} wickets`;
  else if (runs < target - 1) result = `${bowlingTeam} won by ${target - 1 - runs} runs`;
  else result = "Match Drawn!";

  const batSummary = playerStats.map(p => `${p.name} - ${p.runs} (${p.balls}) ${p.out ? "" : "*"}`).join("\n");
  const bowlSummary = bowlerStats.map(p => `${p.name} - ${p.overs} overs, ${p.runs} runs, ${p.wickets} wickets`).join("\n");

  document.getElementById("matchSummary").innerText = `
Target: ${target}
Final Score: ${runs}/${wickets}

Batting (${battingTeam}):
${batSummary}

Bowling (${bowlingTeam}):
${bowlSummary}

Result: ${result}
  `;
  alert(result);
}

function resetMatch() {
  location.reload();
}
