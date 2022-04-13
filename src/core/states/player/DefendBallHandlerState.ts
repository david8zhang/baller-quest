import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { State } from '../StateMachine'

// Switch screen defense
export class DefendBallHandlerState extends State {
  execute(player: CourtPlayer, team: Team) {
    const playerToDefend = team.getBall().getPlayer()
    if (playerToDefend) {
      player.defend(
        {
          x: playerToDefend.sprite.x,
          y: playerToDefend.sprite.y,
        },
        0.2
      )
    }
  }
}
