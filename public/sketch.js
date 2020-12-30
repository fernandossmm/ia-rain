p5.disableFriendlyErrors = true;

const socket = io.connect('http://localhost');

let players = [];
var song = null;
var x = 0;
var y = 0;
var mouseIsPressed;
var btnInstrumento1, btnInstrumento2;

socket.on("heartbeat", players => updatePlayers(players));
socket.on("disconnect", playerId => removePlayer(playerId));

function preload() {
  song = loadSound('media/Bam.mp3');
}

function setup() {
  createCanvas(screen.width, screen.height-screen.height*0.17);
}

function draw() {
  background(220,220,220,0);
  
  btnInstrumento1=new Button(0,0,window.innerWidth/2,50,"Instrumento 1");
  btnInstrumento2=new Button(window.innerWidth/2,0,window.innerWidth/2,50,"Instrumento 2");

  btnInstrumento1.stroke();
  btnInstrumento2.stroke();
  //circle(500,200,200);
  
  //players.forEach(player => player.draw());
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
 // song.play();
  var myClick = {x: mouseX, y: mouseY};
  socket.emit('myClick',myClick);
 };

////////////////////////////////////////
////////// SONIDO //////////////////////
////////////////////////////////////////

//create a synth and connect it to the main output (your speakers)
const vol = new Tone.Volume().toMaster();
const filter = new Tone.Filter().connect(vol);
const player = new Tone.Player("media/Re.wav").connect(filter);

// create initial frequency and volumn values
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var maxFreq = 600;
var maxVol = 10;

window.addEventListener('click', init);

function init() {
  if (btnInstrumento1.isMouseInside()) {
    player.load("media/Bam.mp3");
  } else if (btnInstrumento2.isMouseInside()) {
    player.load("media/Re.wav");
  }

  // Get new mouse pointer coordinates when mouse is moved
  // then set new gain and frequency values
  document.onmousemove = updatePage;

  function updatePage(e) {
    if(mouseIsPressed){
      var CurX = (window.Event) ? e.pageX : Event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
      var CurY = (window.Event) ? e.pageY : Event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

      var myClick = {x: mouseX, y: mouseY};
      socket.emit('myClick',myClick);

      vol.volume.value = (CurX/WIDTH) * maxVol;
      filter.frequency.value = (CurY/HEIGHT) * maxFreq;

      player.start();
    }
  }
}
