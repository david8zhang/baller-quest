import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { State } from '../StateMachine'
import { PlayerStates } from '../StateTypes'

export class SetScreenState extends State {
  private nextActionEvent: Phaser.Time.TimerEvent | null = null

  enter(courtPlayer: CourtPlayer, team: Team, playerToScreenFor: CourtPlayer) {
    const defender = playerToScreenFor.currDefender
    if (defender) {
      const graphics = team.game.add.graphics()
      graphics.lineStyle(1, 0x00ff00)
      const screenLine = new Phaser.Geom.Line(
        defender.sprite.x,
        defender.sprite.y,
        playerToScreenFor.sprite.x,
        playerToScreenFor.sprite.y
      )
      Phaser.Geom.Line.Rotate(screenLine, Phaser.Math.DegToRad(90))
      Phaser.Geom.Line.CenterOn(screenLine, defender.sprite.x, defender.sprite.y)
      Phaser.Geom.Line.Extend(screenLine, 25, 25)
      const screenPos = screenLine.getPointA()
      courtPlayer.setMoveTarget({
        x: screenPos.x,
        y: screenPos.y,
      })
      courtPlayer.toggleColliderWithOtherPlayer(defender)
    }
    if (this.nextActionEvent) {
      this.nextActionEvent.destroy()
    }
    this.nextActionEvent = team.game.time.addEvent({
      delay: 2500,
      callback: () => {
        courtPlayer.clearColliders()
        courtPlayer.setState(PlayerStates.DRIVE_TO_BASKET)
      },
    })
  }
}
