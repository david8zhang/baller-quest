import Game from '~/scenes/Game'
import { CourtPlayer } from './CourtPlayer'

export class Cursor {
  private game: Game
  private selectedCourtPlayer?: CourtPlayer
  public highlight: Phaser.GameObjects.Ellipse

  constructor(position: { x: number; y: number }, game: Game) {
    this.game = game
    const { x, y } = position
    this.highlight = this.game.add
      .ellipse(x, y, 20, 0x00ff00)
      .setStrokeStyle(4, 0x00ff00)
      .setOrigin(0)
  }

  highlightCourtPlayer(courtPlayer: CourtPlayer) {
    const courtPlayerSprite = courtPlayer.sprite
    this.highlight.setSize(courtPlayerSprite.displayWidth, 30)
    this.highlight.setVisible(true)
    this.highlight.setPosition(
      courtPlayerSprite.x - courtPlayerSprite.displayWidth / 2,
      courtPlayerSprite.y + 10
    )
  }

  selectCourtPlayer(courtPlayer: CourtPlayer) {
    this.selectedCourtPlayer = courtPlayer
    this.highlightCourtPlayer(courtPlayer)
  }

  follow() {
    if (this.selectedCourtPlayer) {
      const courtPlayerSprite = this.selectedCourtPlayer.sprite
      this.highlight.setPosition(
        courtPlayerSprite.x - courtPlayerSprite.displayWidth / 2,
        courtPlayerSprite.y + 10
      )
    }
  }
}
