import bezier from 'bezier-easing'
import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { CourtPlayer, Side } from './CourtPlayer'

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
  public floor!: Phaser.Physics.Arcade.Sprite
  public isInFlight: boolean = false

  constructor(game: Game, config: BallConfig) {
    this.game = game
    const { position } = config
    this.sprite = this.game.physics.add
      .sprite(position.x, position.y, 'ball')
      .setScale(0.05)
      .setDepth(100)
      .setBounce(0.75)
    this.sprite.body.enable = false
    this.sprite.setData('ref', this)

    // Setup an artificial "floor" to represent when the ball hits the ground after rebounding off the rim
    this.floor = this.game.physics.add
      .sprite(Constants.GAME_WIDTH / 2, this.sprite.y + 20, '')
      .setVisible(false)
    this.floor.displayHeight = 2
    this.floor.displayWidth = Constants.GAME_WIDTH
    this.floor.setPushable(false)
    this.game.physics.world.enable(this.floor, Phaser.Physics.Arcade.DYNAMIC_BODY)
    this.floor.body.enable = false
    this.game.physics.add.collider(this.floor, this.sprite, () => {
      this.sprite.setVelocityX(this.sprite.body.velocity.x * 0.75)
    })

    // Handle out of bounds logic
    const spriteBody = this.sprite.body as Phaser.Physics.Arcade.Body
    spriteBody.setCollideWorldBounds(true)
    spriteBody.onWorldBounds = true
  }

  shoot() {
    if (!this.player) {
      return
    }
    const playerPosition = new Phaser.Math.Vector2(this.player!.sprite.x, this.player!.sprite.y)
    const playerHeight = this.player!.sprite.displayHeight
    this.player = null
    this.sprite.y = playerPosition.y - playerHeight / 2

    // Launch ball at angle to hit the hoop
    this.sprite.body.enable = true
    const hoopSprite = this.game.hoop.sprite
    const netBottom = new Phaser.Math.Vector2(hoopSprite.x, hoopSprite.y - 50)
    const rimRight = new Phaser.Math.Vector2(hoopSprite.x + 10, hoopSprite.y - 50)
    const rimLeft = new Phaser.Math.Vector2(hoopSprite.x - 10, hoopSprite.y - 50)

    const randValue = Phaser.Math.Between(0, 2)
    const posToLand = [rimLeft, rimRight, netBottom][randValue]

    this.sprite.setGravityY(980)
    const time = 1.25
    const xVelocity = (posToLand.x - this.sprite.x) / time
    const yVelocity = (posToLand.y - this.sprite.y - 490 * Math.pow(time, 2)) / time
    this.sprite.setVelocity(xVelocity, yVelocity)
    hoopSprite.body.enable = false
    this.isInFlight = true

    this.game.time.delayedCall(time * 1000, () => {
      this.isInFlight = false
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
    if (this.player) return
    this.floor.setPosition(Constants.GAME_WIDTH / 2, this.sprite.y + 20)
    this.floor.body.enable = true
  }

  setPlayer(player: CourtPlayer) {
    if (this.isInFlight) {
      return
    }
    this.player = player
    this.sprite.body.enable = false
    this.floor.body.enable = false
  }

  update() {
    if (this.player) {
      this.sprite.x = this.player.sprite.x
      this.sprite.y = this.player.sprite.y
    }
  }

  getPossessionSide() {
    if (this.player) return this.player.side
    return Side.NONE
  }
}
