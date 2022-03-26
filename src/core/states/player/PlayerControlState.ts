import { CourtPlayer } from '~/core/CourtPlayer'
import { State } from '../StateMachine'

export class PlayerControlState extends State {
  enter(player: CourtPlayer) {
    player.setMoveTarget(null)
    player.setVelocity(0, 0)
  }
}
