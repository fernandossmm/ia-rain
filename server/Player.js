class Player {
  constructor(id) {
    this.id = id;
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

module.exports = Player;