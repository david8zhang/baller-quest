import { CourtPlayer } from '~/core/CourtPlayer'
import { State } from '../../StateMachine'

export class ChaseReboundState extends State {
  execute(courtPlayer: CourtPlayer) {
    const team = courtPlayer.team
    const ball = team.getBall()
    courtPlayer.setMoveTarget({
      x: ball.sprite.x,
      y: ball.sprite.y,
    })
  }
}
