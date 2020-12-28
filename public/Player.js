class Player {
  constructor(player) {
    this.id = player.id;
    this.sounds = [];
  }

  addSound(sound){
    this.sounds.push(sound);
  }

  getSound(){
    if(sounds.length>0){
      return this.sounds.shift();
    }
    return null;
  }

}
