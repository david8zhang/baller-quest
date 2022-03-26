import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { State } from '../StateMachine'
import { PlayerStates } from '../StateTypes'

export class DefenseState extends State {
  execute(team: Team) {
    team.courtPlayers.forEach((player: CourtPlayer) => {
      if (player.getCurrentState() != PlayerStates.PLAYER_CONTROL) {
        player.setState(PlayerStates.DEFEND_MAN)
      }
    })
  }
}
