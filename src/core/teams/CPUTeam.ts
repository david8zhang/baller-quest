import Game from '~/scenes/Game'
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
}
