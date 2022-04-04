import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { Constants } from '~/utils/Constants'
import { State } from '../StateMachine'

export class PlayerInboundBallState extends State {
  private positionToInboundFrom: Phaser.Math.Vector2 | null = null
  private playerToReceiveInbound: CourtPlayer | null = null

  enter(
    player: CourtPlayer,
    team: Team,
    positionToInboundFrom: Phaser.Math.Vector2,
    playerToReceiveInbound: CourtPlayer
  ) {
    this.positionToInboundFrom = positionToInboundFrom
    this.playerToReceiveInbound = playerToReceiveInbound
  }

  execute(player: CourtPlayer, team: Team) {
    const ball = team.getBall()
    if (ball.isInPossessionOf(player)) {
      if (Constants.IsAtPosition(player, this.positionToInboundFrom!)) {
        ball.passTo(this.playerToReceiveInbound!, true)
      } else {
        player.setMoveTarget(this.positionToInboundFrom)
      }
    } else {
      player.setMoveTarget(ball.sprite)
    }
  }
}
