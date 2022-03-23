import Game, { FieldZone } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'

export interface HoopConfig {
  position: {
    x: number
    y: number
  }
  isFlipX: boolean
}

export class Hoop {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public onCollideRimHandler!: Function
  public setFloorEvent?: Phaser.Time.TimerEvent

  constructor(game: Game, config: HoopConfig) {
    this.game = game
    const { position, isFlipX } = config
    this.sprite = this.game.physics.add.sprite(position.x, position.y, 'hoop').setScale(0.25)
    this.sprite.flipX = isFlipX
    this.sprite.body.setSize(0.25 * this.sprite.body.width, 0.25 * this.sprite.body.width)

    this.sprite.body.offset.x = this.sprite.displayWidth + 250
    this.sprite.body.offset.y = this.sprite.displayHeight + 75

    this.sprite.setPushable(false)
    this.game.physics.add.collider(this.sprite, this.game.ball.sprite, () => {
      const randTime = 1000
      this.game.ball.setLoose()
      this.sprite.body.enable = false
      this.setFloorEvent = this.game.time.delayedCall(randTime, () => {
        this.game.ball.handleFloorCollision()
      })
    })
  }

  setOnCollideRimHandler(onCollideRimHandler: Function) {
    this.onCollideRimHandler = onCollideRimHandler
  }
}
