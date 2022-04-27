import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { CourtPlayer } from '../CourtPlayer'
import { TeamStates } from '../states/StateTypes'
import { DriveDirection, Side, Team } from './Team'

export class CPUTeam extends Team {
  constructor(game: Game) {
    super(game, {
      initialState: TeamStates.TIPOFF,
      side: Side.CPU,
      driveDirection: DriveDirection.RIGHT,
    })
  }

  getOpposingTeam(): Team {
    return this.game.playerTeam
  }

  shoot(courtPlayer: CourtPlayer, team: Team, timeout?: number) {}
}
