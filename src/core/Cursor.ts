import Game from '~/scenes/Game'
import { CourtPlayer } from './CourtPlayer'

export interface CursorConfig {
  color: number
  alpha?: number
  position: { x: number; y: number }
}

export class Cursor {
  private game: Game
  protected selectedCourtPlayer?: CourtPlayer
  public highlight: Phaser.GameObjects.Ellipse

  constructor(config: CursorConfig, game: Game) {
    this.game = game
    const { x, y } = config.position
    this.highlight = this.game.add
      .ellipse(x, y, 20, config.color)
      .setStrokeStyle(4, config.color)
      .setAlpha(config.alpha || 1)
      .setOrigin(0)
      .setVisible(false)
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

  setVisible(isVisible: boolean) {
    this.highlight.setVisible(isVisible)
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
