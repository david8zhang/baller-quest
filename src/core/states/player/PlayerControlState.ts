import { CourtPlayer } from '~/core/CourtPlayer'
import { State } from '../StateMachine'
import { PlayerStates } from '../StateTypes'

export class PlayerControlState extends State {
  public prevState: PlayerStates | null = null

  enter(player: CourtPlayer, prevState: PlayerStates) {
    this.prevState = prevState
    player.setMoveTarget(null)
    player.setVelocity(0, 0)
  }
}
