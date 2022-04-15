import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { State } from '../StateMachine'

export class CutOffDriveState extends State {
  private positionOnWall!: number
  enter(player: CourtPlayer, team: Team, position: number) {
    this.positionOnWall = position
  }

  execute(player: CourtPlayer, team: Team, position: number) {
    const ballHandler = team.getBall().getPlayer()
    const hoop = team.getHoop()
    if (ballHandler) {
      const rayToHoop = new Phaser.Geom.Line(
        ballHandler.sprite.x,
        ballHandler.sprite.y,
        hoop.sprite.x,
        hoop.sprite.y
      )

      const pointOnLine = rayToHoop.getPoint(0.2)
      const wall = new Phaser.Geom.Line(0, 0, 300, 0)
      Phaser.Geom.Line.CenterOn(wall, pointOnLine.x, pointOnLine.y)
      const angle = Phaser.Geom.Line.NormalAngle(rayToHoop)
      Phaser.Geom.Line.Rotate(wall, angle)

      const pointOnWallToDefend = wall.getPoint(this.positionOnWall)
      player.defend(
        {
          x: pointOnWallToDefend.x,
          y: pointOnWallToDefend.y,
        },
        0
      )
      player.toggleColliderWithOtherPlayer(ballHandler)
    }
  }
}
