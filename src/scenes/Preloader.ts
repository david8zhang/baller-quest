export class Preloader extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.image('player', 'player/idle.png')
    this.load.image('cpu-player', 'cpu/idle.png')
    this.load.image('backboard', 'backboard.png')
    this.load.image('rim-front', 'rim-front.png')
    this.load.image('rim-back', 'rim-back.png')
    this.load.image('ball', 'ball.png')
    this.load.image('court', 'court.png')
  }

  create() {
    this.scene.start('game')
    this.scene.start('ui')
  }
}
