import Game from '~/scenes/Game'
import { Side } from './CourtPlayer'
import { TeamStates } from './states/StateTypes'
import { Team } from './Team'

export class CPU extends Team {
  constructor(game: Game) {
    super(game, TeamStates.DEFENSE, Side.CPU)
  }
}
