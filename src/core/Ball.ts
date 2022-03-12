import Game from '~/scenes/Game'

interface BallConfig {
  position: {
    x: number
    y: number
  }
}

export class Ball {
  private game: Game
  private sprite: Phaser.Physics.Arcade.Sprite
  constructor(game: Game, config: BallConfig) {
    this.game = game
    const { position } = config
    this.sprite = this.game.physics.add.sprite(position.x, position.y, 'ball').setScale(0.05)
    this.sprite.setVisible(false)
  }
}
