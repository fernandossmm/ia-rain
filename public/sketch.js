const socket = io.connect('http://localhost');

let players = [];
var song = null;
var x = 0;
var y = 0;


socket.on("heartbeat", players => updatePlayers(players));
socket.on("disconnect", playerId => removePlayer(playerId));
socket.on("click", data => {x = data.x; y = data.y});

function preload() {
  song = loadSound('Bam.mp3');
}

function setup() {
  createCanvas(screen.width, screen.height-screen.height*0.17);
}

function draw() {
  background(220);
  players.forEach(player => player.draw());
  circle(x,y,30);
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
  song.play();
  var myClick = {x: mouseX, y: mouseY};
  //x = mouseX;
  //y= mouseY;
  socket.emit('myClick',myClick);
 };
 
function mouseMoved() {
  var position = {x: mouseX, y: mouseY};
  socket.emit('myPosition',position);
}

////////////////////////////////////////
////////// SONIDO //////////////////////
////////////////////////////////////////
//window.addEventListener('keydown', init);
window.addEventListener('click', init);

function init() {
  // create web audio api context
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioCtx = new AudioContext();

  // load some sound
  const audioElement = document.querySelector('audio');
  const track = audioCtx.createMediaElementSource(audioElement);

  // create Oscillator and gain node
//  var oscillator = audioCtx.createOscillator();
  const biquadFilter = audioCtx.createBiquadFilter();  
  const gainNode = audioCtx.createGain();

  // connect oscillator to gain node to speakers
//  oscillator.connect(gainNode);
//  gainNode.connect(audioCtx.destination);

  // connect our graph
  track.connect(biquadFilter);
  biquadFilter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // create initial frequency and volumn values
  var WIDTH = window.innerWidth;
  var HEIGHT = window.innerHeight;

  var maxFreq = 6000;
  var maxVol = 0.2;

  var initialVol = 0.001;

  // set options for the oscillator
//  oscillator.detune.value = 100; // value in cents
//  oscillator.start(0);

  gainNode.gain.value = initialVol;
  gainNode.gain.minValue = initialVol;
  gainNode.gain.maxValue = initialVol;

  // Mouse pointer coordinates
  var CurX;
  var CurY;

  // Get new mouse pointer coordinates when mouse is moved
  // then set new gain and pitch values
  document.onmousemove = updatePage;

  function updatePage(e) {
      CurX = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
      CurY = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

      gainNode.gain.value = (CurX/WIDTH) * maxVol;
      biquadFilter.frequency.value = (CurY/HEIGHT) * maxFreq;

      audioElement.play();
  }
}
