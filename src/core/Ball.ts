import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Court, FieldZone } from './Court'
import { CourtPlayer } from './CourtPlayer'
import { Hoop } from './Hoop'
import { MissType, ShotConfig, ShotType } from './meters/ShotMeter'
import { DriveDirection, Side, Team } from './teams/Team'

export enum BallState {
  DRIBBLE = 'DRIBBLE',
  LOOSE = 'LOOSE',
  BLOCKED = 'BLOCKED',
  WIND_UP_SHOT = 'WIND_UP_SHOT',
  MID_SHOT = 'MID_SHOT',
  PASS = 'PASS',
  INBOUND = 'INBOUND',
  REBOUND = 'REBOUND',
  TIPOFF = 'TIPOFF',
  RETRIEVE_AFTER_SCORE = 'RETRIEVE_AFTER_SCORE',
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
  private prevPlayer!: CourtPlayer | null
  public floor!: Phaser.Physics.Arcade.Sprite
  public currState: BallState = BallState.LOOSE
  public onPlayerChangedHandlers: Function[] = []
  public onScoreHandlers: Function[] = []
  public arcDestination: Phaser.GameObjects.Arc
  public shotType!: ShotType
  public ballStateText!: Phaser.GameObjects.Text

  public static IGNORE_OOB_STATES = [BallState.MID_SHOT, BallState.REBOUND, BallState.BLOCKED]

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
    this.arcDestination = this.game.add.circle(0, 0, 5, 0x00ff00).setVisible(false).setDepth(1000)
    this.setupFloor()
    this.setupBallStateText()
  }

  setupBallStateText() {
    this.ballStateText = this.game.add.text(0, 0, '', {
      fontSize: '12px',
      color: 'black',
    })
    this.ballStateText
      .setPosition(this.sprite.x - this.ballStateText.displayWidth / 2, this.sprite.y - 25)
      .setDepth(100)
  }

  updateBallStateText() {
    this.ballStateText.setPosition(
      this.sprite.x - this.ballStateText.displayWidth / 2,
      this.sprite.y - 25
    )
    this.ballStateText.setText(this.currState)
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

  setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y)
  }

  launchArcTowards(posToLand: Phaser.Math.Vector2, timeInFlight: number) {
    this.sprite.setGravityY(980)
    this.sprite.body.enable = true
    const xVelocity = (posToLand.x - this.sprite.x) / timeInFlight
    const yVelocity = (posToLand.y - this.sprite.y - 490 * Math.pow(timeInFlight, 2)) / timeInFlight
    this.sprite.setVelocity(xVelocity, yVelocity)
  }

  shoot(hoop: Hoop, shotConfig: ShotConfig) {
    if (!this.player || this.currState === BallState.MID_SHOT) {
      return
    }
    this.currState = BallState.MID_SHOT
    const { isSuccess, shotType } = shotConfig
    const playerTeam: Team = this.player!.team
    const playerPosition = new Phaser.Math.Vector2(this.player!.sprite.x, this.player!.sprite.y)
    const playerHeight = this.player!.sprite.displayHeight
    this.sprite.y = playerPosition.y - playerHeight / 2
    this.floor.body.enable = false
    this.shotType = shotType

    // Launch ball at angle to hit the hoop
    this.sprite.body.enable = true
    const hoopSprite = hoop.sprite
    const successRange = hoop.successShotRange
    const rimRange = hoop.rimRange

    let posToLand = new Phaser.Math.Vector2(0, 0)
    if (isSuccess) {
      posToLand.x = hoopSprite.x + successRange[0]
      posToLand.y = hoopSprite.y - 50
    } else {
      const missType = shotConfig.missType ? shotConfig.missType : Constants.getRandomMissType()
      let undershotOffset = Phaser.Math.Between(rimRange[0], successRange[0] - 5)
      let overshotOffset = Phaser.Math.Between(successRange[1] + 5, rimRange[1])
      const missOffset = missType === MissType.UNDERSHOT ? undershotOffset : overshotOffset
      posToLand.x = hoopSprite.x + missOffset
      posToLand.y = hoopSprite.y - 50
    }
    this.sprite.setGravityY(980)
    const time = Constants.SHOT_ARC_CONFIG[shotType]
    const xVelocity = (posToLand.x - this.sprite.x) / time
    const yVelocity = (posToLand.y - this.sprite.y - 490 * Math.pow(time, 2)) / time
    this.sprite.setVelocity(xVelocity, yVelocity)
    hoop.toggleRimCollider(false)
    this.prevPlayer = this.player
    this.player = null

    if (!isSuccess) {
      this.game.time.delayedCall(time * 500, () => {
        hoop.toggleRimCollider(true)
      })
    } else {
      this.game.time.delayedCall(time * 1000, () => {
        this.sprite.setVelocityX(0)
        this.sprite.setVelocityY(0.3 * this.sprite.body.velocity.y)
        this.game.time.delayedCall(400, () => {
          this.currState = BallState.RETRIEVE_AFTER_SCORE
          this.handleFloorCollision()
          this.onScoreHandlers.forEach((handler: Function) => {
            handler(playerTeam, shotType)
          })
        })
      })
    }
  }

  setRandomRebound(hoop: Hoop, onHitFloorCallback: Function) {
    this.currState = BallState.REBOUND
    let reboundZones =
      hoop.driveDirection === DriveDirection.RIGHT
        ? Constants.MID_RANGE_RIGHT
        : Constants.MID_RANGE_LEFT

    if (this.shotType === ShotType.LAYUP) {
      reboundZones =
        hoop.driveDirection === DriveDirection.RIGHT
          ? Constants.LAYUP_RANGE_RIGHT
          : Constants.LAYUP_RANGE_LEFT
    }
    const randomZoneId = reboundZones[Phaser.Math.Between(0, reboundZones.length - 1)]
    const randomZone = this.game.court.getZoneForZoneId(randomZoneId)

    const flightTime = 1
    if (randomZone) {
      const { centerPosition } = randomZone
      this.launchArcTowards(new Phaser.Math.Vector2(centerPosition.x, centerPosition.y), flightTime)
      this.game.time.delayedCall(flightTime * 1000, () => {
        this.handleFloorCollision()
        onHitFloorCallback()
      })
    }
  }

  setBallState(state: BallState) {
    this.currState = state
  }

  setBlocked(blockFlightTime: number) {
    this.player = null
    this.currState = BallState.BLOCKED
    this.game.time.delayedCall(blockFlightTime * 1000, () => {
      this.currState = BallState.LOOSE
      this.handleFloorCollision()
    })
  }

  setLoose() {
    this.player = null
    this.currState = BallState.LOOSE
  }

  handleFloorCollision() {
    if (this.player || this.currState == BallState.MID_SHOT) return
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

  getPlayer() {
    return this.player
  }

  getPrevPlayer() {
    return this.prevPlayer
  }

  updatePlayerWithBall(player: CourtPlayer) {
    if (!this.canUpdatePlayerWithBall(this.player, player)) {
      return
    }
    this.player = player
    const oldState = this.currState
    this.currState = BallState.DRIBBLE
    this.sprite.body.enable = false
    this.floor.body.enable = false
    this.onPlayerChangedHandlers.forEach((fn) => {
      fn({
        oldState,
        newState: this.currState,
        oldPlayer: this.prevPlayer,
        newPlayer: this.player,
      })
    })
  }

  toggleBodyState(bodyState: boolean) {
    this.sprite.body.enable = bodyState
  }

  setVelocity(xVel: number, yVel: number) {
    this.sprite.setVelocity(xVel, yVel)
  }

  update() {
    if (
      this.player &&
      (this.currState == BallState.DRIBBLE || this.currState === BallState.WIND_UP_SHOT)
    ) {
      this.sprite.x = this.player.sprite.x
      this.sprite.y = this.player.sprite.y
    }
    if (
      this.isOutOfBounds() &&
      (this.prevPlayer || this.player) &&
      !Ball.IGNORE_OOB_STATES.includes(this.currState)
    ) {
      const lastTouchedSide = this.player ? this.player.getSide() : this.prevPlayer!.getSide()
      const isJumping = this.player ? this.player.isJumping : false
      if (!isJumping) {
        this.game.handleOutOfBounds({ x: this.sprite.x, y: this.sprite.y }, lastTouchedSide)
      }
    }

    this.updateBallStateText()
  }

  isOutOfBounds() {
    return Court.checkOutOfBounds(this.sprite.x, this.sprite.y)
  }

  canUpdatePlayerWithBall(currPlayer: CourtPlayer | null, newPlayer: CourtPlayer) {
    switch (this.currState) {
      case BallState.MID_SHOT:
      case BallState.TIPOFF: {
        return false
      }
      case BallState.INBOUND: {
        return currPlayer && currPlayer.getSide() === newPlayer.getSide()
      }
      case BallState.RETRIEVE_AFTER_SCORE: {
        if (!currPlayer) {
          if (!this.prevPlayer) {
            return false
          } else {
            return this.prevPlayer.getSide() !== newPlayer.getSide()
          }
        }
        return currPlayer.getSide() !== newPlayer.getSide()
      }
      case BallState.PASS: {
        if (currPlayer && currPlayer !== newPlayer) {
          if (currPlayer.getSide() == newPlayer.getSide()) {
            return true
          }
          return false
        }
        return false
      }
      case BallState.REBOUND: {
        return true
      }
      case BallState.BLOCKED: {
        return false
      }
      default:
        return true
    }
  }

  getPossessionSide() {
    if (this.player) return this.player.getSide()
    return Side.NONE
  }
}
