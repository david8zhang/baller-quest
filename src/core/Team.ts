import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { CourtPlayer, Side } from './CourtPlayer'
import { StateMachine } from './states/StateMachine'
import { TeamStates } from './states/StateTypes'
import { DefenseState } from './states/team/DefenseState'
import { OffenseState } from './states/team/OffenseState'

export class Team {
  protected game: Game
  public courtPlayers: CourtPlayer[] = []
  public stateMachine!: StateMachine
  public side: Side = Side.NONE
  private courtPlayerGroup!: Phaser.GameObjects.Group
  protected selectedCourtPlayer!: CourtPlayer

  constructor(game: Game, initialState: TeamStates, side: Side) {
    this.game = game
    this.side = side
    console.log(initialState)
    this.stateMachine = new StateMachine(initialState, {
      [TeamStates.DEFENSE]: new DefenseState(),
      [TeamStates.OFFENSE]: new OffenseState(),
    })
    this.createCourtPlayers()
  }

  getBall() {
    return this.game.ball
  }

  createCourtPlayers() {
    this.courtPlayerGroup = this.game.add.group()
    const initialPositions =
      this.stateMachine.getInitialState() == TeamStates.OFFENSE
        ? Constants.OFFENSIVE_POSITIONS
        : Constants.DEFENSIVE_POSITIONS

    for (let i = 0; i < initialPositions.length; i++) {
      const zoneId = initialPositions[i]
      const zone = this.game.getZoneForZoneId(zoneId)
      if (zone) {
        const { centerPosition } = zone
        const courtPlayer = new CourtPlayer(this.game, {
          position: centerPosition,
          side: this.side,
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

  selectCourtPlayer(courtPlayer: CourtPlayer) {
    if (this.selectedCourtPlayer) this.selectedCourtPlayer.setVelocity(0, 0)
    this.selectedCourtPlayer = courtPlayer
  }

  public update() {
    this.stateMachine.step()
    this.courtPlayers.forEach((courtPlayer: CourtPlayer) => {
      courtPlayer.update()
    })
  }
}
