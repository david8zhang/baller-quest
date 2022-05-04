export class Preloader extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.image('player', 'player/idle.png')
    this.load.image('cpu-player', 'cpu/idle.png')
    this.load.image('backboard', 'backboard.png')

    // Rim animation
    this.load.image('rim-front', 'rim/rim-front.png')
    this.load.image('rim-back', 'rim/rim-back.png')
    this.load.atlas('rim-animation', 'rim/rim-animation.png', 'rim/rim-animation.json')

    this.load.image('ball', 'ball.png')
    this.load.image('court', 'court.png')
  }

  create() {
    this.scene.start('game')
    this.scene.start('ui')
  }
}
