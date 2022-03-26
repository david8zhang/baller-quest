import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/Team'
import { State } from '../StateMachine'

export class MoveToSpotState extends State {
  execute(player: CourtPlayer, team: Team) {
    const offensiveFormation = team.getOffensiveFormation()
    const spotZoneId = offensiveFormation[player.role]
    const zone = team.game.getZoneForZoneId(spotZoneId)
    if (zone) {
      player.setMoveTarget({
        x: zone.centerPosition.x,
        y: zone.centerPosition.y,
      })
    }
  }
}
