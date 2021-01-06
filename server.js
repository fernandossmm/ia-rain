const express = require("express");
const socket = require('socket.io');
const app = express();
let Player = require("./Player");

let server = app.listen(80);
console.log('The server is now running at http://localhost/');
app.use(express.static("public"));

let io = socket(server);

let players = [];
let playersSockets = {};

//['piano', 'bass-electric', 'bassoon', 'cello', 'clarinet', 'flute', 'french-horn', 'guitar-acoustic', 'guitar-electric','guitar-nylon', 'harmonium', 'harp', 'organ', 'saxophone', 'trombone', 'trumpet', 'tuba', 'violin', 'xylophone'];
let instruments = ['piano', 'xylophone', 'harp','guitar-acoustic','guitar-electric', 'cello'];
let occupied = {};
setInterval(updateGame, 60);

io.sockets.on("connection", socket => {
  i = getInstrumentForPlayer(socket.id);
  players.push(new Player(socket.id, i));
  playersSockets[socket.id]=socket;
  console.log(`New connection ${socket.id}`);

  socket.on('pressed', function (data) {
      sound = filterSound(data, socket.id);
      io.sockets.emit("play",sound);
  });
  socket.on("changeInstrument",function(newIns){
    if(!isOccupied(newIns)){
      last = occupied[socket.id];
      occupied[socket.id] =newIns;
      p = getPlayer(socket.id);
      if(p !== null){
        p.instrument = newIns;
        dat = {newInstrument: newIns, lastInstrument: last};
        playersSockets[socket.id].emit("changedInstrument",dat);
      }
    }
    else{
      playersSockets[socket.id].emit("showMessage", "That instrument is being occupied"); //sólo se lo envía al usuario que quiso cambiar de instrumento
    }
  });
  socket.on("disconnect", () => {
      io.sockets.emit("disconnect", socket.id);
      players = players.filter(player => player.id !== socket.id);
      occupied[socket.id] = "null";

  });
});

io.sockets.on("disconnect", socket => {
  io.sockets.emit("disconnect", socket.id);
  players = players.filter(player => player.id !== socket.id);
  occupied[socket.id] = "null";
});

function updateGame() {
  io.sockets.emit("heartbeat", players);
}

function getInstrumentForPlayer(id){
    for(i = 0; i<instruments.length;i++){
      ins = instruments[i];
      if(!isOccupied(ins)){
        occupied[id]=ins;
        return ins;
  }
}
}

function isOccupied(instrument){
  for(i in occupied){
    if(occupied[i]===instrument){
      return true;
    }
  }
  return false;
}

function getPlayer(id) {
  for (let i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      return players[i];
    }
  }
  return null;
}

function filterSound(sound, userId){
  x = sound.x;
  y = sound.y;

  var f, v;
  // TONO //
  switch (y) {
    case 1:
      f = "C4";
      break;
    case 2:
      f = "D4";
      break;
    case 3:
      f = "E4";
      break;
    case 4:
      f = "F4";
      break;
    case 5:
      f = "G4";
      break;
    case 6:
      f = "A4";
      break;
    case 7:
      f = "B4";
      break;
    case 8:
      f = "C5";
      break;
    case 9:
      f = "D5";
      break;
    case 10:
      f = "E5";
      break;
    case 11:
      f = "F5";
      break;
    case 12:
      f = "G5";
      break;
    case 13:
      f = "A5";
      break;
    case 14:
      f = "B5";
      break;
    case 15:
      f = "C6";
      break;
    case 16:
      f = "D6";
      break;
  }

  // VOLUMEN //
  switch (x) {
    case 0:
      v = -8;
      break;
    case 1:
      v = -7;
      break;
    case 2:
      v = -6;
      break;
    case 3:
      v = -5;
      break;
    case 4:
      v = -4;
      break;
    case 5:
      v = -3;
      break;
    case 6:
      v = -2;
      break;
    case 7:
      v = -1;
      break;
    case 8:
      v = 0;
      break;
    case 9:
      v = 1;
      break;
    case 10:
      v = 2;
      break;
    case 11:
      v = 3;
      break;
    case 12:
      v = 4;
      break;
    case 13:
      v = 5;
      break;
    case 14:
      v = 6;
      break;
    case 15:
      v = 7;
      break;
  }

  return {nota: f, volumen: v, id: userId};
}
