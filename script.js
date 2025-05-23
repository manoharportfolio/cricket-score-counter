let innings = 1, runs = 0, wickets = 0, balls = 0, target = 0;
let oversLimit = 0, strikerIndex = 0, nonStrikerIndex = 1, currentBowler = 0;
let team1 = "", team2 = "", battingTeam = "", bowlingTeam = "";
let team1Players = [], team2Players = [], currentPlayers = [], currentBowlers = [];
let playerStats = [], bowlerStats = [], ballLog = [];
let firstInningsStats = null;

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

  const batStats = playerStats.map((p, i) => {
    let label = i === strikerIndex ? " (Striker)" : i === nonStrikerIndex ? " (Non-Striker)" : "";
    return `${p.name}${label} - ${p.runs} (${p.balls}) ${p.out ? "" : "*"}`;
  }).join("\n");

  const bowlStats = bowlerStats.map((p, i) => {
    let label = i === currentBowler ? " (Current)" : "";
    return `${p.name}${label} - ${p.overs} ov, ${p.runs} runs, ${p.wickets} wickets`;
  }).join("\n");

  document.getElementById("playerStats").innerText = batStats;
  document.getElementById("bowlerStats").innerText = bowlStats;

  if (innings === 2) {
    document.getElementById("targetInfo").innerText = `Target: ${target} (${Math.floor((target - 1) / 6)}.${(target - 1) % 6} overs)`;
  }
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

  strikerIndex = 0; nonStrikerIndex = 1; currentBowler = 0;

  document.getElementById("matchTitle").innerText = `${team1} vs ${team2}`;
  document.getElementById("scheduleInfo").innerText = schedule;
  document.getElementById("matchSetup").style.display = "none";
  document.getElementById("scoreboard").style.display = "block";

  updateSelectors();
  updateDisplay();
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
  checkOverChange();
  checkInningsOver();
  updateDisplay();
}

function addBall() {
  if (isMatchOver()) return;
  playerStats[strikerIndex].balls++;
  balls++;
  updateBowlerOvers();
  ballLog.push(".");
  checkOverChange();
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
  showNewBatsmanPrompt();
  checkOverChange();
  checkInningsOver();
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

  checkOverChange();
  updateDisplay();
}

function updateBowlerOvers() {
  const b = bowlerStats[currentBowler];
  b.balls = (b.balls || 0) + 1;
  const ov = Math.floor(b.balls / 6);
  const rem = b.balls % 6;
  b.overs = `${ov}.${rem}`;
}

function checkOverChange() {
  if (balls % 6 === 0 && balls !== 0) {
    showNewBowlerPrompt();
  }
}

// Prompts
function showNewBatsmanPrompt() {
  const modal = document.getElementById("newBatsmanModal");
  const select = document.getElementById("newBatsmanSelect");
  select.innerHTML = "";

  currentPlayers.forEach((p, i) => {
    if (!playerStats[i].out && i !== nonStrikerIndex && i !== strikerIndex) {
      select.innerHTML += `<option value="${i}">${p}</option>`;
    }
  });

  modal.style.display = "flex";
}

function confirmNewBatsman() {
  const i = parseInt(document.getElementById("newBatsmanSelect").value);
  strikerIndex = i;
  document.getElementById("newBatsmanModal").style.display = "none";
  updateSelectors();
  updateDisplay();
}

function showNewBowlerPrompt() {
  const modal = document.getElementById("newBowlerModal");
  const select = document.getElementById("newBowlerSelect");
  select.innerHTML = "";

  currentBowlers.forEach((p, i) => {
    if (i !== currentBowler) {
      select.innerHTML += `<option value="${i}">${p}</option>`;
    }
  });

  modal.style.display = "flex";
}

function confirmNewBowler() {
  currentBowler = parseInt(document.getElementById("newBowlerSelect").value);
  document.getElementById("newBowlerModal").style.display = "none";
  updateSelectors();
  updateDisplay();
}
function checkInningsOver() {
  if (balls >= oversLimit * 6 || wickets >= currentPlayers.length - 1 || (innings === 2 && runs >= target)) {
    if (innings === 1) {
      // Save 1st innings stats
      firstInningsStats = {
        team: battingTeam,
        runs,
        wickets,
        overs: `${Math.floor(balls / 6)}.${balls % 6}`,
        players: [...playerStats],
        bowlers: [...bowlerStats]
      };

      // Prepare 2nd innings
      innings = 2;
      target = runs + 1;
      balls = 0; runs = 0; wickets = 0; ballLog = [];

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
      strikerIndex = 0;
      nonStrikerIndex = 1;
      currentBowler = 0;

      updateSelectors();
      updateDisplay();
      alert("End of First Innings. Target: " + target);
    } else {
      endMatch();
    }
  }
}

function endMatch() {
  let result = "";
  if (runs >= target) {
    result = `${battingTeam} won by ${10 - wickets} wickets`;
  } else if (runs < target - 1) {
    result = `${bowlingTeam} won by ${target - 1 - runs} runs`;
  } else {
    result = "Match Drawn!";
  }

  // Second innings data
  const secondInningsStats = {
    team: battingTeam,
    runs,
    wickets,
    overs: `${Math.floor(balls / 6)}.${balls % 6}`,
    players: [...playerStats],
    bowlers: [...bowlerStats]
  };

  let summary = `🎯 Target: ${target}\n\n`;

  summary += `--- First Innings (${firstInningsStats.team}) ---\n`;
  summary += `Score: ${firstInningsStats.runs}/${firstInningsStats.wickets} (${firstInningsStats.overs} overs)\n`;
  summary += `Batting:\n${firstInningsStats.players.map(p => `${p.name} - ${p.runs} (${p.balls}) ${p.out ? '' : '*'}`).join("\n")}\n`;
  summary += `Bowling:\n${firstInningsStats.bowlers.map(b => `${b.name} - ${b.overs} ov, ${b.runs} runs, ${b.wickets} wickets`).join("\n")}\n\n`;

  summary += `--- Second Innings (${secondInningsStats.team}) ---\n`;
  summary += `Score: ${secondInningsStats.runs}/${secondInningsStats.wickets} (${secondInningsStats.overs} overs)\n`;
  summary += `Batting:\n${secondInningsStats.players.map(p => `${p.name} - ${p.runs} (${p.balls}) ${p.out ? '' : '*'}`).join("\n")}\n`;
  summary += `Bowling:\n${secondInningsStats.bowlers.map(b => `${b.name} - ${b.overs} ov, ${b.runs} runs, ${b.wickets} wickets`).join("\n")}\n\n`;

  summary += `🏆 Result: ${result}`;

  document.getElementById("matchSummary").innerText = summary;
  alert(result);
}

function setStriker(index) {
  strikerIndex = parseInt(index);
  updateSelectors();
  updateDisplay();
}

function setNonStriker(index) {
  nonStrikerIndex = parseInt(index);
  updateSelectors();
  updateDisplay();
}

function setBowler(index) {
  currentBowler = parseInt(index);
  updateSelectors();
  updateDisplay();
}

function resetMatch() {
  location.reload();
}
