import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { State } from '../StateMachine'

export class ShootingBallState extends State {
  execute(player: CourtPlayer, team: Team) {
    team.game.time.delayedCall(200, () => {
      team.shoot(player, team)
    })
  }
}
