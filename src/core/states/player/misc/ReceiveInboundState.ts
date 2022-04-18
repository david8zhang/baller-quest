import { CourtPlayer } from '~/core/CourtPlayer'
import { PlayerTeam } from '~/core/teams/PlayerTeam'
import { Side, Team } from '~/core/teams/Team'
import { Constants } from '~/utils/Constants'
import { State } from '../../StateMachine'
import { PlayerStates, TeamStates } from '../../StateTypes'

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
      }
    } else {
      player.setMoveTarget(this.receiveInboundPosition!)
    }
  }
}
