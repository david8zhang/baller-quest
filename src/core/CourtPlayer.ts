import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { DefendManState } from './states/player/DefendManState'
import { PlayerInboundBallState } from './states/player/PlayerInboundBallState'
import { MoveToSpotState } from './states/player/MoveToSpotState'
import { PlayerControlState } from './states/player/PlayerControlState'
import { ReceiveInboundState } from './states/player/ReceiveInboundState'
import { WaitState } from './states/player/WaitState'
import { StateMachine } from './states/StateMachine'
import { PlayerStates } from './states/StateTypes'
import { Team } from './teams/Team'
import { ChaseReboundState } from './states/player/ChaseReboundState'
import { MissType, ShotType } from './ShotMeter'
import { ShootingBallState } from './states/player/ShootingBallState'
import { DriveToBasketState } from './states/player/DriveToBasketState'
import { BallState } from './Ball'
import { SetScreenState } from './states/player/SetScreenState'
import { DefendBallHandlerState } from './states/player/DefendBallHandlerState'
import { CutOffDriveState } from './states/player/CutOffDriveState'

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
  public nameText!: Phaser.GameObjects.Text
  public stateText!: Phaser.GameObjects.Text
  public markerRectangle!: Phaser.Geom.Rectangle
  public speed: number = Constants.COURT_PLAYER_SPEED
  public currDefender: CourtPlayer | null = null

  public otherPlayerCollider!: Phaser.Physics.Arcade.Collider

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
        [PlayerStates.SHOOTING_BALL]: new ShootingBallState(),
        [PlayerStates.DRIVE_TO_BASKET]: new DriveToBasketState(),
        [PlayerStates.SET_SCREEN]: new SetScreenState(),
        [PlayerStates.CUT_OFF_DRIVE_STATE]: new CutOffDriveState(),
      },
      [this, this.team]
    )
    this.setupPlayerStateText()
    this.sprite.setData('ref', this)
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

  public getDefaultDefender(): CourtPlayer {
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

  updatePlayerStateText() {
    this.stateText.setText(this.getCurrentState())
    this.stateText.setPosition(this.sprite.x - this.stateText.displayWidth / 2, this.sprite.y - 40)
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

  getDriveDirection() {
    return this.team.driveDirection
  }

  setState(state: string, ...args: any[]) {
    this.stateMachine.transition(state, ...args)
  }

  getCurrentState(): string {
    return this.stateMachine.getState()
  }

  moveTowardsTarget() {
    if (!this.moveTarget) {
      return
    }
    const distance = Constants.getDistanceBetween(
      {
        x: this.sprite.x,
        y: this.sprite.y,
      },
      {
        x: this.moveTarget.x,
        y: this.moveTarget.y,
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
          x: this.moveTarget.x,
          y: this.moveTarget.y,
        }
      )
      const velocityVector = new Phaser.Math.Vector2()
      this.game.physics.velocityFromRotation(angle, Constants.COURT_PLAYER_SPEED, velocityVector)
      this.setVelocity(velocityVector.x, velocityVector.y)
    }
  }

  shootBall(isSuccess: boolean, shotType: ShotType, missType?: MissType) {
    if (this.game.ball.getPossessionSide() == this.team.side) {
      const enemyHoop = this.team.getOpposingTeam().getHoop()
      this.game.ball.shoot(enemyHoop, {
        isSuccess,
        missType,
        shotType,
      })
    }
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
      ball.currState = isInbound ? BallState.INBOUND : BallState.PASS
      ball.setVelocity(velocityVector.x, velocityVector.y)
    }
  }

  setNameVisible(isVisible: boolean) {
    this.nameText.setVisible(isVisible)
  }

  update() {
    this.stateMachine.step()
    this.moveTowardsTarget()
    this.nameText.setPosition(this.sprite.x - this.nameText.displayWidth / 2, this.sprite.y + 40)
    this.updatePlayerStateText()
    this.updateMarkerRectPosition()
  }
}
