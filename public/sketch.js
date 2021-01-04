p5.disableFriendlyErrors = true;

const socket = io.connect('http://localhost');

let players = [];
var x = 0;
var y = 0;
var mouseIsPressed;
var btnInstrumento1, btnInstrumento2;

var actualNote;

var diccionario = {};

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

/// Client events
socket.on("heartbeat", players => updatePlayers(players));
socket.on("play", s => playSounds(s));
socket.on("move", s => changeSound(s));
socket.on("stop", note => stopSound(note));
socket.on("disconnect", playerId => removePlayer(playerId));

function preload() {
  //song = loadSound('media/Bam.mp3');
}

var synth;
var now;
var vol;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  vol = new Tone.Volume().toMaster();
  s = new Tone.Synth().connect(vol);
  synth = new Tone.PolySynth(4,Tone.Synth).toMaster();
  now = Tone.now();
}

function draw() {
  background(220,220,220,0);
  
  btnInstrumento1=new Button(0,0,WIDTH/2,50,"Instrumento 1");
  btnInstrumento2=new Button(WIDTH/2,0,WIDTH/2,50,"Instrumento 2");

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

function updatePlayers(serverPlayers) {
  for (let i = 0; i < serverPlayers.length; i++) {
    let playerFromServer = serverPlayers[i];
    if (!playerExists(playerFromServer)) {
      players.push(new Player(playerFromServer));
    }
  }
}

function playSounds(s) {
  vol.volume.value = s.volumen;
  actualNote = s.nota;
  synth.voices[0].triggerAttack(s.nota,now);
}

function changeSound(s) {
  vol.volume.value = s.volumen;
  actualNote = s.nota;
  synth.setNote(s.nota);
}

function stopSound(note) {
  //console.log(synth.voices.length);
  //synth.releaseAll();
  synth.voices[0].triggerRelease(["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5", "B5", "C6", "D6"],now);
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
 
 function mousePressed() {
  var myClick = {x: int((mouseX/WIDTH)*16), y: int((mouseY/HEIGHT)*16)};
  socket.emit('pressed',myClick);
}
 
function mouseDragged() {
  var gridPosition = {x: int((mouseX/WIDTH)*16), y: int((mouseY/HEIGHT)*16)};
  socket.emit('moved',gridPosition);
}

function mouseReleased() {
  socket.emit('released', actualNote);
}