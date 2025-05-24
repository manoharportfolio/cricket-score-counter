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


window.addRun = addRun;
window.addWicket = addWicket;
window.addBall = addBall;
window.addExtra = addExtra;
window.resetMatch = resetMatch;
window.setStriker = setStriker;
window.setNonStriker = setNonStriker;
window.setBowler = setBowler;
window.confirmNewBatsman = confirmNewBatsman;
window.confirmNewBowler = confirmNewBowler;

