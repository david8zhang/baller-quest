import Game, { FieldZone } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { CourtPlayer } from './CourtPlayer'
import { Hoop } from './Hoop'
import { Side, Team } from './teams/Team'

export enum BallState {
  DRIBBLE = 'DRIBBLE',
  LOOSE = 'LOOSE',
  MIDAIR = 'MIDAIR',
  TIPOFF = 'TIPOFF',
}

export interface ShotConfig {
  shotRanges: number[]
  successRange: number[]
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
  public onPlayerChangedHandlers: Function[] = []
  public onScoreHandlers: Function[] = []

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
      .sprite(this.sprite.x, this.sprite.y + 20, '')
      .setVisible(false)
    this.floor.displayHeight = 2
    this.floor.displayWidth = Constants.COURT_WIDTH
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

  tipOff(zoneToTipTo: FieldZone) {
    this.currState = BallState.TIPOFF
    this.sprite.setGravityY(980)
    this.sprite.body.enable = true
    const time = 1.25
    const posToLand = new Phaser.Math.Vector2(Constants.COURT_WIDTH / 2, Constants.COURT_HEIGHT / 2)
    this.launchArcTowards(posToLand, time)
    this.game.time.delayedCall((time * 1000) / 2, () => {
      if (zoneToTipTo) {
        const { centerPosition } = zoneToTipTo
        const posToTipTo = new Phaser.Math.Vector2(centerPosition.x, centerPosition.y)
        this.launchArcTowards(posToTipTo, time)
        this.currState = BallState.LOOSE
      }
    })
  }

  launchArcTowards(posToLand: Phaser.Math.Vector2, timeInFlight: number) {
    this.sprite.setGravityY(980)
    this.sprite.body.enable = true
    const xVelocity = (posToLand.x - this.sprite.x) / timeInFlight
    const yVelocity = (posToLand.y - this.sprite.y - 490 * Math.pow(timeInFlight, 2)) / timeInFlight
    this.sprite.setVelocity(xVelocity, yVelocity)
  }

  shoot(hoop: Hoop, isSuccess: boolean) {
    if (!this.player) {
      return
    }
    const playerTeam: Team = this.player!.team
    const playerPosition = new Phaser.Math.Vector2(this.player!.sprite.x, this.player!.sprite.y)
    const playerHeight = this.player!.sprite.displayHeight
    this.player = null
    this.sprite.y = playerPosition.y - playerHeight / 2
    this.floor.body.enable = false

    // Launch ball at angle to hit the hoop
    this.sprite.body.enable = true
    const hoopSprite = hoop.sprite
    const successRange = hoop.successShotRange
    const rimRange = hoop.rimRange

    let posToLand = new Phaser.Math.Vector2(0, 0)
    if (isSuccess) {
      posToLand.x = hoopSprite.x + Phaser.Math.Between(successRange[0], successRange[1])
      posToLand.y = hoopSprite.y - 50
    } else {
      let missOffset1 = Phaser.Math.Between(rimRange[0], successRange[0] - 5)
      let missOffset2 = Phaser.Math.Between(successRange[1] + 5, rimRange[1])
      const missOffset = Phaser.Math.Between(0, 1) == 0 ? missOffset1 : missOffset2
      posToLand.x = hoopSprite.x + missOffset
      posToLand.y = hoopSprite.y - 50
    }
    this.sprite.setGravityY(980)
    const time = 1.25
    const xVelocity = (posToLand.x - this.sprite.x) / time
    const yVelocity = (posToLand.y - this.sprite.y - 490 * Math.pow(time, 2)) / time
    this.sprite.setVelocity(xVelocity, yVelocity)
    hoopSprite.body.enable = false
    this.currState = BallState.MIDAIR
    let delayedTime = isSuccess ? time * 1010 : time * 950
    this.game.time.delayedCall(delayedTime, () => {
      if (isSuccess) {
        this.currState = BallState.LOOSE
        this.sprite.setVelocityX(0)
        this.sprite.setVelocityY(0.3 * this.sprite.body.velocity.y)
        this.game.time.delayedCall(400, () => {
          this.handleFloorCollision()
          this.onScoreHandlers.forEach((handler: Function) => {
            handler(playerTeam)
          })
        })
      } else {
        hoopSprite.body.enable = true
      }
    })
  }

  setBallState(state: BallState) {
    this.currState = state
  }

  setLoose() {
    this.currState = BallState.LOOSE
  }

  handleFloorCollision() {
    if (this.player || this.currState == BallState.MIDAIR) return
    this.floor.setPosition(this.sprite.x, this.sprite.y + 20)
    this.floor.body.enable = true
  }

  registerOnPlayerChangedHandler(fn: Function) {
    this.onPlayerChangedHandlers.push(fn)
  }

  registerOnScoredHandler(fn: Function) {
    this.onScoreHandlers.push(fn)
  }

  isInPossessionOf(player: CourtPlayer) {
    return this.player == player
  }

  setPlayer(player: CourtPlayer) {
    if (this.currState == BallState.MIDAIR || this.currState == BallState.TIPOFF) {
      return
    }
    const oldPlayer = this.player
    this.player = player
    this.sprite.body.enable = false
    this.floor.body.enable = false
    this.currState = BallState.DRIBBLE
    this.onPlayerChangedHandlers.forEach((fn) => {
      fn(oldPlayer, player)
    })
  }

  update() {
    if (this.player) {
      this.sprite.x = this.player.sprite.x
      this.sprite.y = this.player.sprite.y
    }
  }

  passTo(target: CourtPlayer) {
    this.sprite.setGravity(0)
    const angle = Phaser.Math.Angle.BetweenPoints(
      {
        x: this.sprite.x,
        y: this.sprite.y,
      },
      {
        x: target.sprite.x + target.currVelocityVector.x * 0.25,
        y: target.sprite.y + target.currVelocityVector.y * 0.25,
      }
    )
    const posAfterOneSec = {
      x: target.sprite.x + target.currVelocityVector.x * 0.25,
      y: target.sprite.y + target.currVelocityVector.y * 0.25,
    }
    const distance = Constants.getDistanceBetween(
      {
        x: this.sprite.x,
        y: this.sprite.y,
      },
      posAfterOneSec
    )
    const velocityVector = new Phaser.Math.Vector2(0, 0)
    this.game.physics.velocityFromRotation(angle, distance * 4, velocityVector)
    this.currState = BallState.MIDAIR
    this.player = null
    this.sprite.body.enable = true
    this.sprite.setVelocity(velocityVector.x, velocityVector.y)
    this.game.time.delayedCall(200, () => {
      this.currState = BallState.LOOSE
    })
  }

  getPossessionSide() {
    if (this.player) return this.player.getSide()
    return Side.NONE
  }
}
