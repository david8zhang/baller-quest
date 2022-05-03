import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { DefendManState } from './states/player/defense/DefendManState'
import { PlayerInboundBallState } from './states/player/misc/PlayerInboundBallState'
import { MoveToSpotState } from './states/player/offense/MoveToSpotState'
import { PlayerControlState } from './states/player/misc/PlayerControlState'
import { ReceiveInboundState } from './states/player/misc/ReceiveInboundState'
import { WaitState } from './states/player/WaitState'
import { State, StateMachine } from './states/StateMachine'
import { PlayerStates } from './states/StateTypes'
import { DriveDirection, Team } from './teams/Team'
import { ChaseReboundState } from './states/player/misc/ChaseReboundState'
import { MissType, ShotType } from './meters/ShotMeter'
import { DriveToBasketState } from './states/player/offense/DriveToBasketState'
import { BallState } from './Ball'
import { SetScreenState } from './states/player/offense/SetScreenState'
import { DefendBallHandlerState } from './states/player/defense/DefendBallHandlerState'
import { CutOffDriveState } from './states/player/defense/CutOffDriveState'
import { SmartOffenseState } from './states/player/offense/SmartOffenseState'
import { ShootingState } from './states/player/offense/ShootingState'
import { PassState } from './states/player/offense/PassState'
import { SideOutState } from './states/player/misc/SideOutState'
import { GoToOpenSpot } from './states/player/offense/GoToOpenSpot'

export enum Role {
  PG = 'PG',
  SG = 'SG',
  SF = 'SF',
  PF = 'PF',
  C = 'C',
}

export interface CourtPlayerConfig {
  position: {
    x: number
    y: number
  }
  team: Team
  texture: string
  role: Role
  name: string
}

export class CourtPlayer {
  public game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public moveTarget: { x: number; y: number } | null = null
  public stateMachine: StateMachine
  public role: Role
  public team: Team
  public currVelocityVector: Phaser.Math.Vector2
  public name: string
  public markerRectangle!: Phaser.Geom.Rectangle
  public speed: number = Constants.COURT_PLAYER_SPEED

  // Stealing logic
  public stealGraceTimePassed: boolean = true

  // Jumping logic
  public isJumping: boolean = false
  public floor: Phaser.Physics.Arcade.Sprite
  public floorCollider: Phaser.Physics.Arcade.Collider
  public isBlockable: boolean = false

  // Debug stuff
  public graphics: Phaser.GameObjects.Graphics
  public nameText!: Phaser.GameObjects.Text
  public stateText!: Phaser.GameObjects.Text
  public digitIndexText!: Phaser.GameObjects.Text

  // Defense
  public currDefender: CourtPlayer | null = null
  public otherPlayerCollider!: Phaser.Physics.Arcade.Collider
  public isPlayingIntenseDefense: boolean = false

  constructor(game: Game, config: CourtPlayerConfig) {
    this.game = game
    const { position, texture, role, team, name } = config
    this.name = name
    this.role = role
    this.team = team
    this.sprite = this.game.physics.add.sprite(position.x, position.y, texture).setDepth(2)
    this.sprite.setData('ref', this)
    this.game.physics.world.enable(this.sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)
    this.sprite.body.setSize(0.5 * this.sprite.displayWidth, 0.5 * this.sprite.displayHeight)
    this.sprite.body.offset.y = this.sprite.displayHeight / 2
    this.sprite.setScale(0.5)
    this.setupPlayerName()
    this.setupMarkerRectangle()
    this.currVelocityVector = new Phaser.Math.Vector2(0, 0)
    this.stateMachine = new StateMachine(
      PlayerStates.WAIT,
      {
        [PlayerStates.DEFEND_BALL_HANDLER]: new DefendBallHandlerState(),
        [PlayerStates.RECEIVE_INBOUND]: new ReceiveInboundState(),
        [PlayerStates.INBOUND_BALL]: new PlayerInboundBallState(),
        [PlayerStates.DEFEND_MAN]: new DefendManState(),
        [PlayerStates.WAIT]: new WaitState(),
        [PlayerStates.MOVE_TO_SPOT]: new MoveToSpotState(),
        [PlayerStates.PLAYER_CONTROL]: new PlayerControlState(),
        [PlayerStates.CHASE_REBOUND]: new ChaseReboundState(),
        [PlayerStates.DRIVE_TO_BASKET]: new DriveToBasketState(),
        [PlayerStates.SET_SCREEN]: new SetScreenState(),
        [PlayerStates.CUT_OFF_DRIVE_STATE]: new CutOffDriveState(),
        [PlayerStates.SMART_OFFENSE]: new SmartOffenseState(),
        [PlayerStates.SHOOT]: new ShootingState(),
        [PlayerStates.PASS]: new PassState(),
        [PlayerStates.SIDE_OUT_STATE]: new SideOutState(),
        [PlayerStates.GO_TO_OPEN_SPOT]: new GoToOpenSpot(),
      },
      [this, this.team]
    )
    this.setupPlayerStateText()
    this.setupPlayerDigitIndex()
    this.sprite.setData('ref', this)
    this.graphics = this.game.add.graphics()

    // Set up floor for jumping
    this.floor = this.game.physics.add
      .sprite(this.sprite.x, this.sprite.y + this.sprite.displayHeight / 2 + 5, '')
      .setVisible(false)
      .setPushable(false)
    this.floor.body.setSize(50, 10)
    this.game.physics.world.enable(this.floor, Phaser.Physics.Arcade.DYNAMIC_BODY)
    this.floorCollider = this.game.physics.add.collider(this.sprite, this.floor, () => {
      this.sprite.setGravity(0)
      this.isJumping = false
      this.floorCollider.active = false
    })
    this.floorCollider.active = false
  }

  public toggleColliderWithOtherPlayer(otherPlayer: CourtPlayer) {
    if (this.otherPlayerCollider) {
      this.otherPlayerCollider.destroy()
    }
    this.otherPlayerCollider = this.game.physics.add.collider(otherPlayer.sprite, this.sprite)
    this.otherPlayerCollider.active = true
  }

  public clearColliders() {
    if (this.otherPlayerCollider) {
      this.otherPlayerCollider.active = false
    }
  }

  // Get the closest defender
  public getDefender(): CourtPlayer {
    const opposingTeam = this.team.getOpposingTeam()
    const opposingHoop = opposingTeam.getHoop()
    const rayToHoop = new Phaser.Geom.Line(
      this.sprite.x,
      this.sprite.y,
      opposingHoop.sprite.x,
      opposingHoop.sprite.y
    )

    let shortestDistance = Number.MAX_SAFE_INTEGER
    let defender: any
    opposingTeam.courtPlayers.forEach((player: CourtPlayer) => {
      if (Phaser.Geom.Intersects.LineToRectangle(rayToHoop, player.markerRectangle)) {
        const distanceToPlayer = Constants.getDistanceBetween(
          {
            x: this.sprite.x,
            y: this.sprite.y,
          },
          {
            x: player.sprite.x,
            y: player.sprite.y,
          }
        )
        if (!defender) {
          defender = player
          shortestDistance = distanceToPlayer
        } else {
          if (distanceToPlayer < shortestDistance) {
            defender = player
            shortestDistance = distanceToPlayer
          }
        }
      }
    })
    return defender
  }

  public getPlayerToDefend(): CourtPlayer {
    const defensiveAssignments = this.team.getDefensiveAssignments()
    const posToDefend = defensiveAssignments[this.role]
    return this.team.getOpposingTeam().getPlayerForRole(posToDefend)
  }

  defend(defenderPosition: { x: number; y: number }, spacingAmount: number) {
    // Onball defense
    const currHoop = this.team.getHoop()
    const line = new Phaser.Geom.Line(
      defenderPosition.x,
      defenderPosition.y,
      currHoop.sprite.x,
      currHoop.sprite.y
    )
    const defensiveSpacing = line.getPoint(spacingAmount)
    this.setMoveTarget(defensiveSpacing)
    return defensiveSpacing
  }

  setupMarkerRectangle() {
    const width = this.sprite.displayWidth * 0.75
    const height = this.sprite.displayHeight * 0.75
    this.markerRectangle = new Phaser.Geom.Rectangle(
      this.sprite.x - width / 2,
      this.sprite.y - height / 2,
      width,
      height
    )
  }

  updateMarkerRectPosition() {
    const width = this.sprite.displayWidth * 0.75
    const height = this.sprite.displayHeight * 0.75
    this.markerRectangle.setPosition(this.sprite.x - width / 2, this.sprite.y - height / 2)
  }

  setupPlayerStateText() {
    this.stateText = this.game.add.text(0, 0, this.getCurrentState(), {
      color: 'black',
      fontSize: '12px',
    })
    this.stateText.setPosition(this.sprite.x - this.stateText.displayWidth / 2, this.sprite.y - 40)
    this.stateText.setDepth(100)
  }

  setupPlayerDigitIndex() {
    const roleMapping = Constants.DIGIT_TO_ROLE_MAPPING.indexOf(this.role) + 1
    this.digitIndexText = this.game.add.text(0, 0, roleMapping.toString(), {
      color: 'black',
      fontSize: '12px',
    })
    this.digitIndexText.setPosition(
      this.sprite.x - this.digitIndexText.displayWidth / 2,
      this.sprite.y - 40
    )
    this.digitIndexText.setDepth(100)
  }

  updatePlayerStateText() {
    this.stateText.setText(this.getCurrentState())
    this.stateText.setPosition(this.sprite.x - this.stateText.displayWidth / 2, this.sprite.y + 40)
  }

  setupPlayerName() {
    this.nameText = this.game.add.text(0, 0, this.name, {
      color: 'black',
      fontSize: '12px',
    })
    this.nameText.setPosition(this.sprite.x - this.nameText.displayWidth / 2, this.sprite.y + 40)
    this.nameText.setDepth(100)
    this.nameText.setVisible(false)
  }

  setVelocity(xVel: number, yVel: number) {
    if (xVel != 0) {
      this.sprite.setFlipX(xVel < 0)
    }
    this.currVelocityVector.x = xVel
    this.currVelocityVector.y = yVel
    this.sprite.setVelocity(xVel, yVel)
  }

  setVelocityX(xVelocity: number) {
    if (xVelocity != 0) {
      this.sprite.setFlipX(xVelocity < 0)
    }
    this.currVelocityVector.x = xVelocity
    this.sprite.setVelocityX(xVelocity)
  }

  setVelocityY(yVelocity: number) {
    this.currVelocityVector.y = yVelocity
    this.sprite.setVelocityY(yVelocity)
  }

  setMoveTarget(moveTarget: { x: number; y: number } | null) {
    this.moveTarget = moveTarget
  }

  getSide() {
    return this.team.side
  }

  jump(timeInFlight: number = 0.75) {
    if (!this.isJumping) {
      this.setVelocity(0, 0)
      this.floor.setPosition(this.sprite.x, this.sprite.y + this.sprite.displayHeight / 2 + 5)
      this.floorCollider.active = true
      this.isJumping = true
      const posToLand = {
        x: this.sprite.x,
        y: this.sprite.y,
      }
      this.sprite.setGravityY(980)
      const xVelocity = (posToLand.x - this.sprite.x) / timeInFlight
      const yVelocity =
        (posToLand.y - this.sprite.y - 490 * Math.pow(timeInFlight, 2)) / timeInFlight

      // If we're still jumping after some time, break it off
      this.game.time.delayedCall(timeInFlight * 1250, () => {
        if (this.isJumping) {
          this.sprite.setGravityY(0)
          this.isJumping = false
          this.floorCollider.active = false
        }
      })
      this.setVelocity(xVelocity, yVelocity)
    }
  }

  getDriveDirection() {
    return this.team.driveDirection
  }

  setState(state: string, ...args: any[]) {
    this.stateMachine.transition(state, ...args)
  }

  getCurrentState(): string {
    return this.stateMachine.getState()
  }

  getCurrentStateFull(): State {
    return this.stateMachine.getFullState()
  }

  moveTowards(target: { x: number; y: number }) {
    const distance = Constants.getDistanceBetween(
      {
        x: this.sprite.x,
        y: this.sprite.y,
      },
      {
        x: target.x,
        y: target.y,
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
          x: target.x,
          y: target.y,
        }
      )
      const velocityVector = new Phaser.Math.Vector2()
      this.game.physics.velocityFromRotation(angle, this.speed, velocityVector)
      this.setVelocity(velocityVector.x, velocityVector.y)
    }
  }

  shootBall(isSuccess: boolean, shotType: ShotType, missType?: MissType) {
    console.log('HAS POSSESSION', this.game.ball.isInPossessionOf(this))
    if (this.game.ball.isInPossessionOf(this)) {
      const enemyHoop = this.team.getOpposingTeam().getHoop()
      this.game.ball.shoot(enemyHoop, {
        isSuccess,
        missType,
        shotType,
      })
    }
  }

  setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y)
  }

  passBall(receiver: CourtPlayer, isInbound?: boolean) {
    const ball = this.game.ball

    if (ball.isInPossessionOf(this) && ball.currState !== BallState.PASS) {
      const timeToPass = 0.25
      const angle = Phaser.Math.Angle.BetweenPoints(
        {
          x: this.sprite.x,
          y: this.sprite.y,
        },
        {
          x: receiver.sprite.x + receiver.currVelocityVector.x * timeToPass,
          y: receiver.sprite.y + receiver.currVelocityVector.y * timeToPass,
        }
      )
      const posAfterGivenTime = {
        x: receiver.sprite.x + receiver.currVelocityVector.x * timeToPass,
        y: receiver.sprite.y + receiver.currVelocityVector.y * timeToPass,
      }
      const distance = Constants.getDistanceBetween(
        {
          x: this.sprite.x,
          y: this.sprite.y,
        },
        posAfterGivenTime
      )
      const velocityVector = new Phaser.Math.Vector2(0, 0)
      this.game.physics.velocityFromRotation(angle, distance * (1 / timeToPass), velocityVector)

      // Apply velocity to ball
      ball.sprite.setGravity(0)
      ball.sprite.body.enable = true
      ball.setBallState(isInbound ? BallState.INBOUND : BallState.PASS)
      ball.setVelocity(velocityVector.x, velocityVector.y)
    }
  }

  setNameVisible(isVisible: boolean) {
    this.nameText.setVisible(isVisible)
  }

  updatePlayerDigitIndex() {
    this.digitIndexText.setPosition(
      this.sprite.x - this.digitIndexText.displayWidth / 2,
      this.sprite.y - 40
    )
  }

  blockShot(playerToDefend: CourtPlayer) {
    this.jump(0.8)
    if (playerToDefend.isBlockable) {
      const isBlockSuccessful = Phaser.Math.Between(1, 100) < Constants.BLOCK_SUCCESS_RATE
      if (isBlockSuccessful) {
        const ball = this.team.getBall()
        ball.knockAway(0.8)
        const playerPosition = new Phaser.Math.Vector2(
          playerToDefend.team.driveDirection === DriveDirection.LEFT
            ? playerToDefend.sprite.x + 75
            : playerToDefend.sprite.x - 75,
          playerToDefend.sprite.y
        )
        ball.launchArcTowards(playerPosition, 0.5)
      }
    }
  }

  stealBallFrom(playerToDefend: CourtPlayer) {
    const ball = this.team.getBall()
    if (this.stealGraceTimePassed) {
      this.stealGraceTimePassed = false
      const isStealSuccessful = Phaser.Math.Between(1, 100) < Constants.STEAL_SUCCESS_RATE
      if (isStealSuccessful) {
        ball.knockAway(0.8)
        const knockAwayPos = new Phaser.Math.Vector2(
          playerToDefend.team.driveDirection === DriveDirection.LEFT
            ? playerToDefend.sprite.x + 75
            : playerToDefend.sprite.x - 75,
          playerToDefend.sprite.y
        )
        ball.launchArcTowards(knockAwayPos, 0.5)
      }
      this.game.time.delayedCall(200, () => {
        this.stealGraceTimePassed = true
      })
    }
  }

  update() {
    this.stateMachine.step()
    if (
      this.moveTarget &&
      this.getCurrentState() !== PlayerStates.PLAYER_CONTROL &&
      !this.isJumping
    ) {
      this.moveTowards(this.moveTarget)
    }
    this.nameText.setPosition(this.sprite.x - this.nameText.displayWidth / 2, this.sprite.y + 60)
    this.updatePlayerStateText()
    this.updatePlayerDigitIndex()
    this.updateMarkerRectPosition()
  }
}
