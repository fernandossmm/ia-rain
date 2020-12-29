p5.disableFriendlyErrors = true;

const socket = io.connect('http://localhost');

let players = [];
var song = null;
var x = 0;
var y = 0;
var mouseIsPressed;

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
  
  //circle(500,200,200);
  
  //players.forEach(player => player.draw());
}

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
  //x = mouseX;
  //y= mouseY;
  socket.emit('myClick',myClick);
 };

////////////////////////////////////////
////////// SONIDO //////////////////////
////////////////////////////////////////
window.addEventListener('click', init);

function init() {
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

  // create initial frequency and volumn values
  var WIDTH = window.innerWidth;
  var HEIGHT = window.innerHeight;

  var maxFreq = 6000;
  var maxVol = 2;

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

      gainNode.gain.value = (CurX/WIDTH) * maxVol;
      biquadFilter.frequency.value = (CurY/HEIGHT) * maxFreq;

      audioElement.play();
    }
  }
}
