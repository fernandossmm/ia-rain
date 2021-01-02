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
  
  socket.on('myClick', function (data) {
      io.sockets.emit("click",data);
      sound = filterSound(data);
      io.sockets.emit("play",sound);
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

v = 1+ ((x/16) * 10);
f = y;

if(f>8){
return {nota: "C4", volumen: v, id: socket.id};
}else{
return {nota: "A4", volumen: v, id: socket.id};
}


}
