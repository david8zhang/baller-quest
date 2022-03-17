export class Preloader extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.image('player', 'player/idle.png')
    this.load.image('hoop', 'basketball-hoop.png')
    this.load.image('ball', 'ball.png')
    this.load.image('half-court', 'half-court.gif')
  }

  create() {
    this.scene.start('game')
  }
}
