import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { Constants } from '~/utils/Constants'
import { State } from '../../StateMachine'
import { PlayerStates } from '../../StateTypes'

export class GoToOpenSpot extends State {
  public destinationZoneId: number = -1

  enter(player: CourtPlayer, team: Team) {
    const openSpots = Constants.getZonesForDriveDirection(team.driveDirection)
    this.destinationZoneId = this.getOpenSpot(player, team, openSpots)
    const zone = team.game.court.getZoneForZoneId(this.destinationZoneId)
    player.setMoveTarget(zone!.centerPosition)
  }

  execute(player: CourtPlayer, team: Team) {
    const zone = team.game.court.getZoneForZoneId(this.destinationZoneId)
    if (zone) {
      if (Constants.IsAtPosition(player, zone.centerPosition)) {
        player.setState(PlayerStates.SMART_OFFENSE)
      }
    }
  }

  getOpenSpot(currPlayer: CourtPlayer, team: Team, allSpots: number[]) {
    const openSpots = allSpots.filter((spot: number) => {
      return !this.isOtherTeammateMovingToSpot(spot, team)
    })
    return openSpots[Phaser.Math.Between(0, openSpots.length - 1)]
  }

  isOtherTeammateMovingToSpot(spot: number, team: Team) {
    return team.courtPlayers.find((player: CourtPlayer) => {
      if (player.getCurrentState() === PlayerStates.GO_TO_OPEN_SPOT) {
        const state = player.getCurrentStateFull() as GoToOpenSpot
        return state.destinationZoneId === spot
      }
      const zoneId = team.game.court.getNearestZoneForPosition({
        x: player.sprite.x,
        y: player.sprite.y,
      })
      return spot === zoneId
    })
  }
}
