let innings = 1;
let runs = 0, wickets = 0, balls = 0;
let oversLimit = 0;
let team1 = "", team2 = "";
let battingTeam = "", bowlingTeam = "";
let team1Players = [], team2Players = [];
let team1Score = 0, target = 0;
let ballLog = [];
let matchId = Date.now().toString();

let strikerIndex = 0;
let nonStrikerIndex = 1;
let currentPlayers = [], playerStats = [], bowlerStats = [], currentBowler = null;

window.startMatch = function () {
  team1 = document.getElementById("teamAName").value;
  team2 = document.getElementById("teamBName").value;
  team1Players = document.getElementById("playersTeamA").value.split(",").map(p => p.trim());
  team2Players = document.getElementById("playersTeamB").value.split(",").map(p => p.trim());
  oversLimit = parseInt(document.getElementById("oversInput").value);
  const schedule = document.getElementById("matchSchedule").value;
  const tossWinner = document.getElementById("tossWinner").value;
  const tossDecision = document.getElementById("tossDecision").value;
  document.getElementById("matchIdDisplay").innerText = `Match ID: ${matchId}`;


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

  playerStats = currentPlayers.map(p => ({ name: p, runs: 0, balls: 0, out: false }));
  bowlerStats = (bowlingTeam === team1 ? team1Players : team2Players).map(p => ({ name: p, overs: 0, balls: 0, runs: 0, wickets: 0 }));

  populatePlayerDropdowns();
  updateDisplay();
  saveMatchData();
};

window.addRun = function (value) {
  if (isMatchOver() || !currentBowler) return alert("Please select a bowler first.");
  runs += value;
  balls++;
  ballLog.push(value);
  playerStats[strikerIndex].runs += value;
  playerStats[strikerIndex].balls++;
  currentBowler.balls++;
  currentBowler.runs += value;
  if (value % 2 !== 0) swapStrikers();
  checkOverComplete();
  checkInningsOver();
  updateDisplay();
  saveMatchData();
};

window.addWicket = function () {
  if (isMatchOver() || !currentBowler) return alert("Please select a bowler first.");
  ballLog.push("W");
  balls++;
  wickets++;
  currentBowler.balls++;
  currentBowler.wickets++;
  playerStats[strikerIndex].out = true;
  updateDisplay();
  showNewBatsmanModal();
  checkOverComplete();
  checkInningsOver();
  saveMatchData();
};

window.addBall = function () {
  if (isMatchOver() || !currentBowler) return alert("Please select a bowler first.");
  ballLog.push(".");
  balls++;
  playerStats[strikerIndex].balls++;
  currentBowler.balls++;
  checkOverComplete();
  checkInningsOver();
  updateDisplay();
  saveMatchData();
};

window.addExtra = function (type) {
  if (isMatchOver() || !currentBowler) return alert("Please select a bowler first.");
  runs++;
  ballLog.push(type);
  currentBowler.runs++;
  updateDisplay();
  saveMatchData();
};
window.copyMatchId = function () {
  navigator.clipboard.writeText(matchId)
    .then(() => alert("Match ID copied to clipboard!"))
    .catch(() => alert("Failed to copy Match ID."));
};

window.resetMatch = function () {
  location.reload();
};

function isMatchOver() {
  return innings === 2 && (balls >= oversLimit * 6 || wickets >= currentPlayers.length - 1);
}

function checkOverComplete() {
  if (balls % 6 === 0) showNewBowlerModal();
}

function checkInningsOver() {
  if (balls >= oversLimit * 6 || wickets >= currentPlayers.length - 1) {
    if (innings === 1) {
      team1Score = runs;
      target = team1Score + 1;
      innings = 2;
      runs = 0; wickets = 0; balls = 0;
      strikerIndex = 0; nonStrikerIndex = 1;
      currentPlayers = (battingTeam === team1) ? [...team2Players] : [...team1Players];
      battingTeam = (battingTeam === team1) ? team2 : team1;
      bowlingTeam = (bowlingTeam === team1) ? team2 : team1;
      playerStats = currentPlayers.map(p => ({ name: p, runs: 0, balls: 0, out: false }));
      bowlerStats = (bowlingTeam === team1 ? team1Players : team2Players).map(p => ({ name: p, overs: 0, balls: 0, runs: 0, wickets: 0 }));
      alert("Innings over. Next team will bat.");
    } else {
      endMatch();
    }
  }
}

function endMatch() {
  // Disable all buttons
  document.querySelectorAll("button").forEach(btn => {
    btn.disabled = true;
    btn.style.backgroundColor = "#ccc";
    btn.style.cursor = "not-allowed";
  });

  // Result
  const result = (runs > team1Score)
    ? `${battingTeam} won by ${10 - wickets} wickets`
    : (runs < team1Score)
      ? `${bowlingTeam} won by ${team1Score - runs} runs`
      : "Match Drawn!";

  // Batting Scorecard
  const battingSummary = playerStats.map(p =>
    `${p.name} - ${p.runs} (${p.balls})${p.out ? '' : ' *'}`
  ).join('\n');

  // Bowling Scorecard
  const bowlingSummary = bowlerStats.map(b =>
    `${b.name} - ${Math.floor(b.balls / 6)}.${b.balls % 6} overs, ${b.runs}R, ${b.wickets}W`
  ).join('\n');

  // Match Summary Text
  const summary = `
🏏 Match ID: ${matchId}

--- First Innings (${bowlingTeam}) ---
Score: ${team1Score}/${playerStats.length - 1} in ${oversLimit} overs

--- Second Innings (${battingTeam}) ---
Score: ${runs}/${wickets} in ${Math.floor(balls / 6)}.${balls % 6} overs

Batting:
${battingSummary}

Bowling:
${bowlingSummary}

Result: ${result}
`;

  // Update UI
  document.getElementById("matchSummary").innerText = summary;
  document.getElementById("matchIdDisplay").innerText = `Match ID: ${matchId}`;
  // 🔍 Find top scorer
const topPlayer = playerStats.reduce((max, p) => p.runs > max.runs ? p : max, { name: "", runs: 0 });

const potm = `🏅 Player of the Match: ${topPlayer.name} (${topPlayer.runs} runs)`;

// 📌 Append to summary
document.getElementById("matchSummary").innerText += `\n\n${potm}`;

}


function swapStrikers() {
  [strikerIndex, nonStrikerIndex] = [nonStrikerIndex, strikerIndex];
}

function populatePlayerDropdowns() {
  const strikerSelect = document.getElementById("strikerSelect");
  const nonStrikerSelect = document.getElementById("nonStrikerSelect");
  const bowlerSelect = document.getElementById("bowlerSelect");

  strikerSelect.innerHTML = "";
  nonStrikerSelect.innerHTML = "";
  bowlerSelect.innerHTML = "";

  currentPlayers.forEach((player, index) => {
    strikerSelect.innerHTML += `<option value="${index}">${player}</option>`;
    nonStrikerSelect.innerHTML += `<option value="${index}">${player}</option>`;
  });

  const bowlers = bowlingTeam === team1 ? team1Players : team2Players;
  bowlers.forEach((player, index) => {
    bowlerSelect.innerHTML += `<option value="${index}">${player}</option>`;
  });
}

window.setStriker = function (index) {
  strikerIndex = parseInt(index);
  updateDisplay();
};

window.setNonStriker = function (index) {
  nonStrikerIndex = parseInt(index);
  updateDisplay();
};

window.setBowler = function (index) {
  const bowlers = bowlingTeam === team1 ? team1Players : team2Players;
  const selectedName = bowlers[index];
  currentBowler = bowlerStats.find(b => b.name === selectedName);
  updateDisplay();
};

function showNewBatsmanModal() {
  const modal = document.getElementById("newBatsmanModal");
  const select = document.getElementById("newBatsmanSelect");
  select.innerHTML = "";

  currentPlayers.forEach((p, i) => {
    if (!playerStats[i].out && i !== strikerIndex && i !== nonStrikerIndex) {
      select.innerHTML += `<option value="${i}">${p}</option>`;
    }
  });

  modal.style.display = "block";
}

window.confirmNewBatsman = function () {
  const newIndex = parseInt(document.getElementById("newBatsmanSelect").value);
  strikerIndex = newIndex;
  document.getElementById("newBatsmanModal").style.display = "none";
  updateDisplay();
};

function showNewBowlerModal() {
  const modal = document.getElementById("newBowlerModal");
  const select = document.getElementById("newBowlerSelect");
  select.innerHTML = "";

  const bowlers = bowlingTeam === team1 ? team1Players : team2Players;
  bowlers.forEach((p, i) => {
    select.innerHTML += `<option value="${i}">${p}</option>`;
  });

  modal.style.display = "block";
}

window.confirmNewBowler = function () {
  const newIndex = parseInt(document.getElementById("newBowlerSelect").value);
  setBowler(newIndex);
  document.getElementById("newBowlerModal").style.display = "none";
};

function updateDisplay() {
  document.getElementById("scoreDisplay").innerText = `Score: ${runs}/${wickets}`;
  document.getElementById("overDisplay").innerText = `Overs: ${Math.floor(balls / 6)}.${balls % 6}`;
  document.getElementById("inningsInfo").innerText = `Innings ${innings}`;
  document.getElementById("targetInfo").innerText = innings === 2 ? `Target: ${target}` : "";

  document.getElementById("ballTracker").innerText = ballLog.join(" ");

  const playersHTML = playerStats.map((p, i) =>
    `${p.name}${i === strikerIndex ? " (Striker)" : i === nonStrikerIndex ? " (Non-Striker)" : ""}: ${p.runs} (${p.balls})${p.out ? " OUT" : ""}`
  ).join("<br>");
  document.getElementById("playerStats").innerHTML = playersHTML;

 const bowlersHTML = bowlerStats.map(b =>
  `${b.name}${currentBowler && b.name === currentBowler.name ? ' (Current)' : ''}: ${Math.floor(b.balls / 6)}.${b.balls % 6} overs, ${b.runs}R, ${b.wickets}W`
).join("<br>");
  document.getElementById("bowlerStats").innerHTML = bowlersHTML;
}

function saveMatchData() {
  if (typeof window.sendToFirebase === 'function') {
    window.sendToFirebase(matchId, {
      createdBy: window.currentUserUid || "",
      matchId, // 👈 save it!
      team1, team2, battingTeam, bowlingTeam,
      innings, target, oversLimit, balls, runs, wickets,
      strikerIndex, nonStrikerIndex, currentBowler,
      playerStats, bowlerStats, ballLog
    });
  }
}


