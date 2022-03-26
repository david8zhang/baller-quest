import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { State } from '../StateMachine'

export class DefendManState extends State {
  private defensiveAssignment: CourtPlayer | null = null

  execute(player: CourtPlayer, team: Team) {
    const opposingTeam = team.getOpposingTeam()
    if (!this.defensiveAssignment) {
      this.defensiveAssignment =
        opposingTeam.courtPlayers.find((p) => {
          return p.role == player.role
        }) || null
    }
    const currHoop = team.getHoop()
    const line = new Phaser.Geom.Line(
      this.defensiveAssignment!.sprite.x,
      this.defensiveAssignment!.sprite.y,
      currHoop.sprite.x,
      currHoop.sprite.y
    )
    const pointOnLine = line.getPoint(0.2)
    player.setMoveTarget(pointOnLine)
  }
}
