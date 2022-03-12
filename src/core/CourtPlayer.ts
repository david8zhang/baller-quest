import Game from '~/scenes/Game'

export enum Side {
  PLAYER = 'PLAYER',
  CPU = 'CPU',
}

export interface CourtPlayerConfig {
  position: {
    x: number
    y: number
  }
  side: Side
}

export class CourtPlayer {
  private game: Game
  private sprite: Phaser.Physics.Arcade.Sprite
  private side: Side

  constructor(game: Game, config: CourtPlayerConfig) {
    this.game = game
    const { position, side } = config
    this.side = side
    this.sprite = this.game.physics.add.sprite(position.x, position.y, 'player')
    this.game.physics.world.enable(this.sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)
    this.sprite.setScale(0.5)
  }

  setVelocity(xVel: number, yVel: number) {
    if (xVel != 0) {
      this.sprite.setFlipX(xVel < 0)
    }
    this.sprite.setVelocity(xVel, yVel)
  }

  setVelocityX(xVelocity: number) {
    if (xVelocity != 0) {
      this.sprite.setFlipX(xVelocity < 0)
    }
    this.sprite.setVelocityX(xVelocity)
  }

  setVelocityY(yVelocity: number) {
    this.sprite.setVelocityY(yVelocity)
  }
}
