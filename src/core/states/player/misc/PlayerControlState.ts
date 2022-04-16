import { CourtPlayer } from '~/core/CourtPlayer'
import { State } from '../../StateMachine'
import { PlayerStates, TeamStates } from '../../StateTypes'

export class PlayerControlState extends State {
  public prevState: PlayerStates | null = null

  enter(player: CourtPlayer, prevState: PlayerStates) {
    this.prevState = prevState
    player.setMoveTarget(null)
    player.setVelocity(0, 0)
  }

  execute(player: CourtPlayer) {
    if (player.team.getCurrentState() == TeamStates.DEFENSE) {
      const playerToDefend = player.getPlayerToDefend()
      player.toggleColliderWithOtherPlayer(playerToDefend)
    }
  }
}
