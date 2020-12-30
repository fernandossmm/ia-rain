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
 
  if (btnInstrumento1.isMouseInside()) {
    console.log(btnInstrumento1.text);
  } else if (btnInstrumento2.isMouseInside()) {
    console.log(btnInstrumento2.text);
  }

  socket.emit('myClick',myClick);
 };

////////////////////////////////////////
////////// SONIDO //////////////////////
////////////////////////////////////////
window.addEventListener('click', init);

function init() {
  /*
  // create web audio api context
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioCtx = new AudioContext();

  // load some sound
  const audioElement = document.querySelector('audio');
  const track = audioCtx.createMediaElementSource(audioElement);

  // create biquadFilter and gain node
  const biquadFilter = audioCtx.createBiquadFilter();  
  const gainNode = audioCtx.createGain();

  // connect our graph
  track.connect(biquadFilter);
  biquadFilter.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  */

  //create a synth and connect it to the main output (your speakers)
// const synth = new Tone.Synth().toMaster();

  const vol = new Tone.Volume(0).toMaster();
  const synth = new Tone.Synth().connect(vol);

  // create initial frequency and volumn values
  var WIDTH = window.innerWidth;
  var HEIGHT = window.innerHeight;

  var maxFreq = 600;
  var maxVol = 40;

  // Mouse pointer coordinates
  var CurX, CurY;

  // Get new mouse pointer coordinates when mouse is moved
  // then set new gain and frequency values
  
  document.onmousemove = updatePage;


  function updatePage(e) {
    if(mouseIsPressed){
      CurX = (window.Event) ? e.pageX : Event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
      CurY = (window.Event) ? e.pageY : Event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

      var myClick = {x: mouseX, y: mouseY};
      socket.emit('myClick',myClick);

      vol.volume.value = (CurX/WIDTH) * maxVol;
      frequency = (CurY/HEIGHT) * maxFreq;
      
      //play a middle 'C' for the duration of an 8th note
      synth.triggerAttackRelease(frequency, "4n");

//     gainNode.gain.value = (CurX/WIDTH) * maxVol;
//     biquadFilter.frequency.value = (CurY/HEIGHT) * maxFreq;

//      audioElement.play();
    }
  }
}
