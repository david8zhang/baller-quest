export class Preloader extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.image('player', 'player/idle.png')
    this.load.image('cpu-player', 'cpu/idle.png')
    this.load.image('hoop', 'hoop.png')
    this.load.image('ball', 'ball.png')
    this.load.image('court', 'court.jpeg')
  }

  create() {
    this.scene.start('game')
  }
}
