import { Team } from '~/core/Team'
import { State } from '../StateMachine'
import { PlayerStates } from '../StateTypes'

export class OffenseState extends State {
  execute(team: Team) {
    team.courtPlayers.forEach((player) => {
      if (player.getCurrentState() !== PlayerStates.PLAYER_CONTROL) {
        player.setState(PlayerStates.MOVE_TO_SPOT)
      }
    })
  }
}
