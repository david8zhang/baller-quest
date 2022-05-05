import { CourtPlayer } from '~/core/CourtPlayer'
import { PlayerTeam } from '~/core/teams/PlayerTeam'
import { Side, Team } from '~/core/teams/Team'
import { UI } from '~/scenes/UI'
import { Constants } from '~/utils/Constants'
import { State } from '../../StateMachine'
import { TeamStates } from '../../StateTypes'

export class ReceiveInboundState extends State {
  public receiveInboundPosition: Phaser.Math.Vector2 | null = null

  enter(player: CourtPlayer, team: Team, receiveInboundPosition: Phaser.Math.Vector2) {
    this.receiveInboundPosition = receiveInboundPosition
  }

  execute(player: CourtPlayer, team: Team) {
    if (Constants.IsAtPosition(player, this.receiveInboundPosition!)) {
      const ball = team.getBall()
      if (ball.isInPossessionOf(player)) {
        player.team.setState(TeamStates.OFFENSE)
        player.team.getOpposingTeam().setState(TeamStates.DEFENSE)
        if (UI.instance.shotClock) {
          UI.instance.shotClock.startClock()
        }
      }
    } else {
      player.setMoveTarget(this.receiveInboundPosition!)
    }
  }
}
