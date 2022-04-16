import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { State } from '../../StateMachine'
import { PlayerStates } from '../../StateTypes'

export class DefendManState extends State {
  private customDefensiveAssignment: CourtPlayer | undefined
  enter(player: CourtPlayer, team: Team, customDefensiveAssignment?: CourtPlayer) {
    this.customDefensiveAssignment = customDefensiveAssignment
  }

  execute(player: CourtPlayer, team: Team) {
    const defensiveAssignment = this.customDefensiveAssignment
      ? this.customDefensiveAssignment
      : player.getPlayerToDefend()

    // If the defensive assignment is inbounding, go to where the defensive assignment will eventually be
    let defenderPosition = {
      x: defensiveAssignment!.sprite.x,
      y: defensiveAssignment!.sprite.y,
    }
    if (
      defensiveAssignment!.getCurrentState() == PlayerStates.INBOUND_BALL ||
      defensiveAssignment!.getCurrentState() === PlayerStates.RECEIVE_INBOUND
    ) {
      const enemyTeam = team.getOpposingTeam()
      const offensiveFormation = enemyTeam.getOffensiveFormation()
      const attackerPos = offensiveFormation[defensiveAssignment!.role]
      const zone = team.game.court.getZoneForZoneId(attackerPos)
      if (zone) {
        defenderPosition = zone.centerPosition
      }
    }
    const isOnBall = defensiveAssignment && team.getBall().isInPossessionOf(defensiveAssignment)
    player.defend(defenderPosition, isOnBall ? 0.15 : 0.25)
    if (isOnBall) {
      player.toggleColliderWithOtherPlayer(defensiveAssignment)
    } else {
      player.clearColliders()
    }
  }
}
