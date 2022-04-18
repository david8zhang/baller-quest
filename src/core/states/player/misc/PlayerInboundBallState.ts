import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { Constants } from '~/utils/Constants'
import { State } from '../../StateMachine'

export class PlayerInboundBallState extends State {
  private positionToInboundFrom: Phaser.Math.Vector2 | null = null
  private positionToReceiveInbound!: Phaser.Math.Vector2
  private playerToReceiveInbound: CourtPlayer | null = null
  private timeout: number = 0
  private timeStamp = 0

  enter(
    player: CourtPlayer,
    team: Team,
    positionToInboundFrom: Phaser.Math.Vector2,
    positionToReceiveInbound: Phaser.Math.Vector2,
    playerToReceiveInbound: CourtPlayer,
    timeout: number = 0
  ) {
    this.positionToInboundFrom = positionToInboundFrom
    this.positionToReceiveInbound = positionToReceiveInbound
    this.playerToReceiveInbound = playerToReceiveInbound
    this.timeout = timeout
  }

  execute(courtPlayer: CourtPlayer, team: Team) {
    const ball = team.getBall()
    if (ball.isInPossessionOf(courtPlayer)) {
      if (
        this.playerToReceiveInbound &&
        Constants.IsAtPosition(courtPlayer, this.positionToInboundFrom!) &&
        Constants.IsAtPosition(this.playerToReceiveInbound, this.positionToReceiveInbound)
      ) {
        if (this.timeStamp === 0) {
          this.timeStamp = Date.now()
        }
        if (Date.now() - this.timeStamp >= this.timeout) {
          courtPlayer.passBall(this.playerToReceiveInbound!, true)
        }
      } else {
        courtPlayer.setMoveTarget(this.positionToInboundFrom)
      }
    } else {
      courtPlayer.setMoveTarget(ball.sprite)
    }
  }

  exit(...args: any[]): void {
    this.timeStamp = 0
  }
}
