import { BallState } from '~/core/Ball'
import { Court } from '~/core/Court'
import { Team } from '~/core/teams/Team'
import Game from '~/scenes/Game'
import { UI } from '~/scenes/UI'
import { Constants } from '~/utils/Constants'
import { State } from '../StateMachine'
import { PlayerStates } from '../StateTypes'

export class SideOutState extends State {
  enter(
    team: Team,
    isDefending: boolean,
    posToInboundFrom: {
      x: number
      y: number
    }
  ) {
    if (UI.instance.shotClock) {
      UI.instance.shotClock.resetShotClock()
      UI.instance.shotClock.stopClock()
    }

    team.getHoop().toggleRimCollider(false)
    team.getOpposingTeam().getHoop().toggleRimCollider(false)

    if (!isDefending) {
      const inboundPlayer = team.courtPlayers[0]
      const receiveInboundPlayer = team.courtPlayers[1]
      team.getBall().updatePlayerWithBall(inboundPlayer)
      team.getBall().setPosition(inboundPlayer.sprite.x, inboundPlayer.sprite.y)
      const positionToReceiveInbound = this.getClosestInBoundsZone(
        posToInboundFrom,
        team.game.court
      )

      // Move players to their positions
      inboundPlayer.setPosition(posToInboundFrom.x, posToInboundFrom.y)
      receiveInboundPlayer.setPosition(positionToReceiveInbound.x, positionToReceiveInbound.y)

      inboundPlayer.setState(
        PlayerStates.INBOUND_BALL,
        posToInboundFrom,
        positionToReceiveInbound,
        receiveInboundPlayer,
        1000
      )
      team.getBall().setInboundPassTarget(receiveInboundPlayer)
      receiveInboundPlayer.setState(PlayerStates.RECEIVE_INBOUND, positionToReceiveInbound)

      team.courtPlayers.forEach((player) => {
        if (player !== inboundPlayer && player !== receiveInboundPlayer) {
          player.setState(PlayerStates.SIDE_OUT_STATE, false)
        }
      })
    } else {
      team.courtPlayers.forEach((player) => {
        player.setState(PlayerStates.SIDE_OUT_STATE, true)
      })
    }
  }

  getClosestInBoundsZone(inboundPosition: { x: number; y: number }, court: Court) {
    let minDist = Number.MAX_SAFE_INTEGER
    let closestInboundsZone: any = {
      centerPosition: { x: 0, y: 0 },
    }
    Constants.ALL_INBOUND_ZONES.forEach((zoneId: number) => {
      const zone = court.getZoneForZoneId(zoneId)
      const distance = Constants.getDistanceBetween(zone!.centerPosition, inboundPosition)
      if (distance < minDist) {
        closestInboundsZone = zone
        minDist = distance
      }
    })
    return closestInboundsZone.centerPosition
  }

  exit() {
    Game.instance.isHandlingOutOfBounds = false
  }
}
