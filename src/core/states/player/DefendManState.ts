import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { State } from '../StateMachine'
import { PlayerStates } from '../StateTypes'

export class DefendManState extends State {
  enter(player: CourtPlayer, team: Team) {
    const opposingTeam = team.getOpposingTeam()
    const defensiveAssignment =
      opposingTeam.courtPlayers.find((p) => {
        return p.role == player.role
      }) || null
    if (defensiveAssignment) {
      player.setDefensiveAssignment(defensiveAssignment)
      defensiveAssignment.setDefender(player)
    }
  }

  execute(player: CourtPlayer, team: Team) {
    // If the defensive assignment is inbounding, go to where the defensive assignment will eventually be
    let defenderPosition = {
      x: player.defensiveAssignment!.sprite.x,
      y: player.defensiveAssignment!.sprite.y,
    }
    if (
      player.defensiveAssignment!.getCurrentState() == PlayerStates.INBOUND_BALL ||
      player.defensiveAssignment!.getCurrentState() === PlayerStates.RECEIVE_INBOUND
    ) {
      const enemyTeam = team.getOpposingTeam()
      const offensiveFormation = enemyTeam.getOffensiveFormation()
      const attackerPos = offensiveFormation[player.defensiveAssignment!.role]
      const zone = team.game.court.getZoneForZoneId(attackerPos)
      if (zone) {
        defenderPosition = zone.centerPosition
      }
    }
    const isOnBall =
      player.defensiveAssignment && team.getBall().isInPossessionOf(player.defensiveAssignment)
    player.defend(defenderPosition, isOnBall ? 0.1 : 0.2)
  }
}
