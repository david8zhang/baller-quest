import Game from '~/scenes/Game'
import { DriveDirection, Side } from './teams/Team'

export interface HoopConfig {
  position: {
    x: number
    y: number
  }
  isFlipX: boolean
  body: {
    offsetX: number
    offsetY: number
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
  public sprite: Phaser.Physics.Arcade.Sprite
  public onCollideRimHandler!: Function
  public setFloorEvent?: Phaser.Time.TimerEvent
  public successShotRange: number[] = []
  public rimRange: number[] = []
  public hasBallCollidedWithRim: boolean = false
  public driveDirection: DriveDirection

  constructor(game: Game, config: HoopConfig) {
    this.game = game
    const {
      position,
      isFlipX,
      body,
      backboardPosition,
      successShotRange,
      rimRange,
      driveDirection,
    } = config
    this.driveDirection = driveDirection
    this.sprite = this.game.physics.add.sprite(position.x, position.y, 'hoop').setScale(0.25)
    this.sprite.flipX = isFlipX
    this.sprite.body.setSize(0.4 * this.sprite.body.width, 0.25 * this.sprite.body.width)

    this.sprite.body.offset.x = this.sprite.displayWidth + body.offsetX
    this.sprite.body.offset.y = this.sprite.displayHeight + body.offsetY

    this.sprite.setPushable(false)
    this.successShotRange = successShotRange
    this.rimRange = rimRange
    this.game.physics.add.collider(this.sprite, this.game.ball.sprite, () => {
      this.handleOnCollideWithRim()
    })

    const backboard = this.game.physics.add
      .sprite(backboardPosition.x, backboardPosition.y, '')
      .setVisible(false)
      .setPushable(false)
    backboard.body.setSize(10, 75)
    this.game.physics.add.collider(backboard, this.game.ball.sprite, () => {
      this.handleOnCollideWithRim()
    })
  }

  handleOnCollideWithRim() {
    if (!this.hasBallCollidedWithRim) {
      this.hasBallCollidedWithRim = true
      this.sprite.body.enable = false
      this.game.ball.setRandomRebound(this, () => {
        this.hasBallCollidedWithRim = false
      })
    }
  }

  setOnCollideRimHandler(onCollideRimHandler: Function) {
    this.onCollideRimHandler = onCollideRimHandler
  }
}
