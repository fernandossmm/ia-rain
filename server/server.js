const express = require("express");
const socket = require('socket.io');
const app = express();
let Player = require("./Player");

let server = app.listen(80);
console.log('The server is now running at http://localhost/');
app.use(express.static("public"));

let io = socket(server);

let players = [];

let sounds = [];

setInterval(updateGame, 60);

io.sockets.on("connection", socket => {
  console.log(`New connection ${socket.id}`);
  players.push(new Player(socket.id));
  
  socket.on('myClick', function (data) {
      io.sockets.emit("click",data);
      var sound = {sound: data, players: []};
      sounds.push(sound);
  });

  socket.on('play', function (data) {
    sounds[data.index].players.push(socket.id);
    //if(sounds[data.index].players.length == players.length){
      //sounds.splice(data.index,1);
    //}
    console.log(sounds);
    console.log("/////////////////////////////////////////////////////")
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
  io.sockets.emit("heartbeatPlayers", players);
  io.sockets.emit ("heartbeatSounds",sounds);
}
