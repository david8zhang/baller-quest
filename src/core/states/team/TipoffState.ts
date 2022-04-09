import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { State } from '../StateMachine'
import { PlayerStates } from '../StateTypes'

export class TipOffState extends State {
  enter(team: Team) {
    team.courtPlayers.forEach((player: CourtPlayer) => {
      player.setState(PlayerStates.WAIT)
    })
  }
}
