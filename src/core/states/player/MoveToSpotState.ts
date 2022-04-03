import { CourtPlayer } from '~/core/CourtPlayer'
import { MissType } from '~/core/ShotMeter'
import { Team } from '~/core/teams/Team'
import { Constants } from '~/utils/Constants'
import { State } from '../StateMachine'

export class MoveToSpotState extends State {
  execute(player: CourtPlayer, team: Team) {
    const offensiveFormation = team.getOffensiveFormation()
    const spotZoneId = offensiveFormation[player.role]
    const zone = team.game.getZoneForZoneId(spotZoneId)
    if (zone) {
      if (
        Constants.getDistanceBetween(player.sprite, zone.centerPosition) < 5 &&
        team.getBall().isInPossessionOf(player)
      ) {
        this.cpuTakeShot(player, team)
      } else {
        player.setMoveTarget({
          x: zone.centerPosition.x,
          y: zone.centerPosition.y,
        })
      }
    }
  }

  cpuTakeShot(player: CourtPlayer, team: Team) {
    team.shoot(player, team)
  }
}
