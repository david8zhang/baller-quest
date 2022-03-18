import bezier from 'bezier-easing'
import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { CourtPlayer } from './CourtPlayer'

interface BallConfig {
  position: {
    x: number
    y: number
  }
}

export class Ball {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  private player!: CourtPlayer | null

  constructor(game: Game, config: BallConfig) {
    this.game = game
    const { position } = config
    this.sprite = this.game.physics.add
      .sprite(position.x, position.y, 'ball')
      .setScale(0.05)
      .setDepth(100)
      .setBounce(0.75)
  }

  shoot() {
    this.player = null
    const hoopSprite = this.game.hoop.sprite
    const netBottom = new Phaser.Math.Vector2(hoopSprite.x, hoopSprite.y - 50)
    const rimRight = new Phaser.Math.Vector2(hoopSprite.x + 10, hoopSprite.y - 50)
    const rimLeft = new Phaser.Math.Vector2(hoopSprite.x - 10, hoopSprite.y - 50)

    const randValue = Phaser.Math.Between(0, 2)
    // const posToLand = [rimLeft, rimRight, netBottom][randValue]
    const posToLand = netBottom

    this.sprite.setGravityY(980)
    const time = 1.25
    const xVelocity = (posToLand.x - this.sprite.x) / time
    const yVelocity = (posToLand.y - this.sprite.y - 490 * Math.pow(time, 2)) / time
    this.sprite.setVelocity(xVelocity, yVelocity)
    hoopSprite.body.enable = false

    this.game.time.delayedCall(time * 1000, () => {
      if (posToLand === netBottom) {
        this.sprite.setVelocityX(0)
        this.sprite.setVelocityY(0.3 * this.sprite.body.velocity.y)
        this.game.time.delayedCall(400, () => {
          this.handleFloorCollision()
        })
      } else {
        hoopSprite.body.enable = true
      }
    })
  }

  handleFloorCollision() {
    const floor = this.game.physics.add
      .sprite(Constants.GAME_WIDTH / 2, this.sprite.y + 20, '')
      .setVisible(false)
    floor.displayHeight = 2
    floor.displayWidth = Constants.GAME_WIDTH
    floor.setPushable(false)
    this.game.physics.world.enable(floor, Phaser.Physics.Arcade.DYNAMIC_BODY)
    this.game.physics.add.collider(floor, this.sprite, () => {
      this.sprite.setVelocityX(this.sprite.body.velocity.x * 0.75)
    })
  }

  setPlayer(player: CourtPlayer) {
    this.player = player
  }

  update() {
    if (this.player) {
      this.sprite.x = this.player.sprite.x
      this.sprite.y = this.player.sprite.y
    }
  }
}
