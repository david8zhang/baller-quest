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
    const randValue = Phaser.Math.Between(0, 100)
    const shotType = team.game.court.getShotType(
      {
        x: player.sprite.x,
        y: player.sprite.y,
      },
      team.driveDirection
    )
    player.shootBall(
      randValue <= 40,
      shotType,
      Phaser.Math.Between(0, 1) === 0 ? MissType.UNDERSHOT : MissType.OVERSHOT
    )
  }
}
