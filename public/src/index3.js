import RainRenderer from "./rain-renderer.js";
import Raindrops from "./raindrops.js";
import loadImages from "./image-loader.js";
import createCanvas from "./create-canvas.js";

let textureFgImage, textureBgImage;
let dropColor, dropAlpha, dropShine;

let raindrops,
  renderer,
  canvas;

let parallax={x:0,y:0};

function loadTextures(){
  loadImages([
    {name:"dropAlpha",src:"img/drop-alpha.png"},
    {name:"dropColor",src:"img/drop-color.png"},
    
    {name:"textureFg",src:"media/texture-fg.png"},
    {name:"textureBg",src:"media/texture-bg.png"},
  ]).then((images)=>{
    textureFgImage = images.textureFg.img;
    textureBgImage = images.textureBg.img;
    
    dropColor = images.dropColor.img;
    dropAlpha = images.dropAlpha.img;
    dropShine = null;

    init();
  });
}
loadTextures();

function init(){
  canvas=document.querySelector('#container');

  let dpi=window.devicePixelRatio;
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
  canvas.style.width=window.innerWidth+"px";
  canvas.style.height=window.innerHeight+"px";

  raindrops=new Raindrops(
    canvas.width,
    canvas.height,
    dpi,
    dropAlpha,
    dropColor,
    {
      minR:35,
      maxR:70,
      rainChance: 0.3,
      randomDropsRMultiplier: 0.4,
      autoShrinkRate: 0.035,
      dropletsRate:2,
      dropletsSize:[3,7.5],
      collisionRadius:0.45,
      collisionRadiusIncrease:0.002,
    }
  );

  renderer = new RainRenderer(
    canvas,
    raindrops.canvas,
    textureFgImage,
    textureBgImage,
    dropShine,
    {
      brightness:1.1,
      alphaMultiply:6,
      alphaSubtract:3,
      parallaxFg:40
    }
  );
}
