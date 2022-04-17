import { FieldZone } from '~/core/Court'
import { CourtPlayer } from '~/core/CourtPlayer'
import { Side, Team } from '~/core/teams/Team'
import { Constants } from '~/utils/Constants'
import { State } from '../../StateMachine'
import { PlayerStates } from '../../StateTypes'

export class MoveToSpotState extends State {
  private zoneToMoveTo: FieldZone | null = null

  enter(player: CourtPlayer, team: Team) {
    const offensiveFormation = team.getOffensiveFormation()
    const spotZoneId = offensiveFormation[player.role]
    this.zoneToMoveTo = team.game.getZoneForZoneId(spotZoneId)
    if (this.zoneToMoveTo) {
      player.setMoveTarget({
        x: this.zoneToMoveTo.centerPosition.x,
        y: this.zoneToMoveTo.centerPosition.y,
      })
    }
  }

  execute(player: CourtPlayer, team: Team) {
    if (this.zoneToMoveTo) {
      if (
        Constants.IsAtPosition(player, this.zoneToMoveTo.centerPosition) &&
        team.side === Side.CPU
      ) {
        player.setState(PlayerStates.SMART_OFFENSE)
      }
    }
  }
}
