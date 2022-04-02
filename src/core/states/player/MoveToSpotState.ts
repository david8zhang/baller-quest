import { CourtPlayer } from '~/core/CourtPlayer'
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
        const randValue = Phaser.Math.Between(0, 100)
        player.shootBall(randValue <= 40)
      } else {
        player.setMoveTarget({
          x: zone.centerPosition.x,
          y: zone.centerPosition.y,
        })
      }
    }
  }
}
