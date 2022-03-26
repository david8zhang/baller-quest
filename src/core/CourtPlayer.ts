import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { MoveToSpotState } from './states/player/MoveToSpotState'
import { PlayerControlState } from './states/player/PlayerControlState'
import { WaitState } from './states/player/WaitState'
import { StateMachine } from './states/StateMachine'
import { PlayerStates } from './states/StateTypes'
import { Team } from './Team'

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
}

export class CourtPlayer {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public moveTarget: { x: number; y: number } | null = null
  public stateMachine: StateMachine
  public role: Role
  public team: Team

  constructor(game: Game, config: CourtPlayerConfig) {
    this.game = game
    const { position, texture, role, team } = config
    this.role = role
    this.team = team
    this.sprite = this.game.physics.add.sprite(position.x, position.y, texture).setDepth(2)
    this.sprite.setData('ref', this)
    this.game.physics.world.enable(this.sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)
    this.sprite.setScale(0.5)
    this.stateMachine = new StateMachine(
      PlayerStates.WAIT,
      {
        [PlayerStates.WAIT]: new WaitState(),
        [PlayerStates.MOVE_TO_SPOT]: new MoveToSpotState(),
        [PlayerStates.PLAYER_CONTROL]: new PlayerControlState(),
      },
      [this, this.team]
    )
  }

  setVelocity(xVel: number, yVel: number) {
    if (xVel != 0) {
      this.sprite.setFlipX(xVel < 0)
    }
    this.sprite.setVelocity(xVel, yVel)
  }

  setVelocityX(xVelocity: number) {
    if (xVelocity != 0) {
      this.sprite.setFlipX(xVelocity < 0)
    }
    this.sprite.setVelocityX(xVelocity)
  }

  setVelocityY(yVelocity: number) {
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

  setState(state: string) {
    this.stateMachine.transition(state)
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

  update() {
    this.stateMachine.step()
    this.moveTowardsTarget()
  }
}
