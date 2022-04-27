import Game from '~/scenes/Game'
import { BallState } from './Ball'
import { DriveDirection, Side } from './teams/Team'

export interface HoopConfig {
  position: {
    x: number
    y: number
  }
  isFlipX: boolean
  rimPosition: {
    x: number
    y: number
  }
  backboardPosition: {
    x: number
    y: number
  }
  rimRange: number[]
  successShotRange: number[]
  driveDirection: DriveDirection
}

export class Hoop {
  private game: Game
  public sprite: Phaser.GameObjects.Sprite
  public onCollideRimHandler!: Function
  public setFloorEvent?: Phaser.Time.TimerEvent
  public successShotRange: number[] = []
  public rimRange: number[] = []
  public hasBallCollidedWithRim: boolean = false
  public driveDirection: DriveDirection
  public rim: Phaser.Physics.Arcade.Sprite
  public backboard: Phaser.Physics.Arcade.Sprite
  public isShotSuccess: boolean = false
  public onOverlapHandler: Function | null = null

  constructor(game: Game, config: HoopConfig) {
    this.game = game
    const {
      position,
      isFlipX,
      rimPosition,
      backboardPosition,
      successShotRange,
      rimRange,
      driveDirection,
    } = config
    this.driveDirection = driveDirection
    this.sprite = this.game.add.sprite(position.x, position.y, 'hoop').setScale(1.5)
    this.sprite.flipX = isFlipX
    this.successShotRange = successShotRange
    this.rimRange = rimRange

    this.rim = this.game.physics.add
      .sprite(rimPosition.x, rimPosition.y, '')
      .setVisible(false)
      .setPushable(false)

    this.rim.body.setSize(50, 5)

    this.game.physics.add.collider(this.rim, this.game.ball.sprite, () => {
      if (
        this.game.ball.currState !== BallState.PASS &&
        this.game.ball.currState !== BallState.INBOUND
      ) {
        this.handleOnCollideWithRim()
      }
    })

    this.backboard = this.game.physics.add
      .sprite(backboardPosition.x, backboardPosition.y, '')
      .setVisible(false)
      .setPushable(false)
    this.backboard.body.setSize(10, 90)
    this.game.physics.add.collider(this.backboard, this.game.ball.sprite, () => {
      if (
        this.game.ball.currState !== BallState.PASS &&
        this.game.ball.currState !== BallState.INBOUND
      ) {
        this.handleOnCollideWithRim()
      }
    })

    this.game.add.circle(this.sprite.x + successShotRange[0], this.sprite.y, 5, 0xff0000)
  }

  toggleRimCollider(state: boolean) {
    this.rim.body.enable = state
    this.backboard.body.enable = state
  }

  handleOnCollideWithRim() {
    if (!this.hasBallCollidedWithRim) {
      this.hasBallCollidedWithRim = true
      this.rim.body.enable = false
      this.game.ball.setRandomRebound(this, () => {
        this.hasBallCollidedWithRim = false
      })
    }
  }

  setOnCollideRimHandler(onCollideRimHandler: Function) {
    this.onCollideRimHandler = onCollideRimHandler
  }
}
