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
    this.currVelocityVector = new Phaser.Math.Vector2(0, 0)
    this.stateMachine = new StateMachine(
      PlayerStates.WAIT,
      {
        [PlayerStates.RECEIVE_INBOUND]: new ReceiveInboundState(),
        [PlayerStates.INBOUND_BALL]: new PlayerInboundBallState(),
        [PlayerStates.DEFEND_MAN]: new DefendManState(),
        [PlayerStates.WAIT]: new WaitState(),
        [PlayerStates.MOVE_TO_SPOT]: new MoveToSpotState(),
        [PlayerStates.PLAYER_CONTROL]: new PlayerControlState(),
        [PlayerStates.CHASE_REBOUND]: new ChaseReboundState(),
      },
      [this, this.team]
    )
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

  passBall(receiver: CourtPlayer) {
    if (this.game.ball.isInPossessionOf(this)) {
      this.game.ball.passTo(receiver)
    }
  }

  setNameVisible(isVisible: boolean) {
    this.nameText.setVisible(isVisible)
  }

  update() {
    this.stateMachine.step()
    this.moveTowardsTarget()
    this.nameText.setPosition(this.sprite.x - this.nameText.displayWidth / 2, this.sprite.y + 40)
  }
}
