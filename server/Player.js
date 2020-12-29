class Player {
  constructor(id) {
    this.id = id;
    this.sounds = [];
  }

  addSound(sound){
    this.sounds.push(sound);
  }
}

module.exports = Player;