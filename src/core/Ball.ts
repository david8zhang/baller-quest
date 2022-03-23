import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { CourtPlayer, Side } from './CourtPlayer'
import { Hoop } from './Hoop'

export enum BallState {
  DRIBBLE = 'DRIBBLE',
  LOOSE = 'LOOSE',
  MIDAIR = 'MIDAIR',
}

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
  public currState: BallState = BallState.LOOSE

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
    this.setupFloor()
    this.setupOutOfBoundsLogic()
  }

  setupFloor() {
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
  }

  setupOutOfBoundsLogic() {
    const spriteBody = this.sprite.body as Phaser.Physics.Arcade.Body
    spriteBody.setCollideWorldBounds(true)
    spriteBody.onWorldBounds = true
  }

  shoot(hoop: Hoop) {
    if (!this.player) {
      return
    }
    const playerPosition = new Phaser.Math.Vector2(this.player!.sprite.x, this.player!.sprite.y)
    const playerHeight = this.player!.sprite.displayHeight
    this.player = null
    this.sprite.y = playerPosition.y - playerHeight / 2
    this.floor.body.enable = false

    // Launch ball at angle to hit the hoop
    this.sprite.body.enable = true
    const hoopSprite = hoop.sprite
    const netBottom = new Phaser.Math.Vector2(hoopSprite.x + 50, hoopSprite.y - 50)
    const rimBack = new Phaser.Math.Vector2(netBottom.x - 25, hoopSprite.y - 50)
    const rimFront = new Phaser.Math.Vector2(netBottom.x + 25, hoopSprite.y - 50)
    const randValue = Phaser.Math.Between(0, 2)
    const posToLand = [rimBack, rimFront, netBottom][randValue]

    this.sprite.setGravityY(980)
    const time = 1.25
    const xVelocity = (posToLand.x - this.sprite.x) / time
    const yVelocity = (posToLand.y - this.sprite.y - 490 * Math.pow(time, 2)) / time
    this.sprite.setVelocity(xVelocity, yVelocity)
    hoopSprite.body.enable = false
    this.currState = BallState.MIDAIR

    let delayedTime = posToLand === netBottom ? time * 1000 : time * 950

    this.game.time.delayedCall(delayedTime, () => {
      if (posToLand === netBottom) {
        this.currState = BallState.LOOSE
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

  setLoose() {
    this.currState = BallState.LOOSE
  }

  handleFloorCollision() {
    if (this.player || this.currState == BallState.MIDAIR) return
    this.floor.setPosition(Constants.GAME_WIDTH / 2, this.sprite.y + 20)
    this.floor.body.enable = true
  }

  setPlayer(player: CourtPlayer) {
    if (this.currState == BallState.MIDAIR) {
      return
    }
    this.player = player
    this.sprite.body.enable = false
    this.floor.body.enable = false
    this.currState = BallState.DRIBBLE
  }

  update() {
    if (this.player) {
      this.sprite.x = this.player.sprite.x
      this.sprite.y = this.player.sprite.y
    }
  }

  passTo(target: CourtPlayer) {
    const angle = Phaser.Math.Angle.BetweenPoints(
      {
        x: this.sprite.x,
        y: this.sprite.y,
      },
      {
        x: target.sprite.x,
        y: target.sprite.y,
      }
    )
    const velocityVector = new Phaser.Math.Vector2(0, 0)
    this.game.physics.velocityFromRotation(angle, Constants.PASS_SPEED, velocityVector)
    this.currState = BallState.MIDAIR
    this.player = null
    this.sprite.body.enable = true
    this.sprite.setVelocity(velocityVector.x, velocityVector.y)
    this.game.time.delayedCall(100, () => {
      this.currState = BallState.LOOSE
    })
  }

  getPossessionSide() {
    if (this.player) return this.player.side
    return Side.NONE
  }
}
