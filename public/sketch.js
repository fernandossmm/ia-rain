p5.disableFriendlyErrors = true;

var socket; // frajelly.raspberryip.com

let players = [];
var available = true;
var x = 0;
var y = 0;
var dropsToAdd = [];
var btnInstrumento1, btnInstrumento2,btnInstrumento3,btnInstrumento4,btnInstrumento5,btnInstrumento6;

var currentPosition, lastPosition;

var instrumentsClient;

const HEIGHTMENU = 50;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight - HEIGHTMENU;

var divisionAncho = WIDTH/16;
var divisionAlto = HEIGHT/16;

function preload() {
}
var vol;
var samples;

function setup() {
  createCanvas(WIDTH, HEIGHT+HEIGHTMENU);
  
  socket = io.connect('http://localhost');
  socket.on("eeee", (x) => notAvailable());
  
  createInstruments();

  btnInstrumento1 = new Button(0,0,WIDTH/6,HEIGHTMENU,"Piano");
  btnInstrumento2 = new Button(WIDTH/6,0,WIDTH/6,HEIGHTMENU,"Xylophone");
  btnInstrumento3 = new Button((2*WIDTH)/6,0,WIDTH/6,HEIGHTMENU,"Harp");
  btnInstrumento4 = new Button(((3*WIDTH)/6),0,WIDTH/6,HEIGHTMENU,"Acoustic Guitar");
  btnInstrumento5 = new Button(((4*WIDTH)/6),0,WIDTH/6,HEIGHTMENU,"Electric Guitar");
  btnInstrumento6 = new Button(WIDTH-(WIDTH/6),0,WIDTH/6,HEIGHTMENU,"Cello");


  vol = new Tone.Volume().toMaster();

  //Instruments

  samples = SampleLibrary.load({
    instruments: instrumentsClient,
    baseUrl: "./samples/"
  })

  Tone.Buffer.on('load', function() {
    
    $("#loader").fadeOut("slow");
    
    /// Client events
    socket.on("heartbeat", players => updatePlayers(players));
    socket.on("initializeInstruments", ins => setInstruments(ins));
    socket.on("play", s => playSounds(s));
    socket.on("stop", pId => stopSounds(pId));
    socket.on("press", p => addDrops(p));
    socket.on("changedInstrument", data => changeInstrument(data));
    socket.on("showMessage", message => alert(message));
    socket.on("disconnect", playerId => removePlayer(playerId));

  })
  Tone.Buffer.on('error', function() {
    alert("Sorry, there has been an error loading the samples. This demo works best on on the most up-to-date version of Chrome.");
  })
  
  background(220,220,220,0);
  
  stroke(230,230,230,40);
  for (let i=0; i<16; i++) {
    //vertical
    line(divisionAncho*i, HEIGHTMENU, divisionAncho*i, HEIGHT+HEIGHTMENU);
    //horizontal
    line(0, HEIGHTMENU+(divisionAlto*i), WIDTH,HEIGHTMENU+(divisionAlto*i));
  }
  stroke(200);
  btnInstrumento1.stroke();
  btnInstrumento2.stroke();
  btnInstrumento3.stroke();
  btnInstrumento4.stroke();
  btnInstrumento5.stroke();
  btnInstrumento6.stroke();
}

function draw() {
  
}

////////////////////////////////////////////////////////////////// BUTTONS

function Button(x,y,width,height,text){
  this.x=x;
  this.y=y;
  this.width=width;
  this.height=height;
  this.text=text;
}

Button.prototype.stroke=function(){
  fill(230,230,230, 100);
  stroke(230,230,230, 150);
  rect(this.x,this.y,this.width,this.height);
  textSize(this.width/10);
  textAlign(CENTER, CENTER);
  fill(20,20,20,180);
  stroke(0,0,0,0);
  text(this.text, this.x, this.y, this.width, this.height);
  stroke(230,230,230, 40);
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
  if(player != null && samples[player.instrument] !== undefined)
  {
    vol.volume.value = s.volumen;
    samples[player.instrument].releaseAll();
    samples[player.instrument].triggerAttack(s.nota);
  }
}

function stopSounds(pId) {
  player = getPlayer(pId);
  if(player != null && samples[player.instrument] !== undefined)
  {
    samples[player.instrument].releaseAll();
  }
}

////////////////////////////////////////////////////////////////// RAIN LOGIC

function addDrops(presses) {
  
  dropsToAdd = presses.map(p => {
    return {dropX: WIDTH*0.02+p.x*WIDTH*0.95,
            dropY: HEIGHT*0.02+p.y*HEIGHT*0.95}
  });
  
}

////////////////////////////////////////////////////////////////// PLAYERS LOGIC

function updatePlayers(serverPlayers) {
  for (let i = 0; i < serverPlayers.length; i++) {
    let playerFromServer = serverPlayers[i];
    if (!playerExists(playerFromServer)) {
      players.push(new Player(playerFromServer));
      if(samples[playerFromServer.instrument] !== undefined)
        samples[playerFromServer.instrument].connect(vol);
    }
  }
}

function playerExists(playerFromServer) {
  for (let i = 0; i < players.length; i++) {
    if (players[i].id === playerFromServer.id) {
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

function notAvailable() {
  console.log("here");
  $("#notAvailable").css("visibility","visible");
  available = false;
}

////////////////////////////////////////////////////////////////// INSTRUMENTS

function createInstruments() {
  socket.emit("getInstruments");
}

function setInstruments(i) {
  this.instrumentsClient = i;
}

function sendChangeInstrument(newInstrument) {
  socket.emit("changeInstrument", newInstrument);
}

function changeInstrument(data) {
  if(samples[data.lastInstrument] !== undefined)
    samples[data.lastInstrument].disconnect();
  if(samples[data.newInstrument] !== undefined)
    samples[data.newInstrument].connect(vol);
  getPlayer(data.id).instrument = data.newInstrument;
}

////////////////////////////////////////////////////////////////// MOUSE EVENTS

function mousePressed() {
  if(available)
  {
    if (btnInstrumento1.isMouseInside()) {
      sendChangeInstrument("piano");
    } 
    if (btnInstrumento2.isMouseInside()) {
      sendChangeInstrument("xylophone");
    }
    if(btnInstrumento3.isMouseInside()) {
      sendChangeInstrument("harp");
    }
    if(btnInstrumento4.isMouseInside()) {
      sendChangeInstrument("guitar-acoustic");
    }
    if(btnInstrumento5.isMouseInside()) {
      sendChangeInstrument("guitar-electric");
    }
    if(btnInstrumento6.isMouseInside()) {
      sendChangeInstrument("cello");
    }
    lastPosition = {x: mouseX*1.0/WIDTH, y: mouseY*1.0/HEIGHT};
    var myClick = {x: mouseX*1.0/WIDTH, y: mouseY*1.0/HEIGHT, play: true};
    
    if(int(myClick.y*16) != 0) {
      socket.emit('pressed',myClick);
    }
  }
}

function mouseReleased() {
  if(available)
  {
    socket.emit('released');
  }
}

function mouseDragged() {
  if(available)
  {
    currentPosition = {x: mouseX*1.0/WIDTH, y: mouseY*1.0/HEIGHT, play: false};
    if(int(currentPosition.y*16) != 0){
      if (int(currentPosition.x*16)-int(lastPosition.x*16) != 0 ||
          int(currentPosition.y*16)-int(lastPosition.y*16) != 0) {
        currentPosition.play = true;
      }
      else
        currentPosition.play = false;
      lastPosition = {x: mouseX*1.0/WIDTH, y: mouseY*1.0/HEIGHT};
    }
    socket.emit('pressed',currentPosition);
  }
}
