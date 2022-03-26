import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { State } from '../StateMachine'
import { PlayerStates } from '../StateTypes'

export class InboundBallState extends State {
  public playerToInbound: CourtPlayer | null = null
  public playerToReceiveInbound: CourtPlayer | null = null

  enter(team: Team, outOfBoundsLocation?: Phaser.Math.Vector2) {
    const hoopSprite = team.getHoop().sprite
    const inboundLocation = outOfBoundsLocation
      ? outOfBoundsLocation
      : new Phaser.Math.Vector2(hoopSprite.x, hoopSprite.y)
    this.playerToInbound = team.courtPlayers[0]
    this.playerToReceiveInbound = team.courtPlayers[1]
    this.playerToInbound.setState(
      PlayerStates.INBOUND_BALL,
      inboundLocation,
      this.playerToReceiveInbound
    )

    // Receive inbound
    const opposingHoop = team.getOpposingTeam().getHoop()
    const lineToOpposingHoop = new Phaser.Geom.Line(
      inboundLocation.x,
      inboundLocation.y,
      opposingHoop.sprite.x,
      opposingHoop.sprite.y
    )
    const positionToReceiveInbound = lineToOpposingHoop.getPoint(0.1)
    this.playerToReceiveInbound.setState(PlayerStates.RECEIVE_INBOUND, positionToReceiveInbound)
  }

  execute(team: Team) {
    team.courtPlayers.forEach((p: CourtPlayer) => {
      if (p != this.playerToInbound && p !== this.playerToReceiveInbound) {
        p.setState(PlayerStates.MOVE_TO_SPOT)
      }
    })
  }
}
