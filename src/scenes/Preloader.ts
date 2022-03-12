export class Preloader extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.image('player', 'player/idle.png')
    this.load.image('hoop', 'basketball-hoop.png')
    this.load.image('ball', 'ball.png')
  }

  create() {
    this.scene.start('game')
  }
}
