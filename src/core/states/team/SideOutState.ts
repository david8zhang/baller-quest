import { Team } from '~/core/teams/Team'
import Game from '~/scenes/Game'
import { UI } from '~/scenes/UI'
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
    if (!isDefending) {
      const inboundPlayer = team.courtPlayers[0]
      const receiveInboundPlayer = team.courtPlayers[1]
      const opposingHoop = team.getOpposingTeam().getHoop()
      team.getBall().updatePlayerWithBall(inboundPlayer)
      team.getBall().setPosition(inboundPlayer.sprite.x, inboundPlayer.sprite.y)
      const lineToOpposingHoop = new Phaser.Geom.Line(
        posToInboundFrom.x,
        posToInboundFrom.y,
        opposingHoop.sprite.x,
        opposingHoop.sprite.y
      )
      const positionToReceiveInbound = lineToOpposingHoop.getPoint(0.2)

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

  exit() {
    Game.instance.isHandlingOutOfBounds = false
  }
}
