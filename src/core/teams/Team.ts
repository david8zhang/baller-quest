import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { CourtPlayer } from '../CourtPlayer'
import { Hoop } from '../Hoop'
import { StateMachine } from '../states/StateMachine'
import { TeamStates } from '../states/StateTypes'
import { DefenseState } from '../states/team/DefenseState'
import { InboundBallState } from '../states/team/InboundBallState'
import { OffenseState } from '../states/team/OffenseState'
import { TipOffState } from '../states/team/TipoffState'

export enum DriveDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum Side {
  CPU = 'CPU',
  PLAYER = 'PLAYER',
  NONE = 'None',
}

export interface TeamConfig {
  initialState: TeamStates
  side: Side
  driveDirection: DriveDirection
}

export abstract class Team {
  public game: Game
  public courtPlayers: CourtPlayer[] = []
  public stateMachine!: StateMachine
  public side!: Side
  public driveDirection!: DriveDirection
  public courtPlayerGroup!: Phaser.GameObjects.Group
  protected selectedCourtPlayer!: CourtPlayer

  constructor(game: Game, config: TeamConfig) {
    this.game = game
    this.side = config.side
    this.driveDirection = config.driveDirection
    this.createCourtPlayers()
    this.stateMachine = new StateMachine(
      config.initialState,
      {
        [TeamStates.INBOUND_BALL]: new InboundBallState(),
        [TeamStates.TIPOFF]: new TipOffState(),
        [TeamStates.DEFENSE]: new DefenseState(),
        [TeamStates.OFFENSE]: new OffenseState(),
      },
      [this]
    )
  }

  public abstract getHoop(): Hoop

  getBall() {
    return this.game.ball
  }

  createCourtPlayers() {
    this.courtPlayerGroup = this.game.add.group()
    const configs =
      this.driveDirection === DriveDirection.LEFT ? Constants.LEFT_SIDE : Constants.RIGHT_SIDE

    for (let i = 0; i < configs.length; i++) {
      const configObj = configs[i]
      const { zoneId, role } = configObj
      const zone = this.game.getZoneForZoneId(zoneId)
      if (zone) {
        const { centerPosition } = zone
        const courtPlayer = new CourtPlayer(this.game, {
          position: centerPosition,
          team: this,
          role: role,
          texture: this.side === Side.PLAYER ? 'player' : 'cpu-player',
          name: Constants.generateRandomName(),
        })
        this.courtPlayers.push(courtPlayer)
        this.courtPlayerGroup.add(courtPlayer.sprite)
      }
    }
    // Add a collider for the ball
    this.game.physics.add.overlap(this.courtPlayerGroup, this.game.ball.sprite, (obj1) => {
      const collidedPlayer = obj1.getData('ref') as CourtPlayer
      this.game.ball.setPlayer(collidedPlayer)
      this.selectCourtPlayer(collidedPlayer)
    })
  }

  getCurrentState(): string {
    return this.stateMachine.getState()
  }

  setState(state: TeamStates, ...args: any[]) {
    this.stateMachine.transition(state, ...args)
  }

  getOffensiveFormation() {
    return this.driveDirection === DriveDirection.LEFT
      ? Constants.OFFENSE_FROM_LEFT
      : Constants.OFFENSE_FROM_RIGHT
  }

  selectCourtPlayer(courtPlayer: CourtPlayer) {
    if (this.selectedCourtPlayer) this.selectedCourtPlayer.setVelocity(0, 0)
    this.selectedCourtPlayer = courtPlayer
  }

  getSelectedCourtPlayer() {
    return this.selectedCourtPlayer
  }

  public update() {
    this.stateMachine.step()
    this.courtPlayers.forEach((courtPlayer: CourtPlayer) => {
      courtPlayer.update()
    })
  }

  public abstract getOpposingTeam(): Team
}
