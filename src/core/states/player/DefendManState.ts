import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { State } from '../StateMachine'

export class DefendManState extends State {
  execute(player: CourtPlayer, team: Team) {
    const opposingTeam = team.getOpposingTeam()
    if (!player.defensiveAssignment) {
      const defensiveAssignment =
        opposingTeam.courtPlayers.find((p) => {
          return p.role == player.role
        }) || null
      if (defensiveAssignment) {
        player.setDefensiveAssignment(defensiveAssignment)
        defensiveAssignment.setDefender(player)
      }
    }

    // Onball defense
    const currHoop = team.getHoop()
    const line = new Phaser.Geom.Line(
      player.defensiveAssignment!.sprite.x,
      player.defensiveAssignment!.sprite.y,
      currHoop.sprite.x,
      currHoop.sprite.y
    )
    let defensiveSpacing = line.getPoint(0.2)
    if (player.defensiveAssignment && team.getBall().isInPossessionOf(player.defensiveAssignment)) {
      defensiveSpacing = line.getPoint(0.1)
      player.playIntenseDefense()
    } else {
      player.stopPlayingIntenseDefense()
    }

    player.setMoveTarget(defensiveSpacing)
  }
}
