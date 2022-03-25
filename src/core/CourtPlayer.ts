import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'

export enum Side {
  PLAYER = 'PLAYER',
  CPU = 'CPU',
  NONE = 'NONE',
}

export interface CourtPlayerConfig {
  position: {
    x: number
    y: number
  }
  side: Side
  texture: string
}

export class CourtPlayer {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public side: Side
  public moveTarget: { x: number; y: number } | null = null

  constructor(game: Game, config: CourtPlayerConfig) {
    this.game = game
    const { position, side, texture } = config
    this.side = side
    this.sprite = this.game.physics.add.sprite(position.x, position.y, texture).setDepth(2)
    this.sprite.setData('ref', this)
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

  moveTowardsTarget() {
    if (!this.moveTarget) {
      return
    }
    const distance = Constants.getDistanceBetween(
      {
        x: this.sprite.x,
        y: this.sprite.y,
      },
      {
        x: this.moveTarget.x,
        y: this.moveTarget.y,
      }
    )
    if (Math.abs(distance) < 5) {
      this.setVelocity(0, 0)
    } else {
      let angle = Phaser.Math.Angle.BetweenPoints(
        {
          x: this.sprite.x,
          y: this.sprite.y,
        },
        {
          x: this.moveTarget.x,
          y: this.moveTarget.y,
        }
      )
      const velocityVector = new Phaser.Math.Vector2()
      this.game.physics.velocityFromRotation(angle, Constants.COURT_PLAYER_SPEED, velocityVector)
      this.setVelocity(velocityVector.x, velocityVector.y)
    }
  }

  update() {
    this.moveTowardsTarget()
  }
}
