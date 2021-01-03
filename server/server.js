const express = require("express");
const socket = require('socket.io');
const app = express();
let Player = require("./Player");

let server = app.listen(80);
console.log('The server is now running at http://localhost/');
app.use(express.static("public"));

let io = socket(server);

let players = [];

setInterval(updateGame, 60);

io.sockets.on("connection", socket => {
  console.log(`New connection ${socket.id}`);
  players.push(new Player(socket.id));
  
  socket.on('pressed', function (data) {
      sound = filterSound(data);
      io.sockets.emit("play",sound);
  });
  socket.on('moved', function (data) {
    sound = filterSound(data);
    io.sockets.emit("move",sound);
  });
  socket.on('released', function (data) {
    io.sockets.emit("stop",data);
  });
  socket.on("disconnect", () => {
      io.sockets.emit("disconnect", socket.id);
      players = players.filter(player => player.id !== socket.id);
  });
});

io.sockets.on("disconnect", socket => {
  io.sockets.emit("disconnect", socket.id);
  players = players.filter(player => player.id !== socket.id);
});

function updateGame() {
  io.sockets.emit("heartbeat", players);
}

function filterSound(sound){
  x = sound.x;
  y = sound.y;

  var f, v;
  // TONO //
  switch (y) {
    case 0:
      f = "C4";
      //console.log("C4");
      break;
    case 1:
      f = "D4";
      //console.log("D4");
      break;
    case 2:
      f = "E4";
      //console.log("E4");
      break;
    case 3:
      f = "F4";
      //console.log("F4");
      break;
    case 4:
      f = "G4";
      //console.log("G4");
      break;
    case 5:
      f = "A4";
      //console.log("A4");
      break;
    case 6:
      f = "B4";
      //console.log("B4");
      break;
    case 7:
      f = "C5";
      //console.log("C5");
      break;
    case 8:
      f = "D5";
      //console.log("D5");
      break;
    case 9:
      f = "E5";
      //console.log("E5");
      break;
    case 10:
      f = "F5";
      //console.log("F5");
      break;
    case 11:
      f = "G5";
      //console.log("G5");
      break;
    case 12:
      f = "A5";
      //console.log("A5");
      break;
    case 13:
      f = "B5";
      //console.log("B5");
      break;
    case 14:
      f = "C6";
      //console.log("C6");
      break;
    case 15:
      f = "D6";
      //console.log("D6");
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

  return {nota: f, volumen: v, id: socket.id};
}
