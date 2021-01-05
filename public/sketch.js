p5.disableFriendlyErrors = true;

const socket = io.connect('http://localhost');

let players = [];
var x = 0;
var y = 0;
var mouseIsPressed;
var btnInstrumento1, btnInstrumento2;
var instrumentoActual;

var instrumentsClient = ['piano', 'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute', 'french-horn', 'guitar-acoustic', 'guitar-electric','guitar-nylon', 'harmonium', 'harp', 'organ', 'saxophone', 'trombone', 'trumpet', 'tuba', 'violin', 'xylophone'];

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

function preload() {
}

var synth;
var now;
var vol;
var samples;

function setup() {
  createCanvas(WIDTH, HEIGHT);

  vol = new Tone.Volume().toMaster();

  //Instruments
  NProgress.start();

  samples = SampleLibrary.load({
    instruments: instrumentsClient,
    baseUrl: "./samples/"
  })

  Tone.Buffer.on('load', function() {
    NProgress.done();

    /// Client events
    socket.on("heartbeat", players => updatePlayers(players));
    socket.on("play", s => playSounds(s));
    socket.on ("changedInstrument", data => changeInstrument(data));
    socket.on("showMessage",message => alert(message));
    socket.on("disconnect", playerId => removePlayer(playerId));

  })
  Tone.Buffer.on('error', function() {
    console.log("I'm sorry, there has been an error loading the samples. This demo works best on on the most up-to-date version of Chrome.");
  })
}

function draw() {
  background(220,220,220,0);
  
  btnInstrumento1=new Button(0,0,WIDTH/2,50,"Piano");
  btnInstrumento2=new Button(WIDTH/2,0,WIDTH/2,50,"Cello");

  btnInstrumento1.stroke();
  btnInstrumento2.stroke();

  var divisionAncho = WIDTH/16;
  var divisionAlto = HEIGHT/16;
  for (let i=1; i<16; i++) {
    line(divisionAncho*i, 0, divisionAncho*i, HEIGHT);
    line(0, divisionAlto*i, WIDTH, divisionAlto*i);
  }
}

function Button(x,y,width,height,text){
  this.x=x;
  this.y=y;
  this.width=width;
  this.height=height;
  this.text=text;
}

Button.prototype.stroke=function(){
  rect(this.x,this.y,this.width,this.height);
  text(this.text, this.x+10, this.y+this.height/4);
}

Button.prototype.isMouseInside = function() {
  return mouseX > this.x &&
         mouseX < (this.x + this.width) &&
         mouseY > this.y &&
         mouseY < (this.y + this.height);
};

////////////////////////////////////////////////////////////////// SOUNDS LOGIC

function playSounds(s) {
  player = getPlayer(s.id);
  if(player != null){
  vol.volume.value = s.volumen;
  samples[player.instrument].triggerAttackRelease(s.nota);
  }
}

function changeSound(s) {
  player = getPlayer(s.id);
  i = samples[player.instrument];
  i.triggerAttackRelease(s.nota);
}


////////////////////////////////////////////////////////////////// PLAYERS LOGIC

function updatePlayers(serverPlayers) {
  for (let i = 0; i < serverPlayers.length; i++) {
    let playerFromServer = serverPlayers[i];
    if (!playerExists(playerFromServer)) {
      players.push(new Player(playerFromServer));
      samples[playerFromServer.instrument].connect(vol);
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

function getPlayer(id) {
  for (let i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      return players[i];
    }
  }
  return null;
}


////////////////////////////////////////////////////////////////// CHANGE INSTRUMENTS

function sendChangeInstrument(newInstrument){
  data = {last: instrumentoActual, new: newInstrument };
  socket.emit("changeInstrument", data);
}

function changeInstrument(data){
  samples[data.lastInstrument].disconnect();
  samples[data.newInstrument].connect(vol);
  player.instrument = data.newInstrument;
}

////////////////////////////////////////////////////////////////// MOUSE EVENTS

function mousePressed() {
  if (btnInstrumento1.isMouseInside()) {
    sendChangeInstrument("piano");
  } 
  if (btnInstrumento2.isMouseInside()) {
    sendChangeInstrument("cello");
  }
  //Esto es para hacer música, cuando pongamos mejor la cuadrícula hay que quitarlo
  var myClick = {x: int((mouseX/WIDTH)*16), y: int((mouseY/HEIGHT)*16)};
  socket.emit('pressed',myClick);
}
 
function mouseDragged() {
  var gridPosition = {x: int((mouseX/WIDTH)*16), y: int((mouseY/HEIGHT)*16)};
  socket.emit('pressed',gridPosition);
}