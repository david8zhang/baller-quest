import { BallState } from '~/core/Ball'
import { CourtPlayer } from '~/core/CourtPlayer'
import { Side, Team } from '~/core/teams/Team'
import { UI } from '~/scenes/UI'
import { Constants } from '~/utils/Constants'
import { State } from '../StateMachine'
import { PlayerStates } from '../StateTypes'

export class InboundBallState extends State {
  public playerToInbound: CourtPlayer | null = null
  public playerToReceiveInbound: CourtPlayer | null = null

  enter(team: Team, outOfBoundsLocation?: Phaser.Math.Vector2) {
    if (UI.instance.shotClock) {
      UI.instance.shotClock.resetShotClock()
      UI.instance.shotClock.stopClock()
    }
    team.getHoop().toggleRimCollider(false)
    team.getOpposingTeam().getHoop().toggleRimCollider(false)

    team.getBall().setBallState(BallState.RETRIEVE_AFTER_SCORE)
    const hoopSprite = team.getHoop().sprite
    const inboundLocation = outOfBoundsLocation
      ? outOfBoundsLocation
      : new Phaser.Math.Vector2(hoopSprite.x, hoopSprite.y)
    const opposingHoop = team.getOpposingTeam().getHoop()
    const lineToOpposingHoop = new Phaser.Geom.Line(
      inboundLocation.x,
      inboundLocation.y,
      opposingHoop.sprite.x,
      opposingHoop.sprite.y
    )
    const positionToReceiveInbound = lineToOpposingHoop.getPoint(0.1)

    this.playerToInbound = Constants.getClosestPlayerToBall(team.getBall(), team.courtPlayers)
    this.playerToReceiveInbound = this.getPlayerToReceiveBall(team, this.playerToInbound!)
    this.playerToInbound!.setState(
      PlayerStates.INBOUND_BALL,
      inboundLocation,
      positionToReceiveInbound,
      this.playerToReceiveInbound
    )

    // Receive inbound
    this.playerToReceiveInbound!.setState(PlayerStates.RECEIVE_INBOUND, positionToReceiveInbound)
  }

  getPlayerToReceiveBall(team: Team, playerToInbound: CourtPlayer) {
    const eligiblePlayers = team.courtPlayers.filter((player) => {
      return player !== playerToInbound
    })
    const closestPlayerToBall = Constants.getClosestPlayerToBall(team.getBall(), eligiblePlayers)
    return closestPlayerToBall
  }

  execute(team: Team) {
    team.courtPlayers.forEach((p: CourtPlayer) => {
      if (p != this.playerToInbound && p !== this.playerToReceiveInbound) {
        p.setState(PlayerStates.MOVE_TO_SPOT)
      }
    })
  }
}
