import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { State } from '../../StateMachine'
import { PlayerStates } from '../../StateTypes'

export class SideOutState extends State {
  enter(courtPlayer: CourtPlayer, team: Team, isDefending?: boolean) {
    if (
      courtPlayer.getCurrentState() !== PlayerStates.INBOUND_BALL &&
      courtPlayer.getCurrentState() !== PlayerStates.RECEIVE_INBOUND
    ) {
      if (courtPlayer.moveTarget) {
        courtPlayer.setMoveTarget(null)
      }
      courtPlayer.setVelocity(0, 0)
      if (!isDefending) {
        const formation = team.getOffensiveFormation()
        const zoneId = formation[courtPlayer.role]
        const zone = team.game.court.getZoneForZoneId(zoneId)
        if (zone) {
          courtPlayer.setPosition(zone.centerPosition.x, zone.centerPosition.y)
        }
      } else {
        const defensiveAssignment = courtPlayer.getPlayerToDefend()
        const formation = team.getOpposingTeam().getOffensiveFormation()
        const zoneId = formation[defensiveAssignment.role]
        const zone = team.game.court.getZoneForZoneId(zoneId)
        if (zone) {
          const currHoop = team.getHoop()
          const line = new Phaser.Geom.Line(
            zone.centerPosition.x,
            zone.centerPosition.y,
            currHoop.sprite.x,
            currHoop.sprite.y
          )
          const defenderPosition = line.getPoint(0.2)
          courtPlayer.setPosition(defenderPosition.x, defenderPosition.y)
        }
      }
    }
  }
}
