import Game from '~/scenes/Game'
import { Ball, BallState } from './Ball'
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
  public setFloorEvent?: Phaser.Time.TimerEvent
  public successShotRange: number[] = []
  public rimRange: number[] = []
  public hasBallCollidedWithRim: boolean = false
  public driveDirection: DriveDirection
  public backboard: Phaser.Physics.Arcade.Sprite
  public isShotSuccess: boolean = false
  public onOverlapHandler: Function | null = null

  public rimColliderSprite: Phaser.Physics.Arcade.Sprite
  public rimFrontSprite: Phaser.Physics.Arcade.Sprite
  public rimBackSprite: Phaser.Physics.Arcade.Sprite

  public onCollideWithRimCallback: Function | null = null

  public rimCollider: Phaser.Physics.Arcade.Collider
  public rimOverlap: Phaser.Physics.Arcade.Collider

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
    this.sprite = this.game.add.sprite(position.x, position.y, 'backboard').setScale(1.5)
    this.sprite.flipX = isFlipX
    this.successShotRange = successShotRange
    this.rimRange = rimRange

    this.rimColliderSprite = this.game.physics.add
      .sprite(rimPosition.x, rimPosition.y, '')
      .setVisible(false)
      .setPushable(false)

    this.rimColliderSprite.body.setSize(50, 5)
    this.rimCollider = this.game.physics.add.collider(
      this.rimColliderSprite,
      this.game.ball.sprite,
      () => {
        if (
          this.game.ball.currState !== BallState.PASS &&
          this.game.ball.currState !== BallState.INBOUND
        ) {
          this.handleOnCollideWithRim()
        }
      }
    )
    this.rimOverlap = this.game.physics.add.overlap(
      this.rimColliderSprite,
      this.game.ball.sprite,
      () => {
        if (
          this.game.ball.currState !== BallState.PASS &&
          this.game.ball.currState !== BallState.INBOUND
        ) {
          this.handleOnOverlapWithRim()
        }
      }
    )

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

    this.rimFrontSprite = this.game.physics.add
      .sprite(position.x, position.y, 'rim-front')
      .setScale(1.5)
    this.rimBackSprite = this.game.physics.add
      .sprite(position.x, position.y, 'rim-back')
      .setScale(1.5)
    this.rimFrontSprite.flipX = isFlipX
    this.rimBackSprite.flipX = isFlipX
  }

  toggleRimCollider(state: boolean) {
    this.rimCollider.active = state
    this.backboard.body.enable = state
  }

  toggleRimOverlap(state: boolean) {
    this.rimOverlap.active = state
    this.backboard.body.enable = state
  }

  handleOnOverlapWithRim() {
    if (!this.hasBallCollidedWithRim) {
      this.hasBallCollidedWithRim = true
      this.rimOverlap.active = false
      if (this.onCollideWithRimCallback) {
        this.onCollideWithRimCallback(this)
      }
    }
  }

  handleOnCollideWithRim() {
    if (!this.hasBallCollidedWithRim) {
      this.hasBallCollidedWithRim = true
      this.rimCollider.active = false
      if (this.onCollideWithRimCallback) {
        this.onCollideWithRimCallback(this)
      }
    }
  }

  playShotMakeAnimation() {
    this.rimFrontSprite.setVisible(false)
    this.rimBackSprite.anims.play('rim-animation')
    this.rimBackSprite.on('animationcomplete', () => {
      this.rimFrontSprite.setVisible(true)
    })
  }

  setOnCollideWithRimCallback(fn: Function) {
    this.onCollideWithRimCallback = fn
  }

  setRimDepth(ball: Ball) {
    this.backboard.setDepth(ball.sprite.depth - 5)
    this.rimBackSprite.setDepth(ball.sprite.depth - 5)
    this.rimFrontSprite.setDepth(ball.sprite.depth + 5)
  }
}
