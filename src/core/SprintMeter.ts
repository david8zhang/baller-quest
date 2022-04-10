import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { CourtPlayer } from './CourtPlayer'
import { PlayerTeam } from './teams/PlayerTeam'

export class SprintMeter {
  private team: PlayerTeam
  private game: Game
  private detectSprintEvent: Phaser.Time.TimerEvent
  private keyShift: Phaser.Input.Keyboard.Key
  private sprintDuration = 0
  public isSprinting: boolean = false

  constructor(team: PlayerTeam, game: Game) {
    this.team = team
    this.game = game
    this.keyShift = this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)

    this.detectSprintEvent = this.game.time.addEvent({
      repeat: -1,
      delay: 1,
      callback: () => {
        if (this.keyShift.isDown) {
          this.isSprinting = true
          this.sprintDuration = Math.min(100, this.sprintDuration + 2)
        } else {
          this.isSprinting = false
          this.sprintDuration = Math.max(0, this.sprintDuration - 1)
        }
      },
    })
  }

  public getSpeed() {
    if (this.isSprinting) {
      if (this.sprintDuration >= 25 && this.sprintDuration < 75) {
        return Constants.COURT_PLAYER_SPRINT_SPEED
      }
      if (this.sprintDuration >= 75) {
        return Constants.COURT_PLAYER_SPEED
      }
      return Constants.COURT_PLAYER_SPEED
    } else {
      return Constants.COURT_PLAYER_SPEED
    }
  }
}
