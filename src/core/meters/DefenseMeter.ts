import Game from '~/scenes/Game'
import { TeamStates } from '../states/StateTypes'
import { PlayerTeam } from '../teams/PlayerTeam'
import { Team } from '../teams/Team'

export class DefenseMeter {
  public team: PlayerTeam
  public game: Game

  public detectDefenseEvent: Phaser.Time.TimerEvent
  public keyD: Phaser.Input.Keyboard.Key

  constructor(team: PlayerTeam, game: Game) {
    this.team = team
    this.game = game
    this.keyD = this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)

    this.detectDefenseEvent = this.game.time.addEvent({
      repeat: -1,
      delay: 1,
      callback: () => {
        if (this.keyD.isDown && team.getCurrentState() === TeamStates.DEFENSE) {
          const selectedPlayer = this.team.selectedCourtPlayer
          if (selectedPlayer) {
            const defensiveAssignment = selectedPlayer.getPlayerToDefend()
            const defensivePosition = selectedPlayer.defend(
              {
                x: defensiveAssignment.sprite.x,
                y: defensiveAssignment.sprite.y,
              },
              0.2
            )
            selectedPlayer.moveTowards(defensivePosition)
          }
        }
      },
    })
  }
}
