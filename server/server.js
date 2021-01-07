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

let currentlyPressed = [];

setInterval(updateGame, 60);

io.sockets.on("connection", socket => {
  i = getInstrumentForPlayer(socket.id);
  players.push(new Player(socket.id, i));
  playersSockets[socket.id]=socket;
  console.log(`New connection ${socket.id}`);

  socket.on('pressed', function (data) {
      if(data.play)
      {
        sound = filterSound(data, socket.id);
        io.sockets.emit("play",sound);
      }
      
      currentlyPressed[socket.id] = {x: data.x, y: data.y};
  });
  
  socket.on('released', function (data) {
      io.sockets.emit("stop",socket.id);
      
      delete currentlyPressed[socket.id];
  });
  
  socket.on("changeInstrument",function(newIns){
    if(!isOccupied(newIns)){
      last = occupied[socket.id];
      occupied[socket.id] =newIns;
      p = getPlayer(socket.id);
      if(p !== null){
        p.instrument = newIns;
        dat = {id: socket.id, newInstrument: newIns, lastInstrument: last};
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
  
  var p = Object.keys(currentlyPressed).map(x => currentlyPressed[x]);
  
  io.sockets.emit("press", p);
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
  x = Math.round(sound.x*16);
  y = Math.round(sound.y*16);

  var f, v;
  // TONO //
  notas = ["B", "A", "G", "F", "E", "D", "C"]
  startingOctave = 5;
  
  f = notas[(y)%notas.length]+""+(startingOctave-Math.floor(y/notas.length));

  // VOLUMEN //
  v = x-7;
    
  return {nota: f, volumen: v, id: userId};
}
