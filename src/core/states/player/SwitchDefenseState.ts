import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { State } from '../StateMachine'

// Switch screen defense
export class SwitchDefense extends State {
  enter(player: CourtPlayer, team: Team) {
    const playerWithBall = team.getBall().getPlayer()
    if (playerWithBall) {
      player.setDefensiveAssignment(playerWithBall)
    }
  }

  execute(player: CourtPlayer) {
    if (player.defensiveAssignment) {
      player.defend(
        {
          x: player.defensiveAssignment.sprite.x,
          y: player.defensiveAssignment.sprite.y,
        },
        0.2
      )
    }
  }
}
