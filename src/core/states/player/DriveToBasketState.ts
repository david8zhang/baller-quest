import { CourtPlayer } from '~/core/CourtPlayer'
import { DriveDirection, Team } from '~/core/teams/Team'
import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { State } from '../StateMachine'
import { PlayerStates } from '../StateTypes'

export class DriveToBasketState extends State {
  public zoneToDriveToId: number = -1
  execute(player: CourtPlayer, team: Team) {
    const layupZones =
      team.driveDirection === DriveDirection.LEFT
        ? Constants.LAYUP_RANGE_RIGHT
        : Constants.LAYUP_RANGE_LEFT
    const randomZoneId = layupZones[0]
    const randomZone = Game.instance.court.getZoneForZoneId(randomZoneId)
    if (randomZone) {
      if (Constants.IsAtPosition(player, randomZone.centerPosition)) {
        team.shoot(player, team)
        player.setState(PlayerStates.WAIT)
      } else {
        player.setMoveTarget(randomZone.centerPosition)
      }
    }
  }
}
