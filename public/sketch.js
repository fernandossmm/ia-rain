const socket = io.connect('http://localhost');

let players = [];
var song = null;
var x = 0;
var y = 0;


socket.on("heartbeat", players => updatePlayers(players));
socket.on("disconnect", playerId => removePlayer(playerId));
socket.on("click", data => {x = data.x; y = data.y});

function preload() {
  song = loadSound('Bam.mp3');
}

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  players.forEach(player => player.draw());
  circle(x,y,30);
}

function updatePlayers(serverPlayers) {
  for (let i = 0; i < serverPlayers.length; i++) {
    let playerFromServer = serverPlayers[i];
    if (!playerExists(playerFromServer)) {
      players.push(new Player(playerFromServer));
    }
  }
}

function playerExists(playerFromServer) {
  for (let i = 0; i < players.length; i++) {
    if (players[i].id === playerFromServer) {
      return true;
    }
  }
  return false;
}

function removePlayer(playerId) {
  players = players.filter(player => player.id !== playerId);
}

function mouseClicked(){
  song.play();
  var myClick = {x: mouseX, y: mouseY};
  x = mouseX;
  y= mouseY;
  console.log(myClick);
  socket.emit('myClick',myClick);
 };
 
