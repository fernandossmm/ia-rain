p5.disableFriendlyErrors = true;

const socket = io.connect('http://localhost');

let players = [];
var x = 0;
var y = 0;
var mouseIsPressed;
var btnInstrumento1, btnInstrumento2;
var instrumentoActual;

var playersInstrument = {};
var numPlayers;

var instruments = ['piano', 'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute', 'french-horn', 'guitar-acoustic', 'guitar-electric','guitar-nylon', 'harmonium', 'harp', 'organ', 'saxophone', 'trombone', 'trumpet', 'tuba', 'violin', 'xylophone'];

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

  //Synth
  vol = new Tone.Volume().toMaster();
  //synth = new Tone.PolySynth(4,Tone.Synth).connect(vol);
  now = Tone.now();

  //Instruments
  NProgress.start();

  samples = SampleLibrary.load({
    instruments: ['piano', 'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute', 'french-horn', 'guitar-acoustic', 'guitar-electric','guitar-nylon', 'harmonium', 'harp', 'organ', 'saxophone', 'trombone', 'trumpet', 'tuba', 'violin', 'xylophone'],
    baseUrl: "./samples/"
  })

  Tone.Buffer.on('load', function() {
    NProgress.done();
    instrumentoActual = "piano";
    samples[instrumentoActual].connect(vol);
    //samples["piano"].toMaster();

    //samples["cello"].connect(vol);
    //samples["cello"].toMaster();

    /// Client events
    socket.on("heartbeat", players => updatePlayers(players));
    socket.on("play", s => playSounds(s));
    socket.on("move", s => changeSound(s));
    socket.on("stop", userId => stopSound(userId));
    socket.on("assignInstrument", data => assignInstrument(data));
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

function updatePlayers(serverPlayers) {
  for (let i = 0; i < serverPlayers.length; i++) {
    let playerFromServer = serverPlayers[i];
    if (!playerExists(playerFromServer)) {
      players.push(new Player(playerFromServer));
    }
  }
}

function assignInstrument(data){
  playersInstrument[data.userId] = data.instrument;
}

function playSounds(s) {
  vol.volume.value = s.volumen;
  samples[instrumentoActual].triggerAttack(s.nota);
  //samples[playersInstrument[s.id]].triggerAttack(s.nota,now).toMaster();
  //synth.voices[index].triggerAttack(s.nota,now);
}

function changeSound(s) {
  /*
  i = samples[playersInstrument[s.id]];
  i.triggerRelease(now);
  i.triggerAttack(s.nota,now);
  */
  //i.setNote(s.nota);
  //synth.voices[index].setNote(s.nota);
}

function stopSound(userId) {
  //["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5", "B5", "C6", "D6"]
  //samples[playersInstrument[userId]].triggerRelease(now);
  samples[instrumentoActual].triggerRelease(now);
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
  if (btnInstrumento1.isMouseInside()) {
    //console.log("instrumento 1");
    samples[instrumentoActual].disconnect(vol);
    instrumentoActual = "piano";
    samples[instrumentoActual].connect(vol);
  } 
  if (btnInstrumento2.isMouseInside()) {
    //console.log("instrumento 2");
    samples[instrumentoActual].disconnect(vol);
    instrumentoActual = "cello";
    samples[instrumentoActual].connect(vol);
  }
  var myClick = {x: int((mouseX/WIDTH)*16), y: int((mouseY/HEIGHT)*16)};
  socket.emit('pressed',myClick);
}
 
function mouseDragged() {
  var gridPosition = {x: int((mouseX/WIDTH)*16), y: int((mouseY/HEIGHT)*16)};
  socket.emit('moved',gridPosition);
}

function mouseReleased() {
  socket.emit('released');
}