import { BallState } from '~/core/Ball'
import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { State } from '../StateMachine'
import { PlayerStates } from '../StateTypes'

export class DefenseState extends State {
  execute(team: Team) {
    team.courtPlayers.forEach((player: CourtPlayer) => {
      if (player.getCurrentState() !== PlayerStates.PLAYER_CONTROL) {
        if (team.getBall().currState === BallState.LOOSE) {
          player.setState(PlayerStates.CHASE_REBOUND)
        } else {
          const defensiveAssignment = player.getDefaultDefender()
          if (defensiveAssignment.getCurrentState() == PlayerStates.SET_SCREEN) {
            player.setState(PlayerStates.DEFEND_BALL_HANDLER)
          } else {
            player.setState(PlayerStates.DEFEND_MAN)
          }
        }
      }
    })
  }
}
